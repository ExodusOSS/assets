import { connectAssets } from '@exodus/assets'
import { keyBy } from '@exodus/basic-utils'
import assetsList from '@exodus/solana-meta'

const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))

export default assets
