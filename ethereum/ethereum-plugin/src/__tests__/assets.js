import { connectAssetsList } from '@exodus/assets'
import * as ethereum from '@exodus/ethereum-meta'

const expandAsset = (asset) => {
  if (asset.contract?.current) {
    // EVM specific transformation hack
    // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
    asset.contract.address = asset.contract.current
  }

  return asset
}

const assetsBase = [ethereum.asset, ...ethereum.tokens].map(expandAsset)

const assets = connectAssetsList(assetsBase)

export default assets
