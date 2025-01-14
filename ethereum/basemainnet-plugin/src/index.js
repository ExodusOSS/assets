import assetsList from '@exodus/basemainnet-meta'
import { createAssetFactory } from '@exodus/ethereum-api'

// same address between base and optimism
export const GAS_ORACLE_ADDRESS = '0x420000000000000000000000000000000000000F'

const createAsset = createAssetFactory({
  assetsList,
  feeDataConfig: {
    gasPrice: '0.2 Gwei',
    baseFeePerGas: '0.2 Gwei',
    tipGasPrice: '0.02 Gwei',
    max: '1 Gwei',
    min: '0.001 Gwei',
    fuelThreshold: '750000 Gwei',
    eip1559Enabled: true,
  },
  erc20FuelBuffer: 1.1, // 10% more than the required fee
  serverUrl: 'https://base-qn.a.exodus.io',
  confirmationsNumber: 30,
  monitorType: 'no-history',
  nfts: true,
  l1GasOracleAddress: GAS_ORACLE_ADDRESS,
})

const assetPlugin = { createAsset }

export default assetPlugin
