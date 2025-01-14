import { createAssetRegistry } from '../index.js'

const supportedAssetsList = [
  {
    name: 'bitcoin',
    bitcoinProp: 'foo',
  },
  {
    name: 'ethereum',
    api: {
      getTokens: () => [
        {
          name: 'mcd',
          baseAssetName: 'ethereum',
        },
      ],
    },
  },
]

test('create assets registry', () => {
  const assetRegistry = createAssetRegistry({ supportedAssetsList })
  const assets = assetRegistry.getAssets()

  expect(Object.keys(assets)).toEqual(['bitcoin', 'ethereum', 'mcd'])
  Object.keys(assets).every((assetName) => expect(assets[assetName].name).toBe(assetName))
  Object.values(assets).every((asset) => expect(asset.isBuiltIn).toBe(true))
  expect(assets.mcd.baseAsset).toBe(assets.ethereum)
  expect(assets.mcd.feeAsset).toBe(assets.ethereum)
  expect(assets.bitcoin.bitcoinProp).toBe('foo')
})
