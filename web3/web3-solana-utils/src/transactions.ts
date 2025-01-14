import solanaApi from '@exodus/solana-api'
import {
  AddressLookupTableAccount,
  Message,
  PACKET_DATA_SIZE,
  PublicKey,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@exodus/solana-web3.js'

import { VersionedTransactionUnsupportedError } from './errors.js'
import {
  MAX_SIGNATURES,
  SIGNATURE_LENGTH,
  serializeTransactionSignature,
} from './signatures.js'

import type { LegacyOrVersionedTransaction, PreparedMessages } from './types.js'
import type { TransactionVersion } from '@exodus/solana-web3.js'
import type { Base58, Base64, Bytes } from '@exodus/web3-types'

export const VERSIONED_TRANSACTION_SUPPORTED = !!VersionedTransaction
export const SUPPORTED_TRANSACTION_VERSIONS: ReadonlySet<TransactionVersion> =
  new Set(['legacy', 0])

export function getTransactionId(
  transaction: LegacyOrVersionedTransaction,
): Base58 {
  const signature = getFirstSignature(transaction)
  if (signature === null) {
    throw new Error('Cannot get transaction ID of unsigned transaction')
  }

  return serializeTransactionSignature(signature)
}

export function getFirstSignature(
  transaction: LegacyOrVersionedTransaction,
): Buffer | null {
  if (isLegacyTransaction(transaction)) {
    return transaction.signature
  }

  if (transaction.signatures.length > 0) {
    return Buffer.from(transaction.signatures[0])
  }

  return null
}

function isLegacyMessage(data: Bytes): boolean {
  try {
    const message = Message.from(data)
    message.serialize() // Invalid messages will throw on serialization.
    return true
  } catch (err) {
    return false
  }
}

function isVersionedMessage(data: Bytes) {
  if (data.length > 1) {
    // We deploy a heuristic to detect transaction messages.
    // The first bytes of a transaction message contains its version number
    // so we ban all bytes starting at 0x80 and ending at 0xFE
    // 0xFF is allowed because that is used for offchain messages
    return data[0] >= 0x80 && data[0] != 0xff
  } else {
    return false
  }
}

export function isTransactionMessage(data: Bytes): boolean {
  const messageBuffer = Buffer.from(data)
  return isLegacyMessage(messageBuffer) || isVersionedMessage(messageBuffer)
}

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

// Copied from:
// https://github.com/solana-labs/solana-web3.js/blob/42612c936d8d4ddbcb09dbb73db9e1aeaf6d8764/src/util/shortvec-encoding.ts#L15-L28.
function encodeLength(bytes: number[], length: number) {
  let remainingLength = length

  for (;;) {
    let element = remainingLength & 0x7f

    remainingLength >>= 7
    if (remainingLength === 0) {
      bytes.push(element)
      break
    }

    element |= 0x80
    bytes.push(element)
  }
}

export function buildRawTransaction(
  signData: Buffer,
  signatures: (Uint8Array | null)[],
) {
  const signatureCount: number[] = []
  encodeLength(signatureCount, signatures.length)

  const signaturesLength =
    signatureCount.length + signatures.length * SIGNATURE_LENGTH
  const rawTransactionLength = signData.length + signaturesLength

  if (signatures.length > MAX_SIGNATURES) {
    throw Error(`Too many signatures: ${signatures.length} > ${MAX_SIGNATURES}`)
  }

  if (rawTransactionLength > PACKET_DATA_SIZE) {
    throw Error(
      `Transaction too large: ${rawTransactionLength} > ${PACKET_DATA_SIZE}`,
    )
  }

  const rawTransaction = Buffer.alloc(rawTransactionLength)
  Buffer.from(signatureCount).copy(rawTransaction)

  signatures.forEach((signature, index) => {
    if (signature === null) {
      return
    }

    if (signature.length !== SIGNATURE_LENGTH) {
      throw Error('Invalid signature length')
    }

    Buffer.from(signature).copy(
      rawTransaction,
      signatureCount.length + index * SIGNATURE_LENGTH,
    )
  })

  signData.copy(rawTransaction, signaturesLength)

  return rawTransaction
}

export function isLegacyTransaction(
  transaction: LegacyOrVersionedTransaction,
): transaction is Transaction {
  return !Number.isInteger((transaction as VersionedTransaction).version)
}

export function isTransactionVersionSupported(
  transaction: VersionedTransaction,
): boolean {
  return SUPPORTED_TRANSACTION_VERSIONS.has(transaction.version)
}

export async function prepareSolTransactions(
  transactions: LegacyOrVersionedTransaction[],
): Promise<PreparedMessages[]> {
  const messages = []
  for (const transaction of transactions) {
    if (isLegacyTransaction(transaction)) {
      messages.push({
        compiled: (transaction as Transaction).compileMessage(),
      })
    } else {
      const message: PreparedMessages = {
        compiled: (transaction as VersionedTransaction).message,
        decompiled: null,
      }

      try {
        message.decompiled = await decompileTransactionMessage(
          transaction as VersionedTransaction,
        )
      } catch (err: unknown) {
        console.warn('error preparing sol tarnsaction', (err as Error).message)
        // ToDo: accept a logger dep and log the error
      }

      messages.push(message)
    }
  }

  return messages
}

export async function decompileTransactionMessage(
  transactionMessage: VersionedTransaction,
): Promise<TransactionMessage | null> {
  const lookupTableAccounts = await Promise.all(
    transactionMessage.message.addressTableLookups.map((tableLookup) =>
      getAddressLookupTable(tableLookup.accountKey.toString()),
    ),
  )

  if (!lookupTableAccounts) {
    return null
  }

  return TransactionMessage.decompile(transactionMessage.message, {
    addressLookupTableAccounts:
      lookupTableAccounts as AddressLookupTableAccount[],
  })
}

async function getAddressLookupTable(
  accountAddress: string,
): Promise<AddressLookupTableAccount | null> {
  const res = await solanaApi.getAccountInfo(accountAddress)

  const state = res?.data?.parsed?.info

  if (!state) {
    return null
  }

  return new AddressLookupTableAccount({
    key: new PublicKey(accountAddress),
    state,
  })
}

export function applySignatures(
  transaction: LegacyOrVersionedTransaction,
  signedTransaction: LegacyOrVersionedTransaction,
) {
  transaction.signatures = signedTransaction.signatures
}
