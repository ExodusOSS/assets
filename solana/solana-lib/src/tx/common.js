import { VersionedTransaction } from '@exodus/solana-web3.js'
import base58 from 'bs58'

export function isVersionedTransaction(tx) {
  return Number.isInteger(tx.version)
}

export function isLegacyTransaction(tx) {
  return !isVersionedTransaction(tx)
}

export function transactionToBase58(tx) {
  return base58.encode(tx.serialize())
}

export function deserializeTransaction(tx) {
  return VersionedTransaction.deserialize(tx)
}

export function getTxId(tx) {
  const signature = getFirstSignature(tx)
  if (signature === null) {
    throw new Error('Cannot get transaction ID of unsigned transaction')
  }

  return base58.encode(signature)
}

function getFirstSignature(tx) {
  if (tx.signatures.length > 0) {
    return tx.signatures[0]
  }

  return null
}

export const extractTransaction = ({ tx }) => {
  const serializedTransaction = tx.serialize({
    // Override the default, we don't require all signatures
    // when interacting with dApps. Only affects legacy transactions,
    // because versioned transactions won't be doing this check anymore.
    requireAllSignatures: false,
    verifySignatures: true,
  })
  const rawTx = Buffer.from(serializedTransaction).toString('base64')
  const txId = getTxId(tx)

  return { txId, rawTx }
}
