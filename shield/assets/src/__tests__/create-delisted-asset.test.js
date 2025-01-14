import { crypto } from '@exodus/binance-lib'
import assetsList from '@exodus/bnbmainnet-meta'

import { createDelistedAssetFactory } from '../create-delisted-asset.js'

const fixture = {
  name: 'bnbmainnet',
  displayName: 'BNB',
  ticker: 'BNB',
  displayTicker: 'BNB',
  address: expect.objectContaining({
    validate: expect.any(Function),
  }),
  api: expect.objectContaining({
    features: { delisted: true },
    getDefaultAddressPath: expect.any(Function),
    getKeyIdentifier: expect.any(Function),
    hasFeature: expect.any(Function),
  }),
  bip44: 2_147_484_362,
  keys: expect.objectContaining({
    encodePrivate: expect.any(Function),
    encodePublic: expect.any(Function),
  }),
}

test('create delisted asset', () => {
  const createAsset = createDelistedAssetFactory({
    assetsList,
    validateAddress: crypto.checkAddress,
    encodePublicKey: (publicKey) =>
      crypto.getAddressFromPublicKey(publicKey.toString('hex'), 'bnb'),
  })
  const asset = createAsset({ assetClientInterface: {} })
  expect(asset).toMatchObject(fixture)
})
