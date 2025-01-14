import { Signer } from '@exodus/bip322-js'
import assert from 'minimalistic-assert'

export const signMessage = async ({ privateKey, message: _message }) => {
  assert(_message?.bip322Message, `expected bip322Message`)

  const { address, message } = _message.bip322Message
  const signedMessage = Signer.sign(Buffer.from(privateKey), address, message)

  return Buffer.isBuffer(signedMessage) ? signedMessage : Buffer.from(signedMessage, 'base64')
}
