import * as defaultBitcoinjsLib from '@exodus/bitcoinjs'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import * as bech32 from 'bech32'
import bs58check from 'bs58check'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import wif from 'wif'

import { hash160 } from './hash-utils.js'

const { identity, pickBy } = lodash

export const publicKeyToHashFactory = (p2pkh) => (publicKey) => {
  const payload = Buffer.concat([Buffer.from([p2pkh]), hash160(publicKey)])
  return bs58check.encode(payload)
}

export const createBtcLikeKeys = ({
  coinInfo,
  versions,
  useBip86 = false,
  bitcoinjsLib = defaultBitcoinjsLib,
  extraFunctions = {},
}) => {
  assert(coinInfo, 'coinInfo is required')
  assert(versions, 'versions is required')
  const {
    encodePrivate: encodePrivateCustom,
    encodePublic: encodePublicCustom,
    encodePublicFromWIF: encodePublicFromWIFCustom,
    encodePublicBech32: encodePublicBech32Custom,
    encodePublicBech32FromWIF: encodePublicBech32FromWIFCustom,
    encodeNestedP2WPKH: encodeNestedP2WPKHCustom,
    encodePublicTaproot: encodePublicTaprootCustom,
    ...unknownExtraFunctions
  } = extraFunctions
  const encodePrivate =
    encodePrivateCustom ||
    ((privateKey, compressed = true) => {
      return wif.encode(coinInfo.versions.private, privateKey, compressed)
    })
  const encodePublicPurpose44 = encodePublicCustom || publicKeyToHashFactory(versions.p2pkh)
  const encodePublicFromWIF =
    encodePublicFromWIFCustom ||
    ((privateKeyWIF) => {
      const { privateKey, compressed } = wif.decode(privateKeyWIF, coinInfo.versions.private)
      const publicKey = secp256k1.privateKeyToPublicKey({ privateKey, compressed })
      return encodePublicPurpose44(publicKey)
    })
  const encodePublicBech32 =
    encodePublicBech32Custom || versions.bech32 !== undefined
      ? (publicKey) => {
          const pubKeyHash = hash160(publicKey)
          const witnessVersion = Buffer.from([0])
          const witnessProgram = Buffer.concat([
            witnessVersion,
            Buffer.from(bech32.toWords(pubKeyHash)),
          ])
          return bech32.encode(versions.bech32, witnessProgram)
        }
      : undefined
  const encodePublicBech32FromWIF =
    encodePublicBech32FromWIFCustom || encodePublicBech32
      ? (privateKeyWIF) => {
          // NOTE: No password support here
          const { versions } = coinInfo
          const { privateKey, compressed } = wif.decode(privateKeyWIF, versions.private)
          const publicKey = secp256k1.privateKeyToPublicKey({ privateKey, compressed })
          return encodePublicBech32(publicKey)
        }
      : undefined

  const encodeNestedP2WPKH =
    encodeNestedP2WPKHCustom || bitcoinjsLib
      ? (publicKey) => {
          const pubkey = secp256k1.publicKeyConvert({
            publicKey,
            compressed: true,
            format: 'buffer',
          })
          const witnessProgram = bitcoinjsLib.payments.p2wpkh({
            pubkey,
          }).output

          const witnessProgramHash = bitcoinjsLib.crypto.hash160(witnessProgram)
          return bitcoinjsLib.address.toBase58Check(
            witnessProgramHash,
            coinInfo.versions.scripthash
          )
        }
      : undefined

  const encodePublicTaproot =
    encodePublicTaprootCustom ||
    (useBip86
      ? (publicKey) => {
          const network = coinInfo.toBitcoinJS()
          const xOnly = secp256k1.publicKeyToX({ publicKey, format: 'buffer' })
          return bitcoinjsLib.payments.p2tr({ internalPubkey: xOnly, network }).address
        }
      : undefined)

  const encodePublic = (publicKey, meta) => {
    assert(meta?.purpose, 'asset.keys.encodePublic requires meta.purpose')
    const purpose = meta.purpose
    const errorMessage = `asset.keys.encodePublic does not support purpose ${purpose}`
    if (purpose === 44) {
      assert(encodePublicPurpose44, errorMessage)
      return encodePublicPurpose44(publicKey)
    }

    if (purpose === 49) {
      assert(encodeNestedP2WPKH, errorMessage)
      return encodeNestedP2WPKH(publicKey)
    }

    if (purpose === 84) {
      assert(encodePublicBech32, errorMessage)
      return encodePublicBech32(publicKey)
    }

    if (purpose === 86) {
      assert(encodePublicTaproot, errorMessage)
      return encodePublicTaproot(publicKey)
    }

    throw new Error(errorMessage)
  }

  return pickBy(
    {
      encodePrivate,
      encodePublic,
      encodePublicFromWIF,
      encodePublicBech32FromWIF,
      ...unknownExtraFunctions,
    },
    identity
  )
}
