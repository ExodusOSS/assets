import type { Base58, Base64, Bytes } from '@exodus/web3-types'
import bs58 from 'bs58'

export function deserializeTransactionSignature(
  encodedSignature: Base58,
): Bytes {
  return bs58.decode(encodedSignature)
}

export function deserializeMessageSignature(wireSignature: Base64): Bytes {
  return Buffer.from(wireSignature, 'base64')
}
