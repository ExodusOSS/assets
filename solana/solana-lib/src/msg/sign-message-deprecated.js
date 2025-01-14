import { signDetachedSync } from '@exodus/crypto/curve25519'
import bs58 from 'bs58'
import assert from 'minimalistic-assert'

import { isTransactionMessage } from './validation.js'

/**
 * @deprecated please use messageSigner
 */
export function signMessage({ message, privateKey }) {
  const messageBuffer = bs58.decode(message)
  assert(
    !isTransactionMessage(messageBuffer),
    'attempted to sign transaction using message signing'
  )
  const signature = signDetachedSync({
    message: messageBuffer,
    privateKey: Buffer.from(privateKey, 'hex').subarray(0, 32),
  })
  return bs58.encode(signature)
}
