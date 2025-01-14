import { SynchronizedTime } from '@exodus/basic-utils'
import { Timer } from '@exodus/timer'
import EventEmitter from 'events/events.js' // forces it to use the module from node_modules
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { createConsoleLogger } from './console-logger.js'

const { partition } = lodash

const HOOK_TYPES = ['start', 'stop', 'update', 'tick', 'tick-multiple-wallet-accounts']

/**
 *
 * Base class for the different blockchain tx monitors.
 *
 *  class HelloMonitor extends BaseMonitor {
 *    setServer(servers) { .. }
 *    async tick({ refresh }) { .. }
 *  }
 *  Object.defineProperty(HelloMonitor, 'name', { value: 'HelloMonitor' })
 *
 *  export default (args) => new HelloMonitor({ ...args, interval: INTERVAL })
 *  }
 */
export class BaseMonitor extends EventEmitter {
  constructor({ asset, interval, assetClientInterface, runner = (run) => run(), logger }) {
    super()
    assert(asset, 'asset is required')
    assert(interval, 'interval is required')
    assert(assetClientInterface, 'assetClientInterface is required')
    assert(runner, 'runner is required')
    this.logger = logger || createConsoleLogger(`@exodus/${this.constructor.name}`)
    this.runner = runner
    this.asset = asset
    this.interval = interval
    this.timer = new Timer(interval)
    this.isStarted = false
    this.aci = assetClientInterface
    this.params = {} // @deprecated use object fields rather than generic params.
    this.hooks = HOOK_TYPES.reduce((acc, name) => {
      acc[`before-${name}`] = []
      acc[`after-${name}`] = []
      return acc
    }, {})
    this.tickCount = {}
  }

  /**
   * @deprecated use object fields rather than generic params.
   * @param params
   */
  setParams(params = {}) {
    Object.entries(params).forEach(([key, item]) => {
      assert(item, `required parameter ${key} missing in ${this.constructor.name}`)
    })
    this.params = { ...this.params, ...params }
  }

  // name: string
  // fn: async ({monitor})=>{}
  addHook(name, fn) {
    assert(typeof fn === 'function', 'hook must be a function')
    this.hooks[name].push(fn)
  }

  async _runHooks(name, params) {
    const allParams = { monitor: this, ...params }
    await Promise.all(
      this.hooks[name].map(async (hook) => {
        try {
          await hook(allParams)
        } catch (e) {
          this.logger.warn(
            `Error running hook ${name} for ${this.asset.name}. Error ${e.message || e}`,
            e
          )
        }
      })
    )
    this.emit(name, allParams)
  }

  start = async (options) => {
    if (this.timer.isRunning) return

    let tickOptions = options
    await this._runHooks('before-start', options)
    await this.timer.start(async () => {
      try {
        return await this.tickWalletAccounts(tickOptions)
      } finally {
        tickOptions = {}
      }
    })
    await this._runHooks('after-start', options)
  }

  stop = async () => {
    if (!this.timer.isRunning) return

    await this._runHooks('before-stop')
    await this.timer.stop()
    await this._runHooks('after-stop')
  }

  /**
   * It temporarily stops the monitor to perform a special tick.
   *
   * @param walletAccount tick a particular wallet account, leave empty to tick all accounts.
   * @param refresh perform a full refresh
   * @param highPriority don't wait for the runner, run now.
   * @param assetName tick a particular asset, leave empty to tick all assets.
   * @returns {Promise<void>}
   */
  update = async ({ walletAccount, refresh, highPriority, assetName } = {}) => {
    let error = null
    try {
      await this._runHooks('before-update', { walletAccount, refresh, highPriority, assetName })
      await this.timer.stop()
      await this.tickWalletAccounts({ walletAccount, refresh, highPriority, assetName })
    } catch (e) {
      error = e
      throw Object.assign(error, { walletAccount, refresh, highPriority, assetName })
    } finally {
      await this._runHooks('after-update', {
        error,
        walletAccount,
        refresh,
        highPriority,
        assetName,
      })
      await this.timer.start(() => this.tickWalletAccounts(), { delayedStart: true })
    }
  }

  /**
   * It refreshes the monitor for all the accounts stopping it first
   *
   * @deprecated use update
   *
   * @returns {Promise<void>}
   */
  refresh = async () => {
    this.logDeprecation('refresh', 'update')
    return this.update({ refresh: true })
  }

  /**
   * It ticks the monitor without stopping it.
   *
   * NOTE: Atm, Monero monitor overrides it on mobile. It cannot be a function field
   *
   * @param walletAccount tick a particular wallet account, leave empty to tick all accounts.
   * @param refresh perform a full refresh
   * @param highPriority don't wait for the runner, run now.
   * @param assetName tick a particular asset, leave empty to tick all assets.
   * @returns {Promise<void>}
   */
  async tickWalletAccounts({ walletAccount, refresh, highPriority, assetName } = {}) {
    const walletAccounts = await this.aci.getWalletAccounts({ assetName: this.asset.name })
    await this._runHooks('before-tick-multiple-wallet-accounts', {
      refresh,
      highPriority,
      assetName,
      walletAccounts,
    })
    let error = null
    try {
      await Promise.all(
        walletAccounts
          .filter(
            (existingWalletAccount) => !walletAccount || walletAccount === existingWalletAccount
          )
          .map((walletAccount) =>
            this.tickWithExtra({ walletAccount, refresh, highPriority, assetName })
          )
      )
    } catch (e) {
      error = e
      throw e
    } finally {
      await this._runHooks('after-tick-multiple-wallet-accounts', {
        error,
        refresh,
        highPriority,
        assetName,
        walletAccounts,
      })
    }
  }

  /**
   * It refreshes a particular wallet. If the assetName is provided, the monitor may decide to refresh all the tokens
   * or just that particular one depending on performance.
   *
   * @deprecated use update providing wallet account and asset name
   *
   * @param walletAccount the wallet account name to refresh
   * @param assetName optional - the particular asset to refresh. If not provided, all the assets.
   * @returns {Promise<void>} once the wallet was refreshed
   */
  refreshOneWallet = async (walletAccount, assetName) => {
    this.logDeprecation('refreshOneWallet', 'update')
    return this.update({ walletAccount, assetName, refresh: true })
  }

  setServer(servers) {
    throw new Error('Unimplemented')
  }

  /**
   * It ticks the monitor for all the accounts without stopping it.
   *
   * @deprecated use tickWalletAccounts
   *
   * @param refresh perform a full refresh
   * @param highPriority don't wait for the runner, run now.
   * @param assetName tick a particular asset, leave empty to tick all assets.
   * @returns {Promise<void>}
   */
  async tickAllWalletAccounts({ refresh, highPriority, assetName } = {}) {
    this.logDeprecation('tickAllWalletAccounts', 'tickWalletAccounts')
    return this.tickWalletAccounts({ refresh, highPriority, assetName })
  }

  tickWithExtra = async (options) => {
    let error = null
    const { walletAccount } = options
    this.tickCount[walletAccount] = this.tickCount[walletAccount] || 0
    try {
      await this._runHooks('before-tick', options)
      const tickNow = () => this.tick(options)
      if (options.highPriority) {
        await tickNow()
      } else {
        await this.runner(tickNow)
      }
    } catch (e) {
      error = e
      this.logger.error(`${this.constructor.name} ${error.name}: ${error.message}\n`, error, {
        ...error,
      })
    } finally {
      await this._runHooks('after-tick', { ...options, error })
      this.tickCount[walletAccount]++
    }
  }

  async tick({ refresh, walletAccount, highPriority }) {
    throw new Error('Unimplemented')
  }

  async updateAccountState({ assetName = this.asset.name, accountState, newData, walletAccount }) {
    return this.aci.updateAccountState({
      assetName,
      walletAccount,
      accountState,
      newData,
    })
  }

  async updateTxLog({
    assetName = this.asset.name,
    logItems,
    walletAccount,
    refresh,
    notifyCondition,
  }) {
    return this.aci.updateTxLogAndNotify({
      assetName,
      walletAccount,
      txs: logItems,
      refresh,
      notifyCondition,
    })
  }

  async removeFromTxLog(items) {
    for (const { tx, assetSource } of items) {
      const { asset: assetName, walletAccount } = assetSource
      await this.aci.removeTxLog({ assetName, walletAccount, txs: [tx] })
    }
  }

  getUnconfirmed({ txSet, staleTxAge }) {
    assert(txSet, 'txSet is required')
    assert(staleTxAge >= 0, 'staleTxAge must be a 0 or positive number')
    const relevantTxs = [...txSet].filter((tx) => !tx.confirmed && !tx.dropped)
    const [unconfirmed, stale] = partition(
      relevantTxs,
      (tx) => SynchronizedTime.now() - tx.date.valueOf() < staleTxAge
    )
    return {
      stale: stale.map((tx) => ({ ...tx, dropped: true })),
      unconfirmed: unconfirmed.map((tx) => tx.txId),
    }
  }

  async updateTxLogByAsset({ logItemsByAsset, walletAccount, refresh, notifyCondition }) {
    if (refresh) {
      // Batch is only in desktop, should these methods be removed?
      const batch = this.aci.createOperationsBatch()
      for (const [assetName, txs] of Object.entries(logItemsByAsset)) {
        this.aci.updateTxLogAndNotifyBatch({
          assetName,
          walletAccount,
          txs,
          refresh,
          batch,
        })
      }

      await this.aci.executeOperationsBatch(batch)
    } else {
      for (const [assetName, logItems] of Object.entries(logItemsByAsset)) {
        await this.updateTxLog({ assetName, logItems, walletAccount, refresh, notifyCondition })
      }
    }
  }

  logDeprecation = (method, alternative) => {
    const message = `monitor.${method}() is deprecated. Please use monitor.${alternative}(). Asset name ${this.asset.name}`
    // eslint-disable-next-line unicorn/error-message
    this.logger.log(message, new Error().stack)
  }
}
