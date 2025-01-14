import { signDetachedSync } from '@exodus/crypto/curve25519'
import assert from 'minimalistic-assert'

import { assertValidMessage } from './validation.js'

export const signMessageNew = async ({ privateKey, message }) => {
  const { rawMessage } = assertValidMessage(message)

  assert(
    Buffer.isBuffer(privateKey) || privateKey instanceof Uint8Array,
    `privateKey is not a Buffer or Uint8Array`
  )

  return signDetachedSync({ message: rawMessage, privateKey, format: 'buffer' })
}
