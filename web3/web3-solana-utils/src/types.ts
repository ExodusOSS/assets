import type {
  Message,
  Transaction,
  VersionedMessage,
  VersionedTransaction,
  PublicKey,
  TransactionMessage,
} from '@exodus/solana-web3.js'
import type {
  AggregatedTransactionSimulationResult,
  SimulateTransactionParams,
} from '@exodus/web3-types'

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

export { Transaction }
