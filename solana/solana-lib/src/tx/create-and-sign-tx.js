import { createUnsignedTx } from './create-unsigned-tx.js'
import { signUnsignedTx } from './sign-unsigned-tx.js'

export async function createAndSignTx(input, privateKey) {
  const unsignedTx = createUnsignedTx(input)
  return signUnsignedTx(unsignedTx, privateKey)
}
