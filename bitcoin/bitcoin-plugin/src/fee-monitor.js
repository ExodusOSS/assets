import { FeeMonitor } from '@exodus/asset-lib'

// clamp to these numbers, sat/B, not sat/KB (!)
const MIN_FEE = 2 // 2 sat/B, 0.00002 BTC sat/KB
const MAX_FEE = 2e3 // 2000 sat/B, 0.0200 BTC sat/KB

export default class BitcoinFeeMonitor extends FeeMonitor {
  constructor({ updateFee, interval = '1m', assetName = 'bitcoin', insight }) {
    super({ updateFee, interval, assetName })
    this.insightFn = insight
  }

  get insight() {
    return this.insightFn()
  }

  async fetchFee() {
    const { fastestFee, halfHourFee, hourFee, minimumFee, nextBlockMinimumFee } =
      await this.insight.fetchFeeRate()
    return {
      feePerKB: this.toPerKB(fastestFee),
      fastestFee: `${fastestFee} satoshis`,
      halfHourFee: `${halfHourFee} satoshis`,
      hourFee: `${hourFee} satoshis`,
      minimumFee: `${minimumFee} satoshis`,
      nextBlockMinimumFee: nextBlockMinimumFee ? `${nextBlockMinimumFee} satoshis` : undefined,
    }
  }

  toPerKB(fee) {
    if (fee < MIN_FEE) {
      fee = MIN_FEE
    } else if (fee > MAX_FEE) {
      fee = MAX_FEE
    }

    fee = fee * 1e3
    return `${fee} satoshis`
  }
}
