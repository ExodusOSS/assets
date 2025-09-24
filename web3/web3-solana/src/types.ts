import type {
  Blockhash as SolBlockhash,
  PublicKey as SolPublicKey,
} from '@exodus/solana-web3.js'
import type {
  Commitment as SolCommitment,
  SendOptions as SolSendOptions,
} from '@exodus/solana-web3.js/lib/connection.js'
import type { WalletStandardCommonDeps } from '@exodus/web3-provider'
import type { CommonDeps } from '@exodus/web3-rpc-handlers'
import type {
  LegacyOrVersionedTransaction,
  SolAggregatedTransactionSimulationResult,
  SolSimulateTransactionParams,
} from '@exodus/web3-solana-utils'
import type {
  Asset,
  Base58,
  Base64,
  Bytes,
  GetActiveWalletAccountData,
  GetLedgerDevice,
  IMessageSignerModule,
  ITransactionSignerModule,
  WalletAccountData,
} from '@exodus/web3-types'

import type { SolanaProvider } from './provider/provider.js'

export interface WalletStandardDeps extends WalletStandardCommonDeps {
  provider: SolanaProvider
}

export interface SolanaUnsignedTransaction {
  txData: {
    transaction: LegacyOrVersionedTransaction
    transactionBuffer: Bytes
  }
  txMeta: unknown
}

export interface SolanaMessage {
  rawMessage: Buffer
}

export interface CreateSolanaDepsParams {
  getActiveWalletAccountData: GetActiveWalletAccountData
  getWalletAccountsData: () => Promise<Record<string, WalletAccountData>>
  getAddress(assetName: string): Promise<string>
  getAddressByWalletAccount: (
    assetName: string,
    walletAccount: string,
  ) => Promise<string>
  getAsset: (assetName: string) => Promise<Asset>
  getLedgerDevice?: GetLedgerDevice
  getPrivateKey?: (
    assetName: string,
  ) => Promise<{ publicKey: Bytes; privateKey: Bytes }>
  getRecentBlockHash: (commitment?: SolCommitment) => Promise<string>
  sendRawTransaction: (
    assetName: string,
    rawTransaction: Base64,
    options: SolSendOptions,
  ) => Promise<void>
  simulationAPIBaseURL: string
  transactionSigner: ITransactionSignerModule<SolanaUnsignedTransaction>
  messageSigner: IMessageSignerModule<SolanaMessage>
}

export type SolanaDeps = {
  getPublicKey: (
    walletAccount?: string,
  ) => Promise<{ toBase58: SolPublicKey['toBase58'] }>
  sendRawTransaction: (
    rawTransaction: Buffer,
    options: SolSendOptions,
  ) => Promise<void>
  getLatestBlockhash: (commitment?: SolCommitment) => Promise<SolBlockhash>
  simulateSolanaTransactions: (
    params: SolSimulateTransactionParams,
  ) => Promise<SolAggregatedTransactionSimulationResult>
  transactionSigner: ITransactionSignerModule<SolanaUnsignedTransaction>
  getActiveWalletAccountData: GetActiveWalletAccountData
  getWalletAccountsData: () => Promise<Record<string, WalletAccountData>>
  messageSigner: IMessageSignerModule<SolanaMessage>
}

export interface SolanaMobileConnection {
  name?: string
  origin?: string
  icon?: string
  cluster?: string
  isVerified: boolean
}

export type SolanaMobileDeps = {
  setActiveConnection?: (conn: SolanaMobileConnection) => Promise<void>
  showError?: (network: string, error: unknown) => Promise<void>
  setPublicKey: (account: Base58) => Promise<void>
  getPublicKey: () => Promise<SolPublicKey>
  getSecretKey: (addressToSignWith: string) => Promise<Bytes>
  sendRawTransaction: (
    rawTransaction: Buffer,
    options: SolSendOptions,
  ) => Promise<void>
  simulateSolanaTransactions: (
    params: SolSimulateTransactionParams,
  ) => Promise<SolAggregatedTransactionSimulationResult>
}

export type Dependencies = {
  solana?: SolanaDeps
  solanaMobile?: SolanaMobileDeps
} & CommonDeps
