import { randomBytes } from '@exodus/crypto/randomBytes'
import { privateKeyToPublicKey } from '@exodus/crypto/secp256k1'

import { tapTweakHash, toAsyncSigner, tweakPublicKey } from '../tx-sign/taproot.js'

const fixtures = [
  {
    // fixtures created by logging inside toAsyncSigner in '../tx-sign/taproot' while running existing tests
    priv: '90de83eea26049afc40ba7d13fd8d4537331cd226f17051c97ca56c696af66b5',
    pub: '0273ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91',
    tweak: '316fb252f50a55c468b86b951093b5a56d8cac0a178d066899b9520c694ce8c6',
    priv2: 'c24e3641976a9f742cc41366506c89f8e0be792c86a40b853183a8d2fffc4f7b',
    pub2: '02c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92',
  },
  {
    priv: 'fc7458de3d5616e7803fdc81d688b9642641be32fee74c4558ce680cac3d4111',
    pub: '03d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151',
    tweak: '889d1150469d1d5e831c7a8d584b8202db2ac29915fc5e33b145e34e445902b9',
    priv2: '8c28b8720947067702dc9e0b81c2c89d6f97e14cc65db22a1849d9ce685202e9',
    pub2: '0351adaba657ce3a0758dc1a3e37be9d86048288f26674f503d2d2366010680f17',
  },
]

describe('Taproot', () => {
  it('tweak public key', async () => {
    for (const fixture of fixtures) {
      const keyPair = {
        privateKey: Buffer.from(fixture.priv, 'hex'),
        publicKey: Buffer.from(fixture.pub, 'hex'),
      }

      const tweaked = toAsyncSigner({ ...keyPair, isTaprootKeySpend: true })

      expect(tweaked.privateKey.toString('hex')).toBe(fixture.priv2)
      expect(tweaked.publicKey.toString('hex')).toBe(fixture.pub2)

      const tweak = tapTweakHash(keyPair.publicKey)
      expect(tweak.toString('hex')).toBe(fixture.tweak)

      const tweakedPublicKey = tweakPublicKey({ publicKey: keyPair.publicKey, tweak })
      expect(tweakedPublicKey.toString('hex')).toBe(fixture.pub2)
    }

    for (let i = 0; i < 20; i++) {
      const privateKey = randomBytes(32)
      const publicKey = privateKeyToPublicKey({ privateKey })

      // constructs public by tweaking private
      const tweaked = toAsyncSigner({ privateKey, publicKey, isTaprootKeySpend: true })

      // tweaks public directly
      const tweak = tapTweakHash(publicKey)
      const tweakedPublicKey = tweakPublicKey({ publicKey, tweak })

      expect(tweaked.publicKey).toEqual(tweakedPublicKey)
    }
  })
})
