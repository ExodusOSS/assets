import { Tx } from '@exodus/models'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

// Mocked helper functions and classes
const txLogFilter = jest.fn()
const asset = assetPlugin.createAsset({ assetClientInterface })

describe('getActivityTxs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should process transactions with sent data correctly', () => {
    const txs = [
      Tx.fromJSON({
        txId: '',
        currencies: { bitcoin: asset.currency },
        coinName: 'bitcoin',
        coinAmount: asset.currency.defaultUnit(10).negate(),
        feeCoinName: 'bitcoin',
        feeAmount: asset.currency.defaultUnit(10).negate(),
        data: {
          sent: [
            { address: 'addr1', amount: { value: 4, unit: 'BTC' } },
            { address: 'addr2', amount: { value: 6, unit: 'BTC' } },
          ],
        },
      }),
    ]

    txLogFilter.mockImplementation(() => true)

    const result = asset.api.getActivityTxs({ txs, asset })

    expect(result).toHaveLength(2)
    expect(result[0].to).toBe('addr2')
    expect(result[0].data.sentIndex).toBe(1)
    expect(result[0].coinAmount.toDefaultNumber()).toBe(-6)
    expect(result[0].feeAmount.toDefaultNumber()).toBe(-5)

    expect(result[1].to).toBe('addr1')
    expect(result[1].data.sentIndex).toBe(0)
    expect(result[1].coinAmount.toDefaultNumber()).toBe(-4)
    expect(result[1].feeAmount.toDefaultNumber()).toBe(-5)
  })

  test('should return transaction as is if no sent data', () => {
    const txs = [
      Tx.fromJSON({
        txId: '',
        currencies: { bitcoin: asset.currency },
        coinName: 'bitcoin',
        coinAmount: asset.currency.defaultUnit(10).negate(),
        feeCoinName: 'bitcoin',
        feeAmount: asset.currency.defaultUnit(10).negate(),
        data: {},
      }),
    ]

    txLogFilter.mockImplementation(() => true)

    const result = asset.api.getActivityTxs({ txs, asset })

    expect(result).toHaveLength(1)
    expect(result[0]).toBe(txs[0])
  })

  test('should filter transactions based on txLogFilter', () => {
    const txs = [
      Tx.fromJSON({
        txId: '',
        coinName: 'bitcoin',
        coinAmount: asset.currency.defaultUnit(10).negate(),
        feeCoinName: 'bitcoin',
        feeAmount: asset.currency.defaultUnit(10).negate(),
        currencies: { bitcoin: asset.currency },
        data: { sent: [{ address: 'addr1', amount: '5 BTC' }] },
      }),
    ]

    txLogFilter.mockImplementation((tx) => tx.to === 'addr1')

    const result = asset.api.getActivityTxs({ txs, asset })

    expect(result).toHaveLength(1)
    expect(result[0].to).toBe('addr1')
  })

  test('should handle transactions with no amount correctly', () => {
    const txs = [
      Tx.fromJSON({
        txId: '',
        coinName: 'bitcoin',
        coinAmount: asset.currency.defaultUnit(10).negate(),
        feeCoinName: 'bitcoin',
        feeAmount: asset.currency.defaultUnit(10).negate(),
        currencies: { bitcoin: asset.currency },
        data: { sent: [{ address: 'addr1' }, { address: 'addr2' }] },
      }),
    ]

    txLogFilter.mockImplementation(() => true)

    const result = asset.api.getActivityTxs({ txs, asset })

    expect(result).toHaveLength(2)
    expect(result[0].to).toBe('addr2')
    expect(result[0].coinAmount.toDefaultNumber()).toBe(0)
    expect(result[1].to).toBe('addr1')
    expect(result[1].coinAmount.toDefaultNumber()).toBe(0)
  })
})
