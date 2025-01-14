import { pick } from '@exodus/basic-utils'

import { addToken, connectAssetsList, updateToken } from './connect-assets.js'

const createAssetRegistry = ({ supportedAssetsList }) => {
  const assetsList = [
    ...supportedAssetsList,
    ...supportedAssetsList
      .filter((asset) => asset.api?.getTokens)
      .flatMap((baseAsset) => baseAsset.api.getTokens()),
  ]

  const assets = connectAssetsList(assetsList)

  const createCustomToken = ({ parameters, version, ...tokenDef }, baseAsset) =>
    baseAsset.api.createToken({
      ...tokenDef,
      ...pick(parameters, ['units', 'decimals']),
      blockExplorer: baseAsset.blockExplorer,
      isCustomToken: true,
    })

  const addCustomToken = (token) =>
    addToken(assets, createCustomToken(token, assets[token.baseAssetName]))

  const updateCustomToken = (token) =>
    updateToken(assets, createCustomToken(token, assets[token.baseAssetName]))

  return {
    addCustomToken,
    updateCustomToken,
    getAsset: (assetName) => assets[assetName],
    getAssets: () => assets,
  }
}

export default createAssetRegistry
