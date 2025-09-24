import { signDetachedSync } from '@exodus/crypto/curve25519'
import type { Base58, Base64, Bytes } from '@exodus/web3-types'
import bs58 from 'bs58'

// As per:
// https://github.com/solana-labs/solana-web3.js/blob/61433de0d39686c6ad4f0b3cb5b95a68a058aa04/src/transaction.ts#L682
export const MAX_SIGNATURES = 255

export const SIGNATURE_LENGTH = 64 // ed25519

export function serializeTransactionSignature(signature: Bytes): Base58 {
  return bs58.encode(signature)
}

export function deserializeTransactionSignature(
  encodedSignature: Base58,
): Bytes {
  return bs58.decode(encodedSignature)
}

export function serializeMessageSignature(signature: Bytes): Base64 {
  return Buffer.from(signature).toString('base64')
}

export function deserializeMessageSignature(wireSignature: Base64): Bytes {
  return Buffer.from(wireSignature, 'base64')
}

// TODO: make this async
export function sign(message: Bytes, secretKey: Bytes): Bytes {
  return signDetachedSync({ message, privateKey: secretKey.subarray(0, 32) })
}
