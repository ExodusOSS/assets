import type { Transaction } from '@exodus/bitcoinjs'
import type {
  AggregatedTransactionSimulationResult,
  Base64,
  NumberUnit,
  Asset,
} from '@exodus/web3-types'

export type { Transaction }

export type IndexToAddressRecord = Record<
  number,
  { address: string; sigHash: number }
>

export interface Inscription {
  offset: number
  inscriptionId: string
}

export type RawTransaction = {
  vout: {
    inscriptions: Inscription[]
    value: string
  }[]
}

export interface InsightClient {
  fetchTxObject(txId: string): Promise<RawTransaction>
}

export type AssetWithInsightClient = Asset & { insightClient: InsightClient }

export interface BtcSimulateTransactionParams {
  asset: Asset
  indexToAddressRecord: IndexToAddressRecord
  walletAddresses: Record<string, boolean>
  transactions: Base64[]
}

export interface TransactionInputDetail {
  txID: string
  index: number
  value: NumberUnit
  address?: string // Exists only if the address belongs to the wallet.
}

export interface TransactionOutputDetail {
  value: NumberUnit
  address: string
  isWalletAddress: boolean // Whether the address belongs to the wallet.
}

export interface BitcoinAdvancedDetails {
  inputs: Array<TransactionInputDetail>
  outputs: Array<TransactionOutputDetail>
}

export type BtcAggregatedTransactionSimulationResult =
  AggregatedTransactionSimulationResult<unknown, BitcoinAdvancedDetails>
