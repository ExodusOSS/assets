import type { Transaction, VersionedTransaction } from '@exodus/solana-web3.js'

export type LegacyOrVersionedTransaction = Transaction | VersionedTransaction

export type SolDisplayEncoding = 'utf8' | 'hex'
