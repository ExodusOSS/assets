import { BaseMonitor } from '@exodus/asset-lib'
import delay from 'delay'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import ms from 'ms'

import { normalizeInsightConfig, toWSUrl } from '../insight-api-client/util.js'
import InsightWSClient from '../insight-api-client/ws.js'
import { resolveUnconfirmedAncestorData } from '../unconfirmed-ancestor-data.js'
import { BitcoinMonitorScanner } from './bitcoin-monitor-scanner.js'

const { isEmpty, isEqual } = lodash

// NOTE: this is a frankenstein mashup of Exodus desktop
// assets-refresh/insight action + Neo monitor

export class Monitor extends BaseMonitor {
  #addressesByWalletAccount
  #runningByWalletAccount
  #wsInterval
  #ws
  #apiUrl
  #wsUrl
  #insightClient
  #yieldToUI
  #scanner
  #webSocketEnabled

  constructor({
    asset,
    interval = ms('45s'),
    wsInterval = ms('5m'),
    assetClientInterface,
    runner,
    yieldToUI = () => {},
    logger,
    insightClient,
    apiUrl,
    scanner,
    webSocketEnabled = true,
    ...extraScannerParams
  }) {
    super({ asset, interval, assetClientInterface, logger, runner })
    assert(insightClient, 'insightClient is required!')
    assert(apiUrl, 'apiUrl is required')
    assert(yieldToUI, 'yieldToUI is required!')
    this.#wsInterval = wsInterval
    this.#ws = null
    this.#apiUrl = apiUrl
    this.#yieldToUI = yieldToUI
    this.#webSocketEnabled = webSocketEnabled
    this.#wsUrl = null
    this.#runningByWalletAccount = Object.create(null)
    this.#addressesByWalletAccount = Object.create(null)
    this.#insightClient = insightClient
    this.#scanner =
      scanner ||
      new BitcoinMonitorScanner({
        asset,
        assetClientInterface,
        insightClient,
        yieldToUI,
        ...extraScannerParams,
      })

    this.addHook('after-tick-multiple-wallet-accounts', () => this.#subscribeToNewAddresses())
    this.addHook('before-stop', () => {
      if (this.#ws) {
        this.#ws.close()
        this.#ws = null
      }
    })
    this.addHook('after-stop', async () =>
      Promise.all(Object.keys(this.#runningByWalletAccount).map(this.#waitForWalletToFinish))
    )
  }

  setServer(assetConfig = {}) {
    const { apiUrl, wsUrl } = normalizeInsightConfig(assetConfig)
    if (apiUrl) {
      this.#insightClient.setBaseUrl(apiUrl)
    }

    if (!this.#wsUrl || this.#wsUrl !== wsUrl) {
      this.#connectWS(wsUrl || this.#wsUrl || toWSUrl(this.#apiUrl))
    }
  }

  #getReceiveAddressesByWalletAccount = async () => {
    const walletAccounts = await this.aci.getWalletAccounts({ assetName: this.asset.name })
    return Object.assign(
      Object.create(null),
      Object.fromEntries(
        await Promise.all(
          walletAccounts.map(async (walletAccount) => {
            const config = await this.aci.getAssetConfig?.({
              assetName: this.asset.name,
              walletAccount,
            })
            return [
              walletAccount,
              await this.aci.getReceiveAddresses({
                multiAddressMode: config?.multiAddressMode ?? true,
                assetName: this.asset.name,
                walletAccount,
                useCache: true,
              }),
            ]
          })
        )
      )
    )
  }

  #connectWS = async (wsUrl) => {
    if (!this.#webSocketEnabled) {
      return
    }

    if (this.#ws) {
      this.#ws.close()
      this.#ws = null
    }

    this.#wsUrl = wsUrl
    if (!wsUrl) {
      return
    }

    this.#addressesByWalletAccount = await this.#getReceiveAddressesByWalletAccount()

    const addressesArr = Object.values(this.#addressesByWalletAccount).flat()

    if (addressesArr.length === 0) {
      this.#logWsStatus('no addressesArr to subscribe')
      return
    }

    this.#ws = new InsightWSClient(wsUrl, this.asset.name)
    this.#ws.connect(addressesArr)
    this.#ws.on('connect', () => {
      this.#logWsStatus('connect to addresses', addressesArr)
      this.timer.setNewInterval(this.#wsInterval)
    })
    this.#ws.on('message', ({ address }) => {
      const walletAccount = Object.keys(this.#addressesByWalletAccount).find((walletAccount) =>
        this.#addressesByWalletAccount[walletAccount].includes(address)
      )
      this.tickWalletAccounts({ walletAccount })
    })
    this.#ws.on('block', () => this.onNewBlock())
    this.#ws.on('disconnect', () => {
      this.#logWsStatus('disconnect')
      this.timer.setNewInterval(this.interval)
    })
    this.#ws.on('reconnect', () => {
      this.#logWsStatus('reconnect')
      this.tickWalletAccounts()
    })
  }

  async onNewBlock() {
    await this.#yieldToUI(100)
    const aci = this.aci
    const asset = this.asset
    const assetName = asset.name
    const walletAccounts = await aci.getWalletAccounts({ assetName })
    for (const walletAccount of walletAccounts) {
      const { txsToUpdate, utxos, ordinalsUtxos } = await this.#scanner.rescanOnNewBlock({
        walletAccount,
      })

      const newData = {}
      if (utxos) newData.utxos = utxos
      if (ordinalsUtxos) newData.ordinalsUtxos = ordinalsUtxos

      if (txsToUpdate.length > 0) {
        await this.updateTxLog({ assetName, walletAccount, logItems: txsToUpdate })
        if (utxos && ['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(assetName)) {
          const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
            utxos,
            insightClient: this.#insightClient,
          })
          newData.mem = { unconfirmedTxAncestor }
        }
      }

      await aci.updateAccountState({
        assetName,
        walletAccount,
        newData,
      })
    }
  }

  #subscribeToNewAddresses = async () => {
    const newAddressesByWalletAccount = await this.#getReceiveAddressesByWalletAccount()
    if (!isEqual(newAddressesByWalletAccount, this.#addressesByWalletAccount)) {
      await this.#connectWS(this.#wsUrl)
    }
  }

  tick = async ({ walletAccount, refresh }) => {
    assert(walletAccount, 'walletAccount is expected')
    // 1) if no tick is running, any tick runs
    // 2) if a regular tick is running, a refresh tick waits and runs
    // 3) if a regular tick is running, a regular tick does not wait and does not run
    // 4) if a refresh tick is running, a refresh tick does not wait and does not run
    // 5) if a refresh tick is running, a regular tick does not wait and does not run
    if (refresh && this.#runningByWalletAccount[walletAccount]?.refresh !== refresh) {
      await this.#waitForWalletToFinish(walletAccount)
    }

    if (this.#runningByWalletAccount[walletAccount]) {
      this.logger.debug(`Skipping ${walletAccount} tick as previous tick is still running`)
      return
    }

    const promise = this.#syncWalletAccount({ walletAccount, refresh })
    this.#runningByWalletAccount[walletAccount] = { refresh, promise }
    try {
      await promise

      if (!refresh) {
        try {
          await this.onNewBlock()
        } catch {}
      }
    } finally {
      delete this.#runningByWalletAccount[walletAccount]
    }
  }

  #syncWalletAccount = async ({ walletAccount, refresh }) => {
    const aci = this.aci
    const assetName = this.asset.name
    // wait for all wallet accounts to load
    await aci.getWalletAccounts({ assetName })

    const { txsToAdd, txsToUpdate, utxos, ordinalsUtxos, changedUnusedAddressIndexes } =
      await this.#scanner.rescanBlockchainInsight({
        walletAccount,
        refresh,
      })

    const newData = {}
    if (utxos) newData.utxos = utxos
    if (ordinalsUtxos) newData.ordinalsUtxos = ordinalsUtxos

    if (!isEmpty(changedUnusedAddressIndexes)) {
      // Only for mobile atm, browser and hydra calculates from the latest txLogs
      await aci.saveUnusedAddressIndexes({
        assetName,
        walletAccount,
        changedUnusedAddressIndexes,
      })
    }

    const txs = [...txsToUpdate, ...txsToAdd]

    if (txs.length > 0) {
      await this.updateTxLog({
        assetName,
        logItems: txs,
        walletAccount,
        refresh,
      })
    }

    // Move to after tick
    if (utxos && ['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(assetName)) {
      const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
        utxos,
        insightClient: this.#insightClient,
      })
      newData.mem = { unconfirmedTxAncestor }
    }

    await aci.updateAccountState({
      assetName,
      walletAccount,
      newData,
    })
  }

  #logWsStatus = (message, ...args) => {
    // console.debug('btc-like monitor', this.asset.name, message, ...args)
  }

  #waitForWalletToFinish = async (walletAccount) => {
    const tickState = this.#runningByWalletAccount[walletAccount]
    if (!tickState) return

    const finished = await Promise.race([
      tickState.promise.then(() => true),
      delay(ms('10s')).then(() => false),
    ])

    if (!finished) {
      this.logger.warn(`Tick for ${walletAccount} did not finish on time`)
    }
  }
}

export const createBitcoinMonitor = (args) => new Monitor(args)
