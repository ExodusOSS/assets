// Move EthereumFeeMonitor to ethereum-plugin or better replace with serverBasedFeeMonitorFactoryFactory
import { createAssetFactory } from '@exodus/ethereum-api'
import assetsList from '@exodus/ethereum-meta'

import { stakingConfiguration, stakingDependencies } from './staking.js'

const createAsset = createAssetFactory({
  assetsList,
  feeDataConfig: {
    gasPrice: '75 Gwei',
    baseFeePerGas: '50 Gwei',
    max: '250 Gwei',
    min: '1 Gwei',
    fuelThreshold: '0.025 ETH',
    swapFee: '0.05 ETH',
    gasPriceMinimumRate: 0.5,
    enableFeeDelegation: false,
    tipGasPrice: '2 Gwei',
    eip1559Enabled: true,
    rbfEnabled: true,
  },
  supportsCustomFees: true,
  nfts: true,
  isMaxFeeAsset: true,
  erc20FuelBuffer: 1.1, // 10% more than the required fee
  fuelThreshold: '0.005',
  stakingConfiguration,
  stakingDependencies,
  serverUrl: 'https://geth.a.exodus.io/wallet/v1/',
  confirmationsNumber: 30,
})

const assetPlugin = { createAsset }
export default assetPlugin
