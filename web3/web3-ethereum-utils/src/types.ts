import type { MessageTypeEnum } from './simulation/getMessageType.js'
import type {
  AggregatedTransactionSimulationResult,
  Asset,
  BN,
  MessageSimulationResult,
  SimulateTransactionParams,
} from '@exodus/web3-types'

export interface EthTransactionParams {
  chainId: number
  from: string
  to?: string
  gas?: string
  gasLimit?: string
  gasPrice?: string
  value?: string
  data: string
  nonce?: string
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string
}

export interface EthTransaction {
  chainId: string
  from: string
  to?: string
  gas: string
  gasPrice: string
  value: string
  data: string
  nonce: string
  maxPriorityFeePerGas?: string
  maxFeePerGas?: string
}

export type EthTransactionHash = string

export type EthParentCapability = 'eth_accounts'

export interface EthWalletPermission {
  parentCapability: EthParentCapability
}

export interface EthWalletSwitchEthereumChain {
  chainId: string
}

export type EthWalletWatchAssetOptions = {
  address: string
  symbol?: string
  decimals?: number
  image?: string
  chainId?: number
}

export interface EthWalletWatchAsset {
  type: string
  options: EthWalletWatchAssetOptions
}

export interface EthSimulateTransactionParams
  extends SimulateTransactionParams {
  transactions: EthTransaction[]
}

export interface EthFeeDetails {
  gasLimit: BN
  maxFeePerGas: BN
  gasPrice: BN
}

export type EthAggregatedTransactionSimulationResult =
  AggregatedTransactionSimulationResult<EthFeeDetails>

export interface EthSimulateMessageParams {
  asset: Asset
  message: string
  url: URL
  address: string
}

export interface SimulateMessageParams {
  address: EthSimulateMessageParams['address']
  message: {
    message: string
    messageType: MessageTypeEnum.RawMessage | MessageTypeEnum.TypedData
  }
  url: EthSimulateMessageParams['url']
  apiEndpoint: string
  headers: Record<string, string>
  simulationResult: MessageSimulationResult
}
