import BIP32 from '@exodus/bip32'
import { mnemonicToSeed } from '@exodus/bip39'
import { FINAL_SEQUENCE, RBF_SEQUENCE } from '@exodus/bitcoin-lib'
import KeyIdentifier from '@exodus/key-identifier'
import { parseDerivationPath } from '@exodus/key-utils'
import { getSeedId } from '@exodus/keychain/module/crypto/seed-id.js'
import keychainDefinition from '@exodus/keychain/module/keychain.js'
import seedBasedTransactionSignerDefinition from '@exodus/tx-signer/lib/module/seed-signer.js'
import lodash from 'lodash'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const { keyBy, mapValues } = lodash

const { factory: createMultiSeedKeychain } = keychainDefinition
const { factory: createSeedBasedTransactionSigner } = seedBasedTransactionSignerDefinition

const asset = assetPlugin.createAsset({ assetClientInterface })
asset.baseAsset = asset

const createHdKey = (xpriv) => BIP32.fromXPriv(xpriv)

const SEED = await mnemonicToSeed({
  mnemonic: 'cousin access oak tragic entire dynamic marine expand govern enjoy honey tissue',
})

const RAW_TX =
  '02000000000102a0171cd5dfbe01f0761e84878487222d439cc0de6ece880b95d217b17fc06e2c000000006a4730440220013ecaaa22220e32f024fc0537db877e7897dd3ee72d5a258b056843a4fb525a02201bf51913a87f3629fb1ae479bcd071ec4a45e0a932b99bc151b11da2a5ae3c770121027135776e6628b3da577e6775193bc219ac054034eda1041138313bc1b4f1110dffffffffa01277a2640e535bb717905619a3730f79ef88c6d3b20aa3eac9f81c5ca168250000000000fdffffff02200b2000000000001976a91434a16426c70a61040314b9d6bf3fc57cb9f7716488ac704c8900000000001600146442b6940261fd6fa63574cc60eeff021dcd2581000247304402203d815d5d689fe4c564537cac9696ab2dfd1b32016e66f749bf912d86c01b03f3022006bd85b503c71b44273ec14536463c30007ee00832f9fb196aeceacf7995d4d0012102c03ea02def600839c25ec2021143e8c82904b506da8729f16984e115341b310f00000000'

const PURPOSES = [44, 84, 86]

const keychain = createMultiSeedKeychain({})
keychain.addSeed(SEED)

const seedId = getSeedId(SEED)

const createBitcoinSignedTransaction = asset.api.signTx

const accountIndex = 0

// Ported from desktop!

const unsignedTx = {
  txData: {
    inputs: [
      {
        txId: '2c6ec07fb117d2950b88ce6edec09c432d22878487841e76f001bedfd51c17a0', // P2PKH
        vout: 0,
        address: '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT',
        value: 1_913_796,
        sequence: FINAL_SEQUENCE,
      },
      {
        txId: '2568a15c1cf8c9eaa30ab2d3c688ef790f73a319569017b75b530e64a27712a0', // P2WPKH
        vout: 0,
        address: 'bc1qdz34y5kjwj5ej0rv5528mwjl49ufkl098l2gd9',
        value: 10_000_000,
        script: '001468a35252d274a9993c6ca5147dba5fa9789b7de5',
        sequence: RBF_SEQUENCE,
      },
    ],
    outputs: [
      ['15oHUdk7k5N6uNb7d3JdbA7qfhph4n6bK6', 2_100_000],
      ['bc1qv3ptd9qzv87klf34wnxxpmhlqgwu6fvp9q26yd', 8_998_000],
    ],
  },
  txMeta: {
    assetName: 'bitcoin',
    addressPathsMap: {
      '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT': 'm/0/0',
      bc1qdz34y5kjwj5ej0rv5528mwjl49ufkl098l2gd9: 'm/1/1',
    },
    rawTxs: [
      {
        txId: '2c6ec07fb117d2950b88ce6edec09c432d22878487841e76f001bedfd51c17a0',
        rawData:
          '01000000017e879a21dd0243d0a02bbb43a05332f59444df6ae69b37a1edd9b0477e40403f000000006a473044022013afbe1cb93e44ea15f119ab43251945b579599b6d82f9488c9e39a6a685d39702202313e215a94b3ddaba6c1fbc01aa22cb13c5db97a2a3651b850767990e93669e01210233a3643aea86194871d2ba38db890f3bd42bcc9b709e7eef7afaa9f467e74f91ffffffff02c4331d00000000001976a914147d4d251f681599fbea7884ac4021cff378524a88ac7cc67a00000000001976a9140bd42e2594a41443bcc963a1ef9135c4147a3f5588ac00000000',
      },
      {
        txId: '2568a15c1cf8c9eaa30ab2d3c688ef790f73a319569017b75b530e64a27712a0',
        rawData: '01', // can't find the raw data for this tx, since it was replaced, but we can replace it with a dummy value
      },
    ],
    replayProtect: {},
    hasChange: true,
    accountIndex,
  },
}

const createSigner = () => ({
  sign: async ({ data, enc, keyId }) => {
    if (keyId.keyType === 'secp256k1') {
      return keychain.secp256k1.signBuffer({ seedId, keyId, data, enc })
    }
  },
  getPublicKey: async ({ keyId } = {}) => {
    const { publicKey } = await keychain.exportKey({ seedId, keyId })
    return publicKey
  },
})

describe('signing buffers', () => {
  let keysByPurpose
  let hdkeys
  let keyIdsByPurpose

  beforeEach(async () => {
    keyIdsByPurpose = keyBy(
      PURPOSES.map(
        (purpose) => new KeyIdentifier(asset.api.getKeyIdentifier({ purpose, accountIndex }))
      ),
      (keyId) => String(parseDerivationPath(keyId.derivationPath).purpose)
    )

    const _keysByPurpose = {}
    for (const purpose of PURPOSES) {
      const keyId = keyIdsByPurpose[purpose]
      _keysByPurpose[purpose] = await keychain.exportKey({ seedId, keyId, exportPrivate: true })
    }

    keysByPurpose = _keysByPurpose
    hdkeys = mapValues(keysByPurpose, (keys) => createHdKey(keys.xpriv))
  })

  test('create replaceable SignedTransaction for bitcoin ', async () => {
    const { rawTx } = await createBitcoinSignedTransaction({ unsignedTx, hdkeys })
    expect(rawTx.toString('hex')).toBe(RAW_TX)
  })

  test('create replaceable SignedTransaction for bitcoin using signer ', async () => {
    const signer = createSigner()
    const publicKey = await signer.getPublicKey({ keyId: keyIdsByPurpose['44'] })
    expect(publicKey.toString('hex')).toBe(keysByPurpose['44'].publicKey.toString('hex'))

    const { rawTx } = await createBitcoinSignedTransaction({ unsignedTx, signer })
    expect(rawTx.toString('hex')).toBe(RAW_TX)
  })

  test('create replaceable SignedTransaction for bitcoin using tx-signer', async () => {
    const seedSigner = createSeedBasedTransactionSigner({
      addressProvider: { getSupportedPurposes: () => asset.api.getSupportedPurposes({}) },
      assetsModule: { getAsset: () => asset },
      assetSources: {
        getDefaultPurpose: () => {
          return asset.api.getSupportedPurposes({})[0]
        },
      },
      keychain,
    })

    const { rawTx } = await seedSigner.signTransaction({
      baseAssetName: asset.name,
      unsignedTx,
      walletAccount: { seedId, index: accountIndex },
    })

    expect(rawTx.toString('hex')).toBe(RAW_TX)
  })
})
