import { asset } from '@exodus/bitcoin-meta'

import { createBitcoinAssetFactory } from './create-asset.js'

export * from './create-asset.js' // for bitcoinregtest and bitcointestnet

const apiUrl = 'https://bitcoin.a.exodus.io/insight/'
export const createAsset = createBitcoinAssetFactory({ asset, apiUrl })
const assetPlugin = { createAsset }
export default assetPlugin
