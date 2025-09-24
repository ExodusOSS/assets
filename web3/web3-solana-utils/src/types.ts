import type {
  Message,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
} from '@exodus/solana-web3.js'
import type {
  AggregatedTransactionSimulationResult,
  Asset,
  SimulateTransactionParams,
} from '@exodus/web3-types'

export interface SolanaSignInInput {
  /**
   * Optional EIP-4361 Domain.
   * If not provided, the wallet must determine the Domain to include in the message.
   */
  readonly domain?: string
  /**
   * Optional EIP-4361 Address.
   * If not provided, the wallet must determine the Address to include in the message.
   */
  readonly address?: string
  /**
   * Optional EIP-4361 Statement.
   * If not provided, the wallet must not include Statement in the message.
   */
  readonly statement?: string
  /**
   * Optional EIP-4361 URI.
   * If not provided, the wallet must not include URI in the message.
   */
  readonly uri?: string
  /**
   * Optional EIP-4361 Version.
   * If not provided, the wallet must not include Version in the message.
   */
  readonly version?: string
  /**
   * Optional EIP-4361 Chain ID.
   * If not provided, the wallet must not include Chain ID in the message.
   */
  readonly chainId?: string
  /**
   * Optional EIP-4361 Nonce.
   * If not provided, the wallet must not include Nonce in the message.
   */
  readonly nonce?: string
  /**
   * Optional EIP-4361 Issued At.
   * If not provided, the wallet must not include Issued At in the message.
   */
  readonly issuedAt?: string
  /**
   * Optional EIP-4361 Expiration Time.
   * If not provided, the wallet must not include Expiration Time in the message.
   */
  readonly expirationTime?: string
  /**
   * Optional EIP-4361 Not Before.
   * If not provided, the wallet must not include Not Before in the message.
   */
  readonly notBefore?: string
  /**
   * Optional EIP-4361 Request ID.
   * If not provided, the wallet must not include Request ID in the message.
   */
  readonly requestId?: string
  /**
   * Optional EIP-4361 Resources.
   * If not provided, the wallet must not include Resources in the message.
   */
  readonly resources?: readonly string[]
}

export type SolanaSignInInputWithRequiredFields = SolanaSignInInput &
  Required<Pick<SolanaSignInInput, 'domain' | 'address'>>

export type SolDisplayEncoding = 'utf8' | 'hex'

export type LegacyOrVersionedTransaction = Transaction | VersionedTransaction

export interface SolSimulateTransactionParams
  extends SimulateTransactionParams {
  transactions: LegacyOrVersionedTransaction[]
  senderAddress: string
}

export type SolAggregatedTransactionSimulationResult =
  AggregatedTransactionSimulationResult<unknown, AdvancedDetails>

export type DecodedTransactionInstruction = {
  title: string
  data: Record<string, PublicKey>
}

export type PreparedMessages = {
  compiled: Message | VersionedMessage
  decompiled?: TransactionMessage | null | undefined
}

export type AdvancedDetails = Array<{
  title: string
  instructions: {
    name: string
    value: string
    formattedValue: string
  }[]
  decompiledProgram?: string[]
}>

export interface SolanaSimulateMessageParams {
  asset: Asset
  message: string
  url: URL
  address: string
}

export { type Transaction } from '@exodus/solana-web3.js'
