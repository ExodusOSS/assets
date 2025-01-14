import { crypto } from '@exodus/bitcoinjs'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import assert from 'minimalistic-assert'

import defaultEntropy from './default-entropy.cjs'

function tweakPrivateKey({ privateKey, tweakHash }) {
  assert(privateKey, 'Private key is required for tweaking signer!')
  const publicKey = secp256k1.privateKeyToPublicKey({ privateKey, format: 'buffer' })
  if (publicKey[0] === 3) privateKey = secp256k1.privateKeyTweakNegate({ privateKey })
  const tweak = tapTweakHash(publicKey, tweakHash)
  return secp256k1.privateKeyTweakAdd({ privateKey, tweak, format: 'buffer' })
}

export const tweakPublicKey = ({ publicKey, tweak }) => {
  // This is different from secp256k1.publicKeyTweakAddScalar when publicKey[0] is 3
  const xOnly = secp256k1.publicKeyToX({ publicKey })
  return secp256k1.xOnlyTweakAdd({ xOnly, tweak, format: 'buffer' })
}

export const tapTweakHash = (publicKey, h) => {
  const xOnly = secp256k1.publicKeyToX({ publicKey })
  return crypto.taggedHash('TapTweak', Buffer.concat(h ? [xOnly, h] : [xOnly]))
}

export function toAsyncSigner({ privateKey, publicKey, isTaprootKeySpend }) {
  assert(privateKey, 'privateKey is required')
  assert(publicKey, 'publicKey is required')

  if (isTaprootKeySpend) {
    privateKey = tweakPrivateKey({ privateKey })
    publicKey = tweakPublicKey({ publicKey, tweak: tapTweakHash(publicKey) })
  }

  return {
    sign: async (hash) =>
      secp256k1.ecdsaSignHash({
        hash,
        privateKey,
        extraEntropy: null, // TODO: can we flip this to true?
        format: 'buffer',
      }),
    signSchnorr: async (data) =>
      secp256k1.schnorrSign({
        data,
        privateKey,
        extraEntropy: defaultEntropy.getSchnorrEntropy(), // mockable with jest.spyOn
        format: 'buffer',
      }),
    publicKey,
    privateKey,
  }
}

// signer: {
//   sign: ({ data, ecOptions, enc, purpose, keyId, signatureType, tweak, extraEntropy }: KeychainSignerParams): Promise<any>
//   getPublicKey: ({ keyId }) => Promise<Buffer>
// }
//
export async function toAsyncBufferSigner({ signer, keyId, isTaprootKeySpend }) {
  let tweak
  let publicKey = await signer.getPublicKey({ keyId })
  if (isTaprootKeySpend) {
    tweak = tapTweakHash(publicKey)
    publicKey = tweakPublicKey({ publicKey, tweak })
  }

  return {
    sign: async (data) => {
      return signer.sign({ data, keyId, enc: 'sig', signatureType: 'ecdsa' })
    },
    signSchnorr: async (data) => {
      return signer.sign({
        data,
        keyId,
        signatureType: 'schnorr',
        tweak,
        // defaultEntropy.getSchnorrEntropy() is mockable with jest.spyOn
        extraEntropy: defaultEntropy.getSchnorrEntropy(),
      })
    },
    publicKey,
  }
}
