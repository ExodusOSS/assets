import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import { createGetKeyIdentifier } from '@exodus/key-utils'
import assert from 'minimalistic-assert'

import { connectAssetsList } from './connect-assets.js'

export const createDelistedAssetFactory = ({
  assetsList, // default export of <asset>-meta
  validateAddress,
  privateKeyEncodingDefinition = { encoding: 'hex' },
  encodePrivateKey = (privateKey) => privateKey.toString('hex'),
  encodePublicKey,
  getKeyIdentifier,
}) => {
  assert(
    Array.isArray(assetsList) && assetsList.length > 0,
    'createDelistedAssetFactory: "assetsList" expected to be a non-empty array'
  )
  assert(
    typeof validateAddress === 'function',
    'createDelistedAssetFactory: "validateAddress" expected to be a function'
  )
  assert(
    typeof encodePrivateKey === 'function',
    'createDelistedAssetFactory: "encodePrivateKey" expected to be a function'
  )
  assert(
    typeof encodePublicKey === 'function',
    'createDelistedAssetFactory: "encodePublicKey" expected to be a function'
  )
  assert(
    getKeyIdentifier === undefined || typeof getKeyIdentifier === 'function',
    'createDelistedAssetFactory: "getKeyIdentifier" expected to be a function'
  )

  const assets = connectAssetsList(assetsList)
  const base = Object.values(assets).find((asset) => asset.name === asset.baseAsset.name)
  assert(base, 'createDelistedAssetFactory: base asset not found')

  const address = { validate: validateAddress }

  const bip44 = bip44Constants[base.ticker]

  const keys = { encodePrivate: encodePrivateKey, encodePublic: encodePublicKey }

  const features = { delisted: true }

  const createToken = (tokenDef) => ({ ...tokenDef, address, bip44, keys, api: { features } })

  const defaultAddressPath = 'm/0/0'

  const getTokens = () =>
    Object.values(assets)
      .filter((asset) => asset.name !== base.name)
      .map(createToken)

  const createApi = ({ assetClientInterface }) => ({
    defaultAddressPath,
    features,
    getDefaultAddressPath: () => defaultAddressPath,
    getKeyIdentifier: getKeyIdentifier || createGetKeyIdentifier({ bip44, assetName: base.name }),
    getTokens,
    hasFeature: (feature) => !!features[feature], // @deprecated use api.features instead
    privateKeyEncodingDefinition,
  })

  // createAsset
  return ({ assetClientInterface, config }) => ({
    ...base,
    address,
    bip44,
    api: createApi({ assetClientInterface }),
    keys,
  })
}
