import { PublicKey } from '@exodus/solana-web3.js'

import type { Base58 } from '@exodus/web3-types'

export function serializePublicKey(publicKey: PublicKey): Base58 {
  return publicKey.toBase58()
}

export function deserializePublicKey(wirePublicKey: Base58): PublicKey {
  return new PublicKey(wirePublicKey)
}

export function condensePublicKey(publicKey: PublicKey): string {
  const base58PublicKey = publicKey.toBase58()
  return `${base58PublicKey.slice(0, 4)}..${base58PublicKey.slice(-4)}`
}
