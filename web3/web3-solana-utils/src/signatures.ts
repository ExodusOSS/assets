import * as bs58 from 'bs58'
import nacl from 'tweetnacl'

import type { Base58, Base64, Bytes } from '@exodus/web3-types'

// As per:
// https://github.com/solana-labs/solana-web3.js/blob/61433de0d39686c6ad4f0b3cb5b95a68a058aa04/src/transaction.ts#L682
export const MAX_SIGNATURES = 255

export const SIGNATURE_LENGTH = nacl.sign.signatureLength

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

export function sign(message: Bytes, secretKey: Bytes): Bytes {
  return nacl.sign.detached(message, secretKey)
}
