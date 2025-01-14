import { createBitcoinAssetFactory } from '@exodus/bitcoin-plugin'
import { asset } from '@exodus/bitcoinregtest-meta'

const apiUrl = 'https://btc-regtest-d.a.exodus.io/insight/'

const coinInfoNetwork = 'bitcoin-regtest'

export const createAsset = createBitcoinAssetFactory({
  asset,
  apiUrl,
  coinInfoNetwork,
  isTestnet: true,
})
const assetPlugin = { createAsset }
export default assetPlugin
