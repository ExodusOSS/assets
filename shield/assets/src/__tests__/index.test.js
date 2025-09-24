import { strict as assert } from 'assert'

import { validateAsset } from '../index.js'
import assets from './_assets.js'

test('should have basic properties', () => {
  assert.equal(assets.bitcoin.currency.BTC('1.5').toDefaultString({ unit: true }), '1.5 BTC')
  assert.equal(assets.bitcoin.ticker, 'BTC')
  assert.equal(assets.ripple.ticker, 'XRP') // used to verify Lerna is working (wildcard)
})

test('baseAsset', () => {
  expect(assets.ethereum.baseAsset).toBe(assets.ethereum)
  expect(assets.busd.baseAsset).toBe(assets.ethereum)

  expect(assets.solana.baseAsset).toBe(assets.solana)
  expect(assets.serum.baseAsset).toBe(assets.solana)

  expect(assets.tronmainnet.baseAsset).toBe(assets.tronmainnet)
  expect(assets.bittorrentv2.baseAsset).toBe(assets.tronmainnet)

  expect(assets.vechainthor.baseAsset).toBe(assets.vechainthor)
  expect(assets.vethor.baseAsset).toBe(assets.vechainthor)

  expect(assets.neo.baseAsset).toBe(assets.neo)
  expect(assets.neogas.baseAsset).toBe(assets.neo)

  expect(assets.ontology.baseAsset).toBe(assets.ontology)
  expect(assets.ontologygas.baseAsset).toBe(assets.ontology)

  expect(assets.theta.baseAsset).toBe(assets.theta)
  expect(assets.tfuel.baseAsset).toBe(assets.theta)

  expect(assets.bnbmainnet.baseAsset).toBe(assets.bnbmainnet)
  expect(assets.busd_bnbmainnet.baseAsset).toBe(assets.bnbmainnet)

  expect(assets.bsc.baseAsset).toBe(assets.bsc)
  expect(assets.busd_bsc.baseAsset).toBe(assets.bsc)
})

test('feeAsset', () => {
  expect(assets.ethereum.feeAsset).toBe(assets.ethereum)
  expect(assets.busd.feeAsset).toBe(assets.ethereum)

  expect(assets.neo.feeAsset).toBe(assets.neogas)
  expect(assets.neogas.feeAsset).toBe(assets.neogas)

  expect(assets.ontology.feeAsset).toBe(assets.ontologygas)
  expect(assets.ontologygas.feeAsset).toBe(assets.ontologygas)

  expect(assets.theta.feeAsset).toBe(assets.tfuel)
  expect(assets.tfuel.feeAsset).toBe(assets.tfuel)

  expect(assets.bnbmainnet.feeAsset).toBe(assets.bnbmainnet)
  expect(assets.busd_bnbmainnet.feeAsset).toBe(assets.bnbmainnet)

  expect(assets.bsc.feeAsset).toBe(assets.bsc)
  expect(assets.busd_bsc.feeAsset).toBe(assets.bsc)
})

test('properTicker', () => {
  expect(assets.bsc.properTicker).toBe('BNB')
  expect(assets.cosmos.properTicker).toBe('ATOM')
  expect(assets.monero.properTicker).toBe('XMR')
})

test('displayNetworkTicker', () => {
  expect(assets.bsc.displayNetworkTicker).toBe('BSC')
  expect(assets.busd_bsc.displayNetworkTicker).toBe(assets.bsc.displayNetworkTicker)
  expect(assets['1inch_bsc_61c44543'].displayNetworkTicker).toBe(assets.bsc.displayNetworkTicker)

  expect(assets.ethereum.displayNetworkTicker).toBe('ETH')
})

test('displayNetworkName', () => {
  expect(typeof assets.bsc.displayNetworkName).toBe('string')
  expect(assets.busd_bsc.displayNetworkName).toBe(assets.bsc.displayNetworkName)
  expect(assets['1inch_bsc_61c44543'].displayNetworkName).toBe(assets.bsc.displayNetworkName)

  expect(typeof assets.ethereum.displayNetworkName).toBe('string')
})

test('all assets pass validation', () => {
  for (const asset of Object.values(assets)) {
    assert.doesNotThrow(() => validateAsset(asset))
  }
})

test('object spread propagates property values', () => {
  const origAsset = assets.cardano
  expect(origAsset.baseAsset).toBeTruthy()
  expect(origAsset.feeAsset).toBeTruthy()
  expect(typeof origAsset.baseAsset).toBe('object')
  expect(typeof origAsset.feeAsset).toBe('object')

  const origCombinedAsset = assets._cardano
  expect(origCombinedAsset.combinedAssets).toBeTruthy()
  expect(typeof origCombinedAsset.combinedAssets).toBe('object')

  const spreadAsset = { ...origAsset }
  expect(spreadAsset.baseAsset).toBe(origAsset.baseAsset)
  expect(spreadAsset.feeAsset).toBe(origAsset.feeAsset)

  const spreadCombinedAsset = { ...origCombinedAsset }
  expect(spreadCombinedAsset.combinedAssets).toStrictEqual(origCombinedAsset.combinedAssets)
})
