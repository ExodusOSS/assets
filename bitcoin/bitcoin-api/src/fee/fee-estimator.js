import { scriptClassify } from '@exodus/bitcoinjs'
import { UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'
import * as varuint from 'varuint-bitcoin'

import createDefaultFeeEstimator, { isHex } from './fee-utils.js'
import { scriptClassifierFactory } from './script-classifier.js'

const { P2PKH, P2SH, P2WPKH, P2WSH, P2TR } = scriptClassify.types

const supportedInputTypes = {
  bitcoin: [P2PKH, P2WPKH, P2SH, P2TR],
  bitcoinregtest: [P2PKH, P2WPKH, P2SH, P2TR],
  bitcointestnet: [P2PKH, P2WPKH, P2SH, P2TR],
  litecoin: [P2PKH, P2WPKH, P2SH],
  bgold: [P2PKH, P2SH],
  digibyte: [P2PKH, P2SH],
  default: [P2PKH],
}

const supportedOutputTypes = {
  bitcoin: [P2PKH, P2SH, P2WPKH, P2WSH, P2TR],
  bitcoinregtest: [P2PKH, P2SH, P2WPKH, P2WSH, P2TR],
  bitcointestnet: [P2PKH, P2SH, P2WPKH, P2WSH, P2TR],
  litecoin: [P2PKH, P2SH, P2WPKH, P2WSH],
  digibyte: [P2PKH, P2SH, P2WPKH, P2WSH],
  default: [P2PKH, P2SH],
}

const scriptSigCompressedLengths = {
  [P2PKH]: 107,
  [P2WPKH]: 0,
  [P2TR]: 0,
  [P2SH]: 23, // segwit nested P2SH
}

const scriptSigUncompressedLengths = {
  ...scriptSigCompressedLengths,
  [P2PKH]: 139,
}

const scriptPubKeyLengths = {
  [P2PKH]: 25,
  [P2SH]: 23,
  [P2WPKH]: 22,
  [P2WSH]: 34,
  [P2TR]: 34,
}

// Only the 64 byte Schnorr signature is present for Taproot Key-Path spend
const signatureLength = 64
const taprootInputKeyPathWitnessSize =
  varuint.encodingLength(1) + varuint.encodingLength(signatureLength) + signatureLength

// bitcoin and bitcoin-like:
// 10 = version: 4, locktime: 4, inputs and outputs count: 1
// 148 = txId: 32, vout: 4, count: 1, script: 107 (max), sequence: 4
// 34 = value: 8, count: 1, scriptPubKey: 25 (P2PKH) and 23 (P2SH)
export const getSizeFactory = ({ defaultOutputType, addressApi }) => {
  assert(defaultOutputType, 'defaultOutputType is required')
  assert(addressApi, 'addressApi is required')

  const scriptClassifier = scriptClassifierFactory({ addressApi })

  return (
    asset,
    inputs,
    outputs,
    { compressed = true, taprootInputWitnessSize = taprootInputKeyPathWitnessSize } = {}
  ) => {
    if (inputs instanceof UtxoCollection) {
      inputs = [...inputs].map((utxo) => utxo.script || null)
    }

    const assetName = asset.name
    // other bitcoin-like assets
    const baseSize =
      4 + // n_version
      4 + // n_locktime
      varuint.encodingLength(inputs.length) + // inputs_len
      // input[]
      inputs.reduce(
        (t, script) => t + getInputSize({ script, scriptClassifier, assetName, compressed }),
        0
      ) +
      varuint.encodingLength(outputs.length) + // outputs_len
      // output[]
      outputs.reduce(
        (t, output) =>
          t + getOutputSize({ output, scriptClassifier, assetName, defaultOutputType }),
        0
      )

    const witnessSize =
      1 + // marker
      1 + // flag
      // witnesses
      inputs.reduce((t, script) => {
        if (!script) return t + 1
        const utxoScriptType = scriptClassifier.classifyScriptHex({ assetName, script })
        if ([P2SH, P2WPKH].includes(utxoScriptType)) {
          const pubKeyLength = 33
          const signatureLength = 73 // maximum possible length
          // Need to encode the witness item count, which is 2 for for P2WPKH as a var_int
          return (
            t +
            varuint.encodingLength(2) +
            varuint.encodingLength(pubKeyLength) +
            pubKeyLength +
            varuint.encodingLength(signatureLength) +
            signatureLength
          )
        }

        if ([P2TR].includes(utxoScriptType)) {
          return t + taprootInputWitnessSize
        }

        // Non-witness inputs get a placeholder zero byte
        return t + 1
      }, 0)

    // If witness is all placeholder bytes, that means we have no witness inputs
    // In that case, we're going to use the legacy serialization format, so just
    // return baseSize
    if (witnessSize === 1 + 1 + inputs.length) return baseSize

    const totalSize = baseSize + witnessSize
    const weight = baseSize * 3 + totalSize
    // Return vbytes
    return Math.ceil(weight / 4)
  }
}

const getFeeEstimatorFactory = ({ defaultOutputType, addressApi }) => {
  const getSize = getSizeFactory({ defaultOutputType, addressApi })
  return createDefaultFeeEstimator(getSize)
}

export const getInputSize = ({ script, scriptClassifier, assetName, compressed }) => {
  if (script === null) script = '76a914000000000000000000000000000000000000000088ac' // P2PKH
  assert(isHex(script), 'script must be hex string')

  const scriptType = scriptClassifier.classifyScriptHex({ assetName, script })

  const supportedTypes = supportedInputTypes[assetName] || supportedInputTypes.default
  assert(
    supportedTypes.includes(scriptType),
    `Only ${supportedTypes.join(', ')} inputs supported right now`
  )

  const scriptSigLengths = compressed ? scriptSigCompressedLengths : scriptSigUncompressedLengths
  const scriptSigLength = scriptSigLengths[scriptType]
  return 32 + 4 + varuint.encodingLength(scriptSigLength) + scriptSigLength + 4
}

export const getOutputSize = ({ output, scriptClassifier, assetName, defaultOutputType }) => {
  // if (output === null) output = get(asset, 'address.versions.bech32') ? 'P2WSH' : 'P2PKH'

  if (output === null) output = defaultOutputType

  let scriptType = scriptClassify.types[output]
  const supportedTypes = supportedOutputTypes[assetName] || supportedOutputTypes.default

  if (!supportedTypes.includes(scriptType)) {
    scriptType = scriptClassifier.classifyAddress({
      assetName,
      address: output,
    })
  }

  assert(
    supportedTypes.includes(scriptType),
    `Only ${supportedTypes.join(', ')} outputs supported right now`
  )

  const scriptPubKeyLength = scriptPubKeyLengths[scriptType]
  return 8 + varuint.encodingLength(scriptPubKeyLength) + scriptPubKeyLength
}

export default getFeeEstimatorFactory
