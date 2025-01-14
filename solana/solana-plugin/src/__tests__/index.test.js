import { connectAsset } from '@exodus/assets'
import { chainIndexTestSuite } from '@exodus/assets-testing'
import { asset as meta } from '@exodus/solana-meta'

import solanaPlugin from '../index.js'

const baseAsset = solanaPlugin.createAsset({ assetClientInterface: {} })

describe(`solana index.js test`, () => {
  // TODO: turn me back on when feeMonitor is true
  describe.skip('shared tests', () => {
    chainIndexTestSuite({
      baseAsset,
      moreKeys: [
        'isBuiltIn',
        'accountReserve',
        'baseAsset',
        'feeAsset',
        'lowBalance',
        'MIN_STAKING_AMOUNT',
      ],
    })
  })

  test('does have baseAsset, feeAsset', () => {
    // It's a connected meta, wallets will reconnect setting up the right asset with api
    expect(baseAsset.baseAsset).toEqual(connectAsset(meta))
    expect(baseAsset.feeAsset).toEqual(connectAsset(meta))

    expect(baseAsset.baseAsset).not.toEqual(baseAsset)
    expect(baseAsset.feeAsset).not.toEqual(baseAsset)

    expect(baseAsset.accountReserve.toBaseString({ unit: true })).toEqual('10000000 Lamports')
    expect(baseAsset.accountReserve.toDefaultString({ unit: true })).toEqual('0.01 SOL')
  })
})
