import type { Base64, Bytes } from '@exodus/web3-types'

export function serializeEncodedMessage(encodedMessage: Bytes): Base64 {
  return Buffer.from(encodedMessage).toString('base64')
}
