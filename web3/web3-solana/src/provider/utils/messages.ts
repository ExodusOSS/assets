import { PublicKey } from '@exodus/solana-web3.js'
import type { Base64, Bytes } from '@exodus/web3-types'

import { SignMessageOptions } from '../types.js'
import type { SolDisplayEncoding as DisplayEncoding } from './types.js'

export function serializeEncodedMessage(encodedMessage: Bytes): Base64 {
  return Buffer.from(encodedMessage).toString('base64')
}

export function normalizeSignMessageOptions(options: SignMessageOptions = {}): {
  display?: DisplayEncoding
  publicKey?: PublicKey
} {
  if (typeof options === 'string') {
    return { display: options }
  }

  return options
}
