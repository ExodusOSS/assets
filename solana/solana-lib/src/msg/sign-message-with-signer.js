import assert from 'minimalistic-assert'

import { assertValidMessage } from './validation.js'

const signMessageWithSigner = async ({ signer, message }) => {
  const { rawMessage } = assertValidMessage(message)

  assert(
    typeof signer === 'object' && typeof signer.sign === 'function',
    'expected signer with a sign method'
  )

  return signer.sign({ data: rawMessage, signatureType: 'ed25519' })
}

export default signMessageWithSigner
