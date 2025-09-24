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
    tipGasPrice: '0.5 Gwei',
    eip1559Enabled: true,
    rbfEnabled: true,
    gasLimits: {
      amp: { fixedGasLimit: 151_000 },
      tetherusd: { fixedGasLimit: 70_000 },
      usdcoin: { fixedGasLimit: 70_000 },
      snx: { fixedGasLimit: 220_000 },
      gusd_ethereum_1ea2a0d4: { fixedGasLimit: 75_000 },
      aave: { fixedGasLimit: 250_000 },
    },
  },
  rpcBalanceAssetNames: [
    'ousd_ethereum_48fcf72d',
    'steth_ethereum_ef1101bb',
    'weth',
    'ampl_ethereum_48428467',
    'feg_ethereum_ef42acf0',
    'floki_ethereum_4a3891a6',
    'mark_ethereum_0d0c07dd',
    'saitama_ethereum_5547ffb6',
    'shiryoinu_ethereum_ff507c93',
    'volt_ethereum_9e0778ce',
  ],
  supportsCustomFees: true,
  nfts: true,
  isMaxFeeAsset: true,
  erc20FuelBuffer: 1.1, // 10% more than the required fee
  fuelThreshold: '0.005',
  stakingConfiguration,
  stakingDependencies,
  monitorType: 'clarity-v2',
  serverUrl: 'https://eth-clarity.a.exodus.io',
  monitorInterval: '1m',
  confirmationsNumber: 30,
})

const assetPlugin = { createAsset }
export default assetPlugin
