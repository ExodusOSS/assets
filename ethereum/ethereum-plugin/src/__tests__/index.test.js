import { runEvmIndexTestSuite } from '@exodus/ethereum-api/src/__tests__/index.testsuite.js'

import assetPlugin from '../index.js'

describe(`ethereum index.js test`, () => {
  runEvmIndexTestSuite({ assetPlugin })

  test('customTokens and nfts should be true by default when no config', () => {
    const asset = assetPlugin.createAsset({ assetClientInterface: {} })
    expect(asset.api.features.customTokens).toEqual(true)
    expect(asset.api.features.nfts).toEqual(true)
  })

  test('customTokens and nfts should be true when empty config', () => {
    const asset = assetPlugin.createAsset({ assetClientInterface: {}, config: {} })
    expect(asset.api.features.customTokens).toEqual(true)
    expect(asset.api.features.nfts).toEqual(true)
  })

  test('customTokens and nfts should be false when customized', () => {
    const asset = assetPlugin.createAsset({
      assetClientInterface: {},
      config: { customTokens: false, nfts: false },
    })
    expect(asset.api.features.customTokens).toEqual(false)
    expect(asset.api.features.customTokens).toEqual(false)
  })
})
