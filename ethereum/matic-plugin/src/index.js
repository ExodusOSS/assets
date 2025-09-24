import { createAssetFactory } from '@exodus/ethereum-api'
import assetsList from '@exodus/matic-meta'

const createAsset = createAssetFactory({
  assetsList,
  feeDataConfig: {
    // https://polygonscan.com/chart/gasprice
    baseFeePerGas: '100 Gwei',
    tipGasPrice: '35 Gwei',
    gasPrice: '135 Gwei',
    max: '300 Gwei',
    min: '40 Gwei',
    fuelThreshold: '2500000 Gwei',
    eip1559Enabled: true,
  },
  nfts: true,
  serverUrl: 'https://polygon-clarity.a.exodus.io',
  monitorType: 'clarity-v2',
  useAbsoluteBalanceAndNonce: true,
  confirmationsNumber: 50,
})

const assetPlugin = { createAsset }

export default assetPlugin
