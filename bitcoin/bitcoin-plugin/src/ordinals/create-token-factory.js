export function validateAssetId(assetId) {
  if (typeof assetId !== 'string') return false
  const rgx = /^[\da-f]{64}i\d+$/
  return rgx.test(assetId)
}

export const createTokenFactory = ({ address, bip44, keys, getBalances }, networkAssets) => {
  const createToken = ({ features: providedFeatures, ...tokenDef }) => {
    const features = { ...providedFeatures }
    return {
      ...tokenDef,
      api: {
        getBalances,
        features,
        hasFeature: (feature) => !!features[feature],
      },
      address,
      bip44,
      keys,
    }
  }

  return {
    validateAssetId,
    createToken,
    getTokens: () =>
      Object.values(networkAssets)
        .filter((asset) => asset.name !== asset.baseAsset.name)
        .map(createToken),
  }
}
