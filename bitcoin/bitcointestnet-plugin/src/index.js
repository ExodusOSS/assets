import { createBitcoinAssetFactory } from '@exodus/bitcoin-plugin'
import { asset } from '@exodus/bitcointestnet-meta'

const apiUrl = 'https://btc-testnet-d.a.exodus.io/insight/'

const coinInfoNetwork = 'bitcoin-test'

export const createAsset = createBitcoinAssetFactory({
  asset,
  apiUrl,
  coinInfoNetwork,
  isTestnet: true,
})

const assetPlugin = { createAsset }
export default assetPlugin
