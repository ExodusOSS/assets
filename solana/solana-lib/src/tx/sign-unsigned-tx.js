import { signDetached } from '@exodus/crypto/curve25519'
import bs58 from 'bs58'
import assert from 'minimalistic-assert'

import { getKeyPairFromPrivateKey } from '../keypair.js'
import { PublicKey } from '../vendor/index.js'
import { extractTransaction } from './common.js'
import { prepareForSigning } from './prepare-for-signing.js'

/**
 *
 * @param {*} unsignedTx
 * @param {Object} asyncSigner object: `{ sign: async (buffer) => Promise<>, getPublicKey: async () => Promise<any>}`
 * @returns
 */
export async function signUnsignedTxWithSigner(unsignedTx, signer) {
  assert(signer, 'Please provide a signer')

  const tx = prepareForSigning(unsignedTx)

  await _signTx({ tx, signer })

  return extractTransaction({ tx })
}

export async function signUnsignedTx(unsignedTx, privateKey) {
  assert(privateKey, 'Please provide a secretKey')

  const tx = prepareForSigning(unsignedTx)

  const { privateKey: privateKey32, publicKey } = getKeyPairFromPrivateKey(privateKey)
  const signer = {
    getPublicKey: () => publicKey,
    sign: async ({ data }) => signDetached({ message: data, privateKey: privateKey32 }),
  }
  await _signTx({ tx, signer })

  return extractTransaction({ tx })
}

// Signs plain tx.
const _signTx = async ({ tx, signer }) => {
  const publicKey = new PublicKey(bs58.encode(Buffer.from(await signer.getPublicKey())))
  const messageData = tx.message.serialize()
  const signature = await signer.sign({ data: messageData, signatureType: 'ed25519' })
  tx.addSignature(publicKey, signature)
}
