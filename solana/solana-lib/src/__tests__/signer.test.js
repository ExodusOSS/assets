import KeyIdentifier from '@exodus/key-identifier'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import keychainDefinition from '@exodus/keychain/module/keychain.js'
import { VersionedTransaction } from '@exodus/solana-web3.js'
import assert from 'assert'
import { mnemonicToSeed } from 'bip39'

import { createGetKeyIdentifier } from '../key-identifier.js'
import { verifySignature } from '../keypair.js'
import { signUnsignedTx, signUnsignedTxWithSigner } from '../tx/index.js'

const { factory: createMultiSeedKeychain } = keychainDefinition

const SEED = mnemonicToSeed(
  'element input zero deny move siege stable screen catch like alley shoot'
)
const PUBLIC_KEY = '3c8939b872876416b1ba97d04c6a31211e39258a82d0fa45542a1cccc2617d2f'
const MESSAGE = Buffer.from(
  '010001033c8939b872876416b1ba97d04c6a31211e39258a82d0fa45542a1cccc2617d2f2c2e85e395109a73ab754dfdad48d2cdefae040d4653228245df6fe6b6d24f7300000000000000000000000000000000000000000000000000000000000000004f968728ba006a647883abdd1b8eabde24e181c8bb8e769256f9a37e73b8727901020200010c02000000b4ebad0200000000',
  'hex'
)
const VALID_SIGNATURE = Buffer.from(
  '810cdc7d804dcfab90147e50c40b0afe1f9d01fa6933739032d761f7fca4226389d348d70478560845ae9e90a940ef4173e17690b9d93122aadd56fa56b8b609',
  'hex'
)

const fixturesTransaction = [
  {
    descr: 'unsigned tx in exodus format',
    unsignedTx: {
      txData: {
        from: '55JpqX4JAjfADLmZSVfuj76xTcGa4DPLhVcJVd5cVCog',
        to: '3yU5sBNyDzb3VCj2TvpFGvr1bqgJDHyrGrjnod7kfv3k',
        amount: 44_952_500,
        fee: 90_000,
        fixedFee: 90_000,
        recentBlockhash: '6MgLUhFEXSKpDrSZyoHoQneAhEWXTDZM8A5ypkd2wqip',
        takerAmount: null,
        expectedTakerAmount: null,
      },
      txMeta: { assetName: 'solana', walletAccount: 'exodus_0', accountIndex: 0 },
    },
    expected: {
      txId: '3aeYrz8mTcovejCr977dVSqWykMJ5WTtUjPg7MiPaoKn9FSqD1bcdozi3W2bk4jhs2AeMMK5vsfU43nd7JV1Bm7n',
      rawTx:
        'AYEM3H2ATc+rkBR+UMQLCv4fnQH6aTNzkDLXYff8pCJjidNI1wR4VghFrp6QqUDvQXPhdpC52TEiqt1W+la4tgkBAAEDPIk5uHKHZBaxupfQTGoxIR45JYqC0PpFVCoczMJhfS8sLoXjlRCac6t1Tf2tSNLN764EDUZTIoJF32/mttJPcwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT5aHKLoAamR4g6vdG46r3iThgci7jnaSVvmjfnO4cnkBAgIAAQwCAAAAtOutAgAAAAA=',
    },
  },
  {
    unsignedTx: {
      txData: {
        transaction: VersionedTransaction.deserialize(
          Buffer.from(
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAHETyJObhyh2QWsbqX0ExqMSEeOSWKgtD6RVQqHMzCYX0vC0gHT3W46jBpye0/BrwyGXgq5M2OXJ03SYJWsZhLnVAaVTx+NF0rQjL9XB2gTjzwllctbeyXv6I2xi7jocdtOFjvZ3+1Y15kc3JLcOFrZAVUA06kehx7P82IhTxBXTJUg0oseEMQ1t2zdOQOfPw/pah1m4a5Y0mndtVfU4AA6pOcGzJrCZxDIwtKtVHyjv75vJQe8cvEL9m7bNTO4oxerrUUipMzi8CShVjAG9xx5AQwTg5UMM0U25fL5xbpLZS3w0AKZf83ZsMb7wHrKRBfNI6Q+Umh9gwz6TsuMr8np7TqmDxl706v8+DhD99sqevjI12OdnI4i9K3sA/a6fj+d/x5i524Hwez+Gh4WTKBpBRBzd4k1KYpCa4VYSJ+6QXLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAAR51VvyMcBu7nTFbs5oFQf9sbLeo/SOUQKxzaJWvBOPBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKk6uJA/tzXKscZ8Wa9IV+32Gwr4MqUKfFnjIZGeDsipvIyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZtD/6J/XX9kp0wJsfKVh53ksJqzbfyd1RSzIap7OM5eho0AXI+ZMD0c4P3ebXy0GF3uOL2Rg3/IC0EYQAk6LeXQcLAAUCwFwVAAsACQMEFwEAAAAAAA8GAAUAJgoNAQEKAgAFDAIAAABo62YDAAAAAA0BBQERDEANDgAFAwIGJiUHDBAMIhgiGRcDASYoGyIODQ0kIgkEGgwnDQ4dCBwBHx4hICkiFSIRFggCIyUUIg4NDSQiExIMLcEgmzNB1pyBBAMAAAAmZAABEQBkAQImZAIDaOtmAwAAAABHcZcAAAAAABQAVQ0DBQAAAQkDaUgkZ9/ZRwEqAIDSna40+Y9hacBiwMARfu9XTeHxPWoGlpVbl5hZBF1cXlhwjeZPg1KnvPPwk5a6DUfmPSkcKXOadDMI4KfSeHGZOwWdn57w7wOg1/E7gaxgJfbm4+Zj89sPWkPLfRvGT5+xsRsyVDfp50ovGAb28vf19PMB8Q==',
            'base64'
          )
        ),
      },
      txMeta: { assetName: 'solana', walletAccount: 'exodus_0', accountIndex: 0 },
    },
    expected: {
      txId: '2XD6ro5MQV6xX5tasq5pJLEXtq4to4m75mV2D3t8mH8MovmMqLU1W92ooeeAzpes4bDQSq9NaVHN4kYJYpsN8UwN',
      rawTx:
        'AUwRWhuMcrpyWy3Af7NVhRcW4TDGnDsxf4UDGGyTFPVC179bcAzc7fu0pCuSt/odg/OmSv12dJLdk+81L/Kw6AWAAQAHETyJObhyh2QWsbqX0ExqMSEeOSWKgtD6RVQqHMzCYX0vC0gHT3W46jBpye0/BrwyGXgq5M2OXJ03SYJWsZhLnVAaVTx+NF0rQjL9XB2gTjzwllctbeyXv6I2xi7jocdtOFjvZ3+1Y15kc3JLcOFrZAVUA06kehx7P82IhTxBXTJUg0oseEMQ1t2zdOQOfPw/pah1m4a5Y0mndtVfU4AA6pOcGzJrCZxDIwtKtVHyjv75vJQe8cvEL9m7bNTO4oxerrUUipMzi8CShVjAG9xx5AQwTg5UMM0U25fL5xbpLZS3w0AKZf83ZsMb7wHrKRBfNI6Q+Umh9gwz6TsuMr8np7TqmDxl706v8+DhD99sqevjI12OdnI4i9K3sA/a6fj+d/x5i524Hwez+Gh4WTKBpBRBzd4k1KYpCa4VYSJ+6QXLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADBkZv5SEXMv/srbpyw5vnvIzlu8X3EmssQ5s6QAAAAAR51VvyMcBu7nTFbs5oFQf9sbLeo/SOUQKxzaJWvBOPBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKk6uJA/tzXKscZ8Wa9IV+32Gwr4MqUKfFnjIZGeDsipvIyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZtD/6J/XX9kp0wJsfKVh53ksJqzbfyd1RSzIap7OM5eho0AXI+ZMD0c4P3ebXy0GF3uOL2Rg3/IC0EYQAk6LeXQcLAAUCwFwVAAsACQMEFwEAAAAAAA8GAAUAJgoNAQEKAgAFDAIAAABo62YDAAAAAA0BBQERDEANDgAFAwIGJiUHDBAMIhgiGRcDASYoGyIODQ0kIgkEGgwnDQ4dCBwBHx4hICkiFSIRFggCIyUUIg4NDSQiExIMLcEgmzNB1pyBBAMAAAAmZAABEQBkAQImZAIDaOtmAwAAAABHcZcAAAAAABQAVQ0DBQAAAQkDaUgkZ9/ZRwEqAIDSna40+Y9hacBiwMARfu9XTeHxPWoGlpVbl5hZBF1cXlhwjeZPg1KnvPPwk5a6DUfmPSkcKXOadDMI4KfSeHGZOwWdn57w7wOg1/E7gaxgJfbm4+Zj89sPWkPLfRvGT5+xsRsyVDfp50ovGAb28vf19PMB8Q==',
    },
  },
]

describe('signing buffers', () => {
  let signer, getPrivateKey

  beforeEach(() => {
    const getKeyIdentifier = createGetKeyIdentifier({ bip44: 2_147_484_149 })
    const seedId = getSeedId(SEED)
    const keyId = new KeyIdentifier(getKeyIdentifier({ purpose: 44, accountIndex: 0 }))
    const keychain = createMultiSeedKeychain({})
    keychain.addSeed(SEED)

    signer = {
      sign: ({ data, signatureType }) => {
        assert(signatureType === 'ed25519', `can only sign ed25519 for ${keyId.keyType} keys`)

        return keychain.ed25519.signBuffer({ seedId, keyId, data })
      },
      getPublicKey: async () => {
        const { publicKey } = await keychain.exportKey({ seedId, keyId })
        return publicKey
      },
    }

    getPrivateKey = async () => {
      const { privateKey } = await keychain.exportKey({ seedId, keyId, exportPrivate: true })
      return privateKey
    }
  })

  test('sign using signer', async () => {
    const result = await signer.sign({ data: MESSAGE, signatureType: 'ed25519' })
    expect(result.toString('hex')).toEqual(VALID_SIGNATURE.toString('hex'))
    expect(verifySignature(MESSAGE, result, PUBLIC_KEY)).toBeTruthy()
  })

  describe('signer', () => {
    it.each(fixturesTransaction)('$descr', async ({ unsignedTx, expected }) => {
      const { txId, rawTx } = await signUnsignedTxWithSigner(unsignedTx, signer)
      expect(txId).toBe(expected.txId)
      expect(rawTx).toBe(expected.rawTx)
    })
  })

  describe('private key', () => {
    it.each(fixturesTransaction)('$descr', async ({ unsignedTx, expected }) => {
      const privateKey = await getPrivateKey()
      const { txId, rawTx } = await signUnsignedTx(unsignedTx, privateKey)
      expect(txId).toBe(expected.txId)
      expect(rawTx).toBe(expected.rawTx)
    })
  })
})
