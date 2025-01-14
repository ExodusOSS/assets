import { memoizeLruCache } from '@exodus/asset-lib'
import { scriptClassify } from '@exodus/bitcoinjs'
import { hashSync } from '@exodus/crypto/hash'
import assert from 'minimalistic-assert'

const { P2PKH, P2SH, P2WPKH, P2WSH, P2TR } = scriptClassify.types

const cacheSize = 1000
const maxSize = 30
const hashStringIfTooBig = (str) =>
  str.length > maxSize ? hashSync('sha256', str, 'hex').slice(0, maxSize) : str

export const scriptClassifierFactory = ({ addressApi }) => {
  assert(addressApi, 'addressApi is required')

  const classifyOutput = scriptClassify.outputFactory()

  const classifyScriptHex = memoizeLruCache(
    ({ assetName, script }) => {
      assert(assetName, 'assetName is required')
      assert(script, 'script is required')
      return classifyOutput(Buffer.from(script, 'hex'))
    },
    ({ assetName, script }) => `${assetName}_${hashStringIfTooBig(script)}`, // hashing the script in case the script is really long
    cacheSize
  )

  const classifyAddress = memoizeLruCache(
    ({ assetName, address }) => {
      assert(assetName, 'assetName is required')
      assert(assetName, address, 'address is required')
      if (addressApi.isP2PKH(address)) return P2PKH
      if (addressApi.isP2SH(address)) return P2SH
      if (addressApi.isP2WPKH && addressApi.isP2WPKH(address)) return P2WPKH
      if (addressApi.isP2TR && addressApi.isP2TR(address)) return P2TR
      if (addressApi.isP2WSH && addressApi.isP2WSH(address)) return P2WSH
      return classifyScriptHex({
        assetName,
        classifyOutput,
        script: addressApi.toScriptPubKey(address).toString('hex'),
      })
    },
    ({ assetName, address }) => `${assetName}_${address}`,
    cacheSize
  )
  return { classifyScriptHex, classifyAddress }
}
