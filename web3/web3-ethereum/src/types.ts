import type {
  AddEthereumChainParameter,
  EthereumProvider,
} from './provider/index.js'
import type {
  MessageTypes,
  TypedDataV1,
  TypedMessage,
} from '@exodus/ethereumjs/eth-sig-util'
import type {
  EthAggregatedTransactionSimulationResult,
  EthSimulateTransactionParams,
  EthTransaction,
  EthTransactionHash,
  EthWalletWatchAsset,
} from '@exodus/web3-ethereum-utils'
import type { EthTransactionParams } from '@exodus/web3-ethereum-utils'
import type { WalletStandardCommonDeps } from '@exodus/web3-provider'
import type { CommonDeps } from '@exodus/web3-rpc-handlers'
import type {
  Asset,
  CreateSimulationServiceParams,
  EthereumFeeData,
  GetActiveWalletAccountData,
  GetFeeDataParams,
  IAnalyticsModule,
  IBlockchainMetadataModule,
  IMessageSignerModule,
  ITransactionSignerModule,
  NumberUnit,
} from '@exodus/web3-types'

/**
 * EVM-compatible chains.
 */

export interface EthRequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

export interface FeeData {
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
}

export interface CreateEvmDepsFactoryParams {
  analytics: IAnalyticsModule
  blockchainMetadata: IBlockchainMetadataModule
  simulateTransactionConfig?: CreateSimulationServiceParams
}

type SimulateTransactionsFn = (
  params: EthSimulateTransactionParams,
) => Promise<EthAggregatedTransactionSimulationResult>

export interface CreateEvmDepsParams {
  addEthereumChain?: (param: AddEthereumChainParameter) => Promise<null>
  assetName: string
  chainId?: string
  origin: string
  getAddress: (assetName: string) => Promise<string>
  getActiveWalletAccount: () => Promise<string>
  getAsset: (assetName: string) => Promise<Asset>
  getFeeData: ({ assetName }: GetFeeDataParams) => Promise<EthereumFeeData>
  getCustomFeeRate?: () => Promise<NumberUnit>
  getSupportedChainIds?: () => Promise<string[]>
  simulateEthereumTransactions: SimulateTransactionsFn
  getActiveWalletAccountData: GetActiveWalletAccountData
  transactionSigner: EVMTransactionSignerModule
  messageSigner: EVMMessageSigner
  onEthWalletWatchAssetRequest?: (
    param: EthWalletWatchAsset,
  ) => Promise<boolean>
}

export type EVMFactory = (params: CreateEvmDepsParams) => EVMDeps

export type EVMTransactionSignerModule =
  ITransactionSignerModule<EVMUnsignedTransaction>

export type EVMDeps = {
  chainId: string
  getSupportedChainIds?: () => Promise<string[]>
  getAddress: () => Promise<string>
  sendRawTransaction: (rawTransaction: string) => Promise<EthTransactionHash>
  simulateEthereumTransactions: SimulateTransactionsFn
  getEstimatedGas: (transaction: EthTransaction) => Promise<string>
  getFeeData: () => Promise<FeeData>
  getCustomFeeData: () => Promise<FeeData | undefined>
  getNonce: () => Promise<string>
  forwardRequest: (args: EthRequestArguments) => Promise<unknown>
  transactionSigner: EVMTransactionSignerModule
  messageSigner: EVMMessageSigner
  onEthWalletWatchAssetRequest?: (
    param: EthWalletWatchAsset,
  ) => Promise<boolean>
  getActiveWalletAccountData: GetActiveWalletAccountData
  addEthereumChain?: (param: AddEthereumChainParameter) => Promise<null>
}

export type Dependencies = {
  evms: EVMDeps[]
} & CommonDeps

export interface WalletStandardDeps extends WalletStandardCommonDeps {
  provider: EthereumProvider
}

export interface EVMUnsignedTransaction {
  txData: EthTransactionParams
  txMeta: {
    eip1559Enabled: boolean
  }
}

export interface EVMMesage {
  rawMessage?: Buffer
  EIP712Message?: TypedDataV1 | TypedMessage<MessageTypes>
}
export type EVMMessageSigner = IMessageSignerModule<EVMMesage>
