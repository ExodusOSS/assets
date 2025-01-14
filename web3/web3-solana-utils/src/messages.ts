import type { SolDisplayEncoding as DisplayEncoding } from './types.js'
import type { Base64, Bytes } from '@exodus/web3-types'

// TODO: Dedupe.
export function encodeMessage(message: string): Bytes {
  return new Uint8Array(Buffer.from(message))
}

// TODO: Dedupe.
export function decodeMessage(
  encodedMessage: Bytes,
  display: DisplayEncoding,
): string {
  if (display === 'utf8') {
    return Buffer.from(encodedMessage).toString()
  }

  if (display === 'hex') {
    return `0x${Buffer.from(encodedMessage).toString('hex')}`
  }

  throw new Error(`Unknown display: '${display}'`)
}

export function serializeEncodedMessage(encodedMessage: Bytes): Base64 {
  return Buffer.from(encodedMessage).toString('base64')
}

export function deserializeEncodedMessage(wireEncodedMessage: Base64): Bytes {
  return Buffer.from(wireEncodedMessage, 'base64')
}
