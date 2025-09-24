import { getOwnProperty, memoize } from '@exodus/basic-utils'
import { ECPair } from '@exodus/bitcoinjs'
import { privateKeyToPublicKey } from '@exodus/crypto/secp256k1'
import KeyIdentifier from '@exodus/key-identifier'
import BipPath from 'bip32-path'
import assert from 'minimalistic-assert'

export const createGetKeyWithMetadata = ({
  signer,
  hdkeys,
  resolvePurpose,
  addressPathsMap,
  privateKeysAddressMap,
  coinInfo,
  getKeyIdentifier,
  getPrivateKeyFromMap = standardGetPrivateKeyFromMap,
}) =>
  memoize(
    ({ address, derivationPath }) => {
      const purpose = derivationPath
        ? parseInt(derivationPath.split('/')[1].replace(/'/g, ''))
        : resolvePurpose(address)

      assert(typeof purpose === 'number' && purpose, 'purpose must be a number')
      const networkInfo = coinInfo.toBitcoinJS()

      if (signer) {
        return getPublicKeyFromSigner(signer, addressPathsMap, purpose, address, getKeyIdentifier)
      }

      if (privateKeysAddressMap) {
        return getPrivateKeyFromMap(privateKeysAddressMap, networkInfo, purpose, address)
      }

      return getPrivateKeyFromHDKeys(hdkeys, addressPathsMap, networkInfo, purpose, address)
    },
    ({ address, derivationPath }) => address + '_' + derivationPath
  )

function standardGetPrivateKeyFromMap(privateKeysAddressMap, networkInfo, purpose, address) {
  const privateWif = getOwnProperty(privateKeysAddressMap, address, 'string')
  assert(privateWif, `there is no private key for address ${address}`)

  // ECPair.fromWIF() rejects network objects whose pubKeyHash/scriptHash are wider than one byte (UInt8).
  // so we skip the network argument in that case and let the library infer it from the WIF prefix.
  const useNet =
    networkInfo && networkInfo.pubKeyHash <= 0xff && networkInfo.scriptHash <= 0xff
      ? networkInfo
      : undefined

  const { privateKey, compressed } = useNet
    ? ECPair.fromWIF(privateWif, useNet)
    : ECPair.fromWIF(privateWif)

  const publicKey = privateKeyToPublicKey({ privateKey, compressed, format: 'buffer' })
  return { privateKey, publicKey, purpose }
}

function getPrivateKeyFromHDKeys(hdkeys, addressPathsMap, networkInfo, purpose, address) {
  const path = getOwnProperty(addressPathsMap, address, 'string')
  assert(hdkeys, 'hdkeys must be provided')
  assert(purpose, `purpose for address ${address} could not be resolved`)
  const hdkey = hdkeys[purpose]
  assert(hdkey, `hdkey for purpose for ${purpose} and address ${address} could not be resolved`)
  const derivedhdkey = hdkey.derive(path)
  const { privateKey } = ECPair.fromPrivateKey(derivedhdkey.privateKey, { network: networkInfo })
  const publicKey = derivedhdkey.publicKey
  return { privateKey, publicKey, purpose }
}

async function getPublicKeyFromSigner(signer, addressPathsMap, purpose, address, getKeyIdentifier) {
  assert(purpose, `purpose for address ${address} could not be resolved`)
  const addressPath = getOwnProperty(addressPathsMap, address, 'string')
  const [chainIndex, addressIndex] = BipPath.fromString(addressPath).toPathArray()
  const keyId = new KeyIdentifier(getKeyIdentifier({ purpose, chainIndex, addressIndex }))
  const publicKey = await signer.getPublicKey({ keyId })
  return { keyId, publicKey, purpose }
}
