import { Transaction, VersionedTransaction } from '@exodus/solana-web3.js'

import type { LegacyOrVersionedTransaction } from './types.js'
import type { TransactionVersion } from '@exodus/solana-web3.js'
import type { Base64, Bytes } from '@exodus/web3-types'

class VersionedTransactionUnsupportedError extends Error {
  constructor() {
    super('Versioned transactions are not supported.')
    this.name = 'VERSIONED_TRANSACTION_UNSUPPORTED'
  }
}

export const SUPPORTED_TRANSACTION_VERSIONS: ReadonlySet<TransactionVersion> =
  new Set(['legacy', 0])

export function serializeTransactionAsBytes(
  transaction: LegacyOrVersionedTransaction,
): Buffer {
  if (isLegacyTransaction(transaction)) {
    return Buffer.from(transaction.serialize({ requireAllSignatures: false }))
  }

  return Buffer.from(transaction.serialize())
}

export function serializeTransaction(
  transaction: LegacyOrVersionedTransaction,
): Base64 {
  return serializeTransactionAsBytes(transaction).toString('base64')
}

export function deserializeTransactionBytes(
  wireTransactionBuffer: Bytes,
): LegacyOrVersionedTransaction {
  try {
    return Transaction.from(wireTransactionBuffer)
  } catch (err) {
    if (!VersionedTransaction) {
      throw new VersionedTransactionUnsupportedError()
    }
    return VersionedTransaction.deserialize(
      Uint8Array.from(wireTransactionBuffer),
    )
  }
}

export function deserializeTransaction(
  wireTransaction: Base64,
): LegacyOrVersionedTransaction {
  const wireTransactionBuffer = Buffer.from(wireTransaction, 'base64')
  return deserializeTransactionBytes(wireTransactionBuffer)
}

export function isLegacyTransaction(
  transaction: LegacyOrVersionedTransaction,
): transaction is Transaction {
  return !Number.isInteger((transaction as VersionedTransaction).version)
}

export function applySignatures(
  transaction: LegacyOrVersionedTransaction,
  signedTransaction: LegacyOrVersionedTransaction,
) {
  transaction.signatures = signedTransaction.signatures
}
