import { asset } from '@exodus/bitcoin-meta'
import { Tx } from '@exodus/models'

import { getActivityTxs } from '../get-activity-txs.js'

describe('getActivityTxs', () => {
  test('returns transaction as-is when not a sent transaction', () => {
    const tx = Tx.fromJSON({
      txId: 'test-tx-1',
      currencies: { bitcoin: asset.currency },
      coinName: 'bitcoin',
      coinAmount: asset.currency.baseUnit(10_000),
      feeCoinName: 'bitcoin',
      feeAmount: asset.currency.baseUnit(1000),
      sent: false,
      data: {},
    })
    const txs = [tx]

    const result = getActivityTxs({ txs, asset })

    expect(result).toEqual([tx])
  })

  test('returns transaction as-is when sent array is empty', () => {
    const tx = Tx.fromJSON({
      txId: 'test-tx-2',
      currencies: { bitcoin: asset.currency },
      coinName: 'bitcoin',
      coinAmount: asset.currency.baseUnit(10_000).negate(),
      feeCoinName: 'bitcoin',
      feeAmount: asset.currency.baseUnit(1000),
      sent: true,
      data: { sent: [] },
    })
    const txs = [tx]

    const result = getActivityTxs({ txs, asset })

    expect(result).toEqual([tx])
  })

  test('splits sent transaction with multiple recipients', () => {
    const tx = {
      txId: 'test-tx-3',
      sent: true,
      feeAmount: asset.currency.baseUnit(1000),
      data: {
        sent: [
          { address: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030', amount: '0.0001 BTC' },
          { address: 'bc1qmxjefnuy06v345v6vhwpwt0ypnj3u9ylpm3rce', amount: '0.0002 BTC' },
        ],
      },
      toJSON() {
        return {
          txId: this.txId,
          currencies: { bitcoin: asset.currency },
          coinName: 'bitcoin',
          coinAmount: asset.currency.baseUnit(30_000).negate(),
          feeCoinName: 'bitcoin',
          feeAmount: this.feeAmount,
          sent: this.sent,
          data: this.data,
        }
      },
    }

    const result = getActivityTxs({ txs: [tx], asset })

    expect(
      result.map((tx) => ({
        to: tx.to,
        sentIndex: tx.data.sentIndex,
        activityIndex: tx.data.activityIndex,
        coinAmount: tx.coinAmount.toDefaultNumber(),
        feeAmount: tx.feeAmount.toDefaultNumber(),
      }))
    ).toEqual([
      {
        to: 'bc1qmxjefnuy06v345v6vhwpwt0ypnj3u9ylpm3rce',
        sentIndex: 1,
        activityIndex: 1,
        coinAmount: -0.0002,
        feeAmount: 0.000_005,
      },
      {
        to: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030',
        sentIndex: 0,
        activityIndex: 0,
        coinAmount: -0.0001,
        feeAmount: 0.000_005,
      },
    ])
  })

  test('handles sent transaction with no amount', () => {
    const tx = {
      txId: 'test-tx-4',
      sent: true,
      feeAmount: asset.currency.baseUnit(1000),
      data: {
        sent: [{ address: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030' }],
      },
      toJSON() {
        return {
          txId: this.txId,
          currencies: { bitcoin: asset.currency },
          coinName: 'bitcoin',
          coinAmount: asset.currency.ZERO,
          feeCoinName: 'bitcoin',
          feeAmount: this.feeAmount,
          sent: this.sent,
          data: this.data,
        }
      },
    }

    const result = getActivityTxs({ txs: [tx], asset })

    expect(
      result.map((tx) => ({
        to: tx.to,
        coinAmount: tx.coinAmount,
        feeAmount: tx.feeAmount.toDefaultNumber(),
      }))
    ).toEqual([
      {
        to: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030',
        coinAmount: asset.currency.ZERO,
        feeAmount: 0.000_01,
      },
    ])
  })

  test('handles multiple transactions', () => {
    const nonSentTx = Tx.fromJSON({
      txId: 'test-tx-5',
      currencies: { bitcoin: asset.currency },
      coinName: 'bitcoin',
      coinAmount: asset.currency.baseUnit(10_000),
      feeCoinName: 'bitcoin',
      feeAmount: asset.currency.baseUnit(500),
      sent: false,
      data: {},
    })

    const txs = [
      nonSentTx,
      {
        txId: 'test-tx-6',
        sent: true,
        feeAmount: asset.currency.baseUnit(2000),
        data: {
          sent: [
            { address: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030', amount: '0.001 BTC' },
            { address: 'bc1qmxjefnuy06v345v6vhwpwt0ypnj3u9ylpm3rce', amount: '0.002 BTC' },
          ],
        },
        toJSON() {
          return {
            txId: this.txId,
            currencies: { bitcoin: asset.currency },
            coinName: 'bitcoin',
            coinAmount: asset.currency.baseUnit(300_000).negate(),
            feeCoinName: 'bitcoin',
            feeAmount: this.feeAmount,
            sent: this.sent,
            data: this.data,
          }
        },
      },
    ]

    const result = getActivityTxs({ txs, asset })

    expect(
      result.map((tx, i) => ({
        index: i,
        isOriginal: tx === nonSentTx,
        to: tx.to,
      }))
    ).toEqual([
      { index: 0, isOriginal: true, to: undefined },
      { index: 1, isOriginal: false, to: 'bc1qmxjefnuy06v345v6vhwpwt0ypnj3u9ylpm3rce' },
      { index: 2, isOriginal: false, to: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030' },
    ])
  })
})
