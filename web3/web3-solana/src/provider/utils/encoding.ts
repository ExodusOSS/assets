import type { Base64 } from '@exodus/web3-types'

export const toUint8Array = (data: Base64): Uint8Array => {
  return Uint8Array.from(Buffer.from(data, 'base64'))
}
