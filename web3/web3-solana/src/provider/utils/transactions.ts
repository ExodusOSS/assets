import type { TransactionVersion } from '@exodus/solana-web3.js'
import { Transaction, VersionedTransaction } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import type { Base58, Base64, Bytes } from '@exodus/web3-types'

import type {
  SignAndSendAllTransactionsInput,
  TransactionWithSendOptions,
} from '../types.js'
import type { LegacyOrVersionedTransaction } from './types.js'

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
  } catch {
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
  transaction.signatures = signedTransaction.signatures // eslint-disable-line @exodus/mutable/no-param-reassign-prop-only
}

export function normalizeSignAndSendAllTransactionInputs(
  inputs: SignAndSendAllTransactionsInput[],
  sendOptions: SendOptions,
): TransactionWithSendOptions[] {
  return inputs.map((input) => {
    if ('transaction' in input) {
      return input
    }

    return { transaction: input, options: sendOptions }
  })
}

export const getSignerPublicKey = (
  transaction: LegacyOrVersionedTransaction,
  accounts: Base58[],
) => {
  if (isLegacyTransaction(transaction)) {
    const keys = transaction.instructions.flatMap(
      (instruction) => instruction.keys,
    )
    const signer = keys.find(
      (key) => key.isSigner && accounts.includes(key.pubkey.toBase58()),
    )

    return signer?.pubkey
  }

  return transaction.message.staticAccountKeys.find((key) =>
    accounts.includes(key.toBase58()),
  )
}

export function isRawTransaction(
  transaction: LegacyOrVersionedTransaction | Bytes,
): transaction is Bytes {
  return transaction instanceof Uint8Array
}
