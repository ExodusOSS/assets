import { PublicKey } from '@exodus/solana-web3.js'

import type { Base58 } from '@exodus/web3-types'

export function deserializePublicKey(wirePublicKey: Base58): PublicKey {
  return new PublicKey(wirePublicKey)
}
