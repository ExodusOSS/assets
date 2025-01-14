import {
  edwardsToPublicSync,
  signDetachedSync,
  verifyDetachedSync,
} from '@exodus/crypto/curve25519'
import { randomBytes } from '@exodus/crypto/randomBytes'

import { PublicKey } from './vendor/publickey.js'

export function getKeyPairFromPrivateKey(seed) {
  const pair = Buffer.from(seed, 'hex')
  const privateKey = pair.subarray(0, 32)
  const publicKey = edwardsToPublicSync({ privateKey, format: 'buffer' })

  // Recheck just in case
  if (pair.length === 64) {
    if (Buffer.compare(pair.subarray(32), publicKey) !== 0) throw new Error('Mismatching keypair')
  } else if (pair.length !== 32) {
    throw new Error('Wrong key size, should be 32 (seed) or 64 (pair)')
  }

  return { privateKey, publicKey }
}

export function generateKeyPair() {
  const { publicKey, privateKey } = getKeyPairFromPrivateKey(randomBytes(32))

  return {
    privateKey,
    publicKey: new PublicKey(publicKey),
  }
}

export function getPublicKey(privateKey) {
  return getKeyPairFromPrivateKey(privateKey).publicKey
}

export function sign(data, privateKey) {
  return signDetachedSync({
    message: data,
    privateKey: Buffer.from(privateKey, 'hex'),
    format: 'buffer',
  })
}

export function verifySignature(data, signature, publicKey) {
  return verifyDetachedSync({ message: data, signature, publicKey: Buffer.from(publicKey, 'hex') })
}
