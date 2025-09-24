import { BaseMonitor } from '@exodus/asset-lib'
import _ from 'lodash'
import assert from 'minimalistic-assert'
import ms from 'ms'

import { DEFAULT_POOL_ADDRESS } from '../account-state.js'

const DEFAULT_REMOTE_CONFIG = {
  rpcs: [],
  ws: [],
  staking: { enabled: true, pool: DEFAULT_POOL_ADDRESS },
}

const TICKS_BETWEEN_HISTORY_FETCHES = 10
const TICKS_BETWEEN_STAKE_FETCHES = 5
const TX_STALE_AFTER = ms('2m') // mark txs as dropped after N minutes
const FORCE_HTTP = true // use https over ws

export class SolanaMonitor extends BaseMonitor {
  constructor({
    api,
    includeUnparsed = false,
    ticksBetweenHistoryFetches = TICKS_BETWEEN_HISTORY_FETCHES,
    ticksBetweenStakeFetches = TICKS_BETWEEN_STAKE_FETCHES,
    txsLimit,
    shouldUpdateBalanceBeforeHistory = true,
    ...args
  }) {
    super(args)
    assert(api, 'api is required')
    this.api = api
    this.cursors = {}
    this.assets = {}
    this.staking = DEFAULT_REMOTE_CONFIG.staking
    this.ticksBetweenStakeFetches = ticksBetweenStakeFetches
    this.ticksBetweenHistoryFetches = ticksBetweenHistoryFetches
    this.shouldUpdateBalanceBeforeHistory = shouldUpdateBalanceBeforeHistory
    this.includeUnparsed = includeUnparsed
    this.txsLimit = txsLimit
    this.addHook('before-stop', (...args) => this.beforeStop(...args))
  }

  async beforeStop() {
    const walletAccounts = await this.aci.getWalletAccounts({ assetName: this.asset.name })
    return Promise.all(walletAccounts.map((walletAccount) => this.stopListener({ walletAccount })))
  }

  async initWalletAccount({ walletAccount }) {
    if (this.tickCount[walletAccount] === 0) {
      await this.startListener({ walletAccount })
    }
  }

  async startListener({ walletAccount }) {
    if (FORCE_HTTP) return null

    const address = await this.aci.getReceiveAddress({
      assetName: this.asset.name,
      walletAccount,
      useCache: true,
    })

    return this.api.watchAddress({
      address,
      onMessage: (json) => {
        // new SOL tx event, tick monitor with 15 sec delay (to avoid hitting delayed nodes)
        setTimeout(() => this.tick({ walletAccount }), 15_000)
      },
    })
  }

  async stopListener({ walletAccount }) {
    if (FORCE_HTTP) return null

    const address = await this.aci.getReceiveAddress({
      assetName: this.asset.name,
      walletAccount,
      useCache: true,
    })
    return this.api.unwatchAddress({ address })
  }

  setServer(config = {}) {
    const { rpcs, ws, staking = {} } = { ...DEFAULT_REMOTE_CONFIG, ...config }
    this.api.setServer(rpcs[0])
    this.api.setWsEndpoint(ws[0])
    this.staking = staking
  }

  hasNewCursor({ walletAccount, cursorState }) {
    const { cursor } = cursorState
    return this.cursors[walletAccount] !== cursor
  }

  async emitUnknownTokensEvent({ tokenAccounts }) {
    const tokensList = await this.api.getWalletTokensList({ tokenAccounts })
    const unknownTokensList = tokensList.filter((mintAddress) => {
      return !this.api.tokens.has(mintAddress)
    })
    if (unknownTokensList.length > 0) {
      this.emit('unknown-tokens', unknownTokensList)
    }
  }

  async getStakingAddressesFromTxLog({ assetName, walletAccount }) {
    const txLog = await this.aci.getTxLog({ assetName: this.asset.name, walletAccount })
    const stakingAddresses = [...txLog]
      .filter((tx) => _.get(tx, 'data.staking.stakeAddresses'))
      .map((tx) => tx.data.staking.stakeAddresses)
    return _.uniq(stakingAddresses.flat())
  }

  #balanceChanged({ account, newAccount }) {
    const solBalanceChanged = !account.balance || !account.balance.equals(newAccount.balance)
    if (solBalanceChanged) return true

    // token balance changed
    return (
      !account.tokenBalances ||
      Object.entries(newAccount.tokenBalances).some(
        ([token, balance]) =>
          !account.tokenBalances[token] || !account.tokenBalances[token].equals(balance)
      )
    )
  }

  async markStaleTransactions({ walletAccount, logItemsByAsset = Object.create(null) }) {
    // mark stale txs as dropped in logItemsByAsset
    const clearedLogItems = logItemsByAsset
    const tokenNames = [...this.api.tokens.values()].map(({ name }) => name)
    const assets = [this.asset.name, ...tokenNames]

    for (const assetName of assets) {
      const txSet = await this.aci.getTxLog({ assetName, walletAccount })
      const { stale } = this.getUnconfirmed({ txSet, staleTxAge: TX_STALE_AFTER })
      if (stale.length > 0) {
        clearedLogItems[assetName] = _.unionBy(logItemsByAsset[assetName], stale, 'txId')
      }
    }

    return clearedLogItems
  }

  isStakingEnabled() {
    return true
  }

  async tick({ walletAccount, refresh }) {
    // Check for new wallet account
    await this.initWalletAccount({ walletAccount })

    const assetName = this.asset.name
    this.assets = await this.aci.getAssetsForNetwork({ baseAssetName: assetName })
    this.api.setTokens(this.assets)

    const accountState = await this.aci.getAccountState({ assetName, walletAccount })
    const address = await this.aci.getReceiveAddress({ assetName, walletAccount, useCache: true })

    const { account, tokenAccounts, staking } = await this.getAccountsAndBalances({
      refresh,
      address,
      accountState,
      walletAccount,
    })
    const balanceChanged = this.#balanceChanged({ account: accountState, newAccount: account })

    const isHistoryUpdateTick =
      this.tickCount[walletAccount] % this.ticksBetweenHistoryFetches === 0

    const shouldUpdateHistory = refresh || isHistoryUpdateTick || balanceChanged
    const shouldUpdateOnlyBalance = balanceChanged && !shouldUpdateHistory

    // getHistory is more likely to fail/be rate limited, so we want to update users balance only on a lot of ticks
    if (this.shouldUpdateBalanceBeforeHistory || shouldUpdateOnlyBalance) {
      // update all state at once
      await this.updateState({ account, walletAccount, staking })
      await this.emitUnknownTokensEvent({ tokenAccounts })
    }

    if (shouldUpdateHistory) {
      const { logItemsByAsset, cursorState } = await this.getHistory({
        address,
        accountState,
        walletAccount,
        refresh,
        tokenAccounts,
      })

      const cursorChanged = this.hasNewCursor({ walletAccount, cursorState })

      // update all state at once
      const clearedLogItems = await this.markStaleTransactions({ walletAccount, logItemsByAsset })
      await this.updateTxLogByAsset({ walletAccount, logItemsByAsset: clearedLogItems, refresh })
      await this.updateState({ account, cursorState, walletAccount, staking })
      await this.emitUnknownTokensEvent({ tokenAccounts })
      if (refresh || cursorChanged) {
        this.cursors[walletAccount] = cursorState.cursor
      }
    }
  }

  async getHistory({ address, accountState, refresh, tokenAccounts } = Object.create(null)) {
    const cursor = refresh ? '' : accountState.cursor
    const baseAsset = this.asset

    const { transactions, newCursor } = await this.api.getTransactions(address, {
      cursor,
      includeUnparsed: this.includeUnparsed,
      limit: this.txsLimit,
      tokenAccounts,
    })

    const mappedTransactions = []
    for (const tx of transactions) {
      const assetName = _.get(tx, 'token.tokenName', baseAsset.name)
      const asset = this.assets[assetName]
      if (assetName === 'unknown' || !asset) continue // skip unknown tokens
      const feeAsset = asset.feeAsset

      const coinAmount = tx.amount ? asset.currency.baseUnit(tx.amount) : asset.currency.ZERO

      const item = {
        coinName: assetName,
        txId: tx.id,
        from: [tx.from],
        coinAmount,
        confirmations: 1, // tx.confirmations, // avoid multiple notifications
        date: tx.date,
        error: tx.error,
        data: {
          staking: tx.staking || null,
          unparsed: !!tx.unparsed,
          swapTx: !!(tx.data && tx.data.inner),
        },
        currencies: { [assetName]: asset.currency, [feeAsset.name]: feeAsset.currency },
      }

      if (tx.owner === address) {
        // send transaction
        item.to = Array.isArray(tx.to) ? undefined : tx.to
        item.feeAmount = baseAsset.currency.baseUnit(tx.fee) // in SOL
        item.feeCoinName = baseAsset.name
        item.coinAmount = item.coinAmount.negate()

        if (tx.data?.sent) {
          item.data.sent = tx.data.sent.map((s) => ({
            address: s.address,
            amount: asset.currency.baseUnit(s.amount).toDefaultString({ unit: true }),
          }))
        }

        if (tx.to === tx.owner) {
          item.selfSend = true
          item.coinAmount = asset.currency.ZERO
        }
      } else if (tx.unparsed) {
        if (tx.fee !== 0) {
          item.feeAmount = baseAsset.currency.baseUnit(tx.fee) // in SOL
          item.feeCoinName = baseAsset.name
        }

        item.data.meta = tx.data.meta
      }

      if (
        asset.assetType === this.api.tokenAssetType &&
        item.feeAmount &&
        item.feeAmount.isPositive
      ) {
        const feeItem = {
          ..._.clone(item),
          coinName: feeAsset.name,
          tokens: [asset.name],
          coinAmount: feeAsset.currency.ZERO,
        }
        mappedTransactions.push(feeItem)
      }

      mappedTransactions.push(item)
    }

    const logItemsByAsset = _.groupBy(mappedTransactions, (item) => item.coinName)
    return {
      logItemsByAsset,
      hasNewTxs: transactions.length > 0,
      cursorState: { cursor: newCursor },
    }
  }

  async getAccountsAndBalances({ refresh, address, accountState, walletAccount }) {
    const tokens = Object.keys(this.assets).filter((name) => name !== this.asset.name)
    const [accountInfo, { balances: splBalances, accounts: tokenAccounts }] = await Promise.all([
      this.api.getAccountInfo(address).catch(() => {}),
      this.api.getTokensBalancesAndAccounts({
        address,
        filterByTokens: tokens,
      }),
    ])

    const solBalance = accountInfo?.lamports || 0

    const accountSize = accountInfo?.space || 0

    const rentExemptAmount = this.asset.currency.baseUnit(
      await this.api.getMinimumBalanceForRentExemption(accountSize)
    )

    const ownerChanged = await this.api.ownerChanged(address, accountInfo)

    const tokenBalances = _.mapValues(splBalances, (balance, name) =>
      this.assets[name].currency.baseUnit(balance)
    )

    const solBalanceChanged = this.#balanceChanged({
      account: accountState,
      newAccount: {
        balance: this.asset.currency.baseUnit(solBalance), // balance without staking
        tokenBalances,
      },
    })
    const fetchStakingInfo =
      refresh ||
      solBalanceChanged ||
      this.tickCount[walletAccount] % this.ticksBetweenStakeFetches === 0

    const staking =
      this.isStakingEnabled() && fetchStakingInfo
        ? await this.getStakingInfo({ address, accountState, walletAccount })
        : { ...accountState.stakingInfo, staking: this.staking }

    const stakedBalance = this.asset.currency.baseUnit(staking.locked)
    const activatingBalance = this.asset.currency.baseUnit(staking.activating)
    const withdrawableBalance = this.asset.currency.baseUnit(staking.withdrawable)
    const pendingBalance = this.asset.currency.baseUnit(staking.pending)
    const balance = this.asset.currency
      .baseUnit(solBalance)
      .add(stakedBalance)
      .add(activatingBalance)
      .add(withdrawableBalance)
      .add(pendingBalance)

    return {
      account: {
        balance,
        tokenBalances,
        rentExemptAmount,
        accountSize,
        ownerChanged,
      },
      staking,
      tokenAccounts,
    }
  }

  async updateState({ account, cursorState, walletAccount, staking }) {
    const { balance, tokenBalances, rentExemptAmount, accountSize, ownerChanged } = account
    const newData = {
      balance,
      rentExemptAmount,
      accountSize,
      ownerChanged,
      tokenBalances,
      stakingInfo: staking,
      ...cursorState,
    }
    return this.updateAccountState({ newData, walletAccount })
  }

  async getStakingInfo({ address, accountState, walletAccount }) {
    const stakingInfo = await this.api.getStakeAccountsInfo(address)
    let earned = accountState.stakingInfo.earned.toBaseString()
    try {
      const rewards = await this.api.getRewards(address)
      earned = rewards
    } catch (error) {
      console.warn(error)
    }

    return {
      loaded: true,
      staking: this.staking,
      isDelegating: Object.values(stakingInfo.accounts).some(({ state }) =>
        ['active', 'activating', 'inactive'].includes(state)
      ), // true if at least 1 account is delegating
      locked: this.asset.currency.baseUnit(stakingInfo.locked),
      activating: this.asset.currency.baseUnit(stakingInfo.activating),
      withdrawable: this.asset.currency.baseUnit(stakingInfo.withdrawable),
      pending: this.asset.currency.baseUnit(stakingInfo.pending), // still undelegating (not yet available for withdraw)
      earned: this.asset.currency.baseUnit(earned),
      accounts: stakingInfo.accounts, // Obj
    }
  }
}
