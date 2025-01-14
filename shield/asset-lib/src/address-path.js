import assert from 'minimalistic-assert'

const toNumber = (index) => {
  return index === undefined ? undefined : Number.parseInt(index)
}

export const getDefaultPathIndexes = ({ asset, compatibilityMode, walletAccount }) => {
  assert(asset && asset.baseAsset && asset.baseAsset.api, 'expected asset.baseAsset.api')
  assert(
    !compatibilityMode || typeof compatibilityMode === 'string',
    'expected string "compatibilityMode"'
  )
  assert(!walletAccount || typeof walletAccount === 'object', 'expected object "walletAccount"')

  const { baseAsset } = asset
  const getDefaultAddressPath =
    baseAsset.api.getDefaultAddressPath ||
    function getDefaultAddressPath() {
      return baseAsset.api.defaultAddressPath
    }

  const path = getDefaultAddressPath({ asset, compatibilityMode, walletAccount })
  const [, chainIndex, addressIndex] = path.split('/')
  return { chainIndex: toNumber(chainIndex), addressIndex: toNumber(addressIndex) }
}
