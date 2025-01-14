import { Timer } from '@exodus/timer'
import assert from 'minimalistic-assert'
import ms from 'ms'

const INTERVAL = ms('30s')

export class SolanaAutoWithdrawMonitor {
  constructor({ interval = INTERVAL, assetClientInterface, createAndSendStake }) {
    this.assetName = 'solana'
    this.timer = new Timer(interval)
    this.aci = assetClientInterface
    this.createAndSendStake = createAndSendStake
    assert(typeof createAndSendStake === 'function', 'createAndSendStake is required')
    this.cursors = {}
  }

  start = async () => {
    const assets = await this.aci.getAssetsForNetwork({ baseAssetName: this.assetName })
    this.asset = assets[this.assetName]
    await this.timer.start(() => this.tick())
  }

  async tick() {
    const walletAccounts = await this.aci.getWalletAccounts({ assetName: this.assetName })
    await Promise.all(walletAccounts.map((walletAccount) => this._tick({ walletAccount })))
  }

  async _tick({ walletAccount }) {
    const accountState = await this.aci.getAccountState({
      assetName: this.assetName,
      walletAccount,
    })
    const { cursor, stakingInfo } = accountState
    const { loaded, withdrawable } = stakingInfo

    if (!Array.isArray(this.cursors[walletAccount])) this.cursors[walletAccount] = []
    const cursorChanged = !this.cursors[walletAccount].includes(cursor)
    const performedWithdraw = this.cursors[walletAccount].length > 0

    if (loaded && cursorChanged && withdrawable.isPositive && !performedWithdraw) {
      this.cursors[walletAccount].push(cursor)
      try {
        const txIds = await this.tryWithdraw({ accountState, walletAccount })
        this.cursors[walletAccount].push(...txIds)
      } catch (e) {
        console.log('solana auto withdraw error:', e)
      }
    }
  }

  async tryWithdraw({ accountState, walletAccount }) {
    const stakingInfo = accountState.stakingInfo
    const feeData = await this.aci.getFeeData({ assetName: this.assetName })
    const fee = feeData?.fee ?? this.asset.currency.ZERO

    const solBalance = accountState?.balance ?? this.asset.currency.ZERO
    if (solBalance.lt(fee) || stakingInfo.withdrawable.isZero) return []

    const promises = await this.createAndSendStake(
      {
        method: 'withdraw',
        walletAccount,
        amount: stakingInfo.withdrawable,
      },
      { watchForTxConfirmation: false }
    )

    return Promise.all(promises)
  }
}

/*
const _solanaAutoWithdrawMonitor = new SolanaAutoWithdrawMonitor({ interval: INTERVAL })

export const solanaAutoWithdrawMonitor = {
  start:
    ({ assetClientInterface, createAndSendStake }) =>
    async () =>
      _solanaAutoWithdrawMonitor.start({ assetClientInterface, createAndSendStake }),
}
*/
