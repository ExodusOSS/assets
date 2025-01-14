import { strict as assert } from 'assert'

import {
  addCombinedAsset,
  addNetwork,
  coerceAssetProps,
  coerceTokenProps,
  updateCombinedAsset,
} from '../connect-assets.js'
import { addToken, createCombined, validateAsset } from '../index.js'
import assets from './_assets.js'

const blockExplorer = { addressUrl: () => {}, txUrl: () => {} }
const chainBadgeColors = ['', '']

test('add token', () => {
  const name = 'foo_bnbmainnet'
  const ticker = 'FOOT'
  const tokenDef = {
    name,
    baseAssetName: 'bnbmainnet',
    ticker,
    properName: 'Foo Token',
    assetType: 'BINANCE_TOKEN',
    units: { microbase: 0, [ticker]: 6 },
    blockExplorer,
    chainBadgeColors,
  }
  addToken(assets, coerceTokenProps(tokenDef, tokenDef))
  assert.doesNotThrow(() => validateAsset(assets[name]))
})

test('add base asset', () => {
  const displayTicker = 'FOOBAR'
  const displayName = 'Foobar'
  const assetFooDef = {
    name: 'foo',
    baseAssetName: 'foo',
    ticker: 'FOO',
    displayTicker,
    displayName,
    properTicker: displayTicker,
    properName: displayName,
    assetType: 'OTHER',
    units: { microbase: 0, FOO: 6 },
    blockExplorer,
    chainBadgeColors,
  }
  addNetwork(assets, coerceAssetProps(assetFooDef, assetFooDef))
  assert.doesNotThrow(() => validateAsset(assets.foo))

  const assetBarDef = {
    name: 'bar',
    baseAssetName: 'bar',
    ticker: 'BAR',
    displayTicker,
    displayName,
    properTicker: displayTicker,
    properName: displayName,
    assetType: 'OTHER',
    units: { microbase: 0, BAR: 6 },
    blockExplorer,
    chainBadgeColors,
  }
  addNetwork(assets, coerceAssetProps(assetBarDef, assetBarDef))
  assert.doesNotThrow(() => validateAsset(assets.bar))
})

test('add new combined asset', () => {
  const ticker = 'FOOBAR'
  const newCombinedDef = {
    name: '_foobar',
    ticker: `_boobar_FOOBAR`,
    displayTicker: 'FOOBAR',
    displayName: 'Foobar',
    assetType: 'MULTI_NETWORK_ASSET',
    baseAssetName: '_foobar',
    combinedAssetNames: ['foo'], // foo from `add token` test
    units: { microbase: 0, [ticker]: 6 },
  }
  const assetDef = createCombined(newCombinedDef, assets)
  addCombinedAsset(assets, assetDef)
  assert.doesNotThrow(() => validateAsset(assets._foobar))
})

test('update combined asset', () => {
  updateCombinedAsset(assets, assets._foobar, { newMemberAsset: assets.bar })
  assert.doesNotThrow(() => validateAsset(assets._foobar))
  expect(assets._foobar.combinedAssetNames).toEqual(['foo', 'bar'])
  expect(assets._foobar.combinedAssets.length).toBe(2)
  expect(assets._foobar.baseAsset).toBe(assets._foobar)
})
