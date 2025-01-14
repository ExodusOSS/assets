import * as defaultBitcoinjsLib from '@exodus/bitcoinjs'
import { publicKeyIsValid, publicKeyToX } from '@exodus/crypto/secp256k1'

const toXOnly = (publicKey) => publicKeyToX({ publicKey, format: 'buffer' })

// Key to use when key path spending is disabled https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#constructing-and-spending-taproot-outputs
const DUMMY_TAPROOT_PUBKEY = Buffer.from(
  '0250929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0',
  'hex'
)

// Leaf version for BIP342 is 0xc0 or 192 https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki#specification
const LEAF_VERSION_TAPSCRIPT = 192

// Limit multisig keys to 16 for now
const MAX_PUBKEYS = 16

export const createEncodeMultisigContract =
  ({ bitcoinjsLib = defaultBitcoinjsLib, network = bitcoinjsLib.Network.bitcoin, ecc }) =>
  (
    publicKeys,
    {
      threshold = publicKeys.length,
      version = 0,
      internalPubkey = DUMMY_TAPROOT_PUBKEY,
    } = Object.create(null)
  ) => {
    const isPointCompressed = (publicKey) =>
      ecc ? ecc.isPointCompressed(publicKey) : publicKeyIsValid({ publicKey, compressed: true })

    if (
      !Array.isArray(publicKeys) ||
      publicKeys.some((k) => !Buffer.isBuffer(k) || !isPointCompressed(k))
    ) {
      throw new Error('publicKeys must be an Array of Buffers representing compressed public keys')
    }

    if (publicKeys.length <= 0 || publicKeys.length > MAX_PUBKEYS) {
      throw new Error(`asset.encodeMultisigContract supports from 1 to ${MAX_PUBKEYS} pubKeys`)
    }

    if (new Set(publicKeys.map((k) => k.toString('hex'))).size !== publicKeys.length) {
      throw new Error('publicKeys must not contain any duplicates')
    }

    if (!Number.isSafeInteger(version)) {
      throw new TypeError('asset.encodeMultisigContract requires meta.version to be an integer')
    }

    // Only support version 0 for now
    if (version !== 0) {
      throw new Error(`asset.encodeMultisigContract does not support version ${version}`)
    }

    if (!Number.isSafeInteger(threshold) || threshold <= 0 || threshold > MAX_PUBKEYS) {
      throw new Error(
        `asset.encodeMultisigContract requires meta.threshold to be an integer between 1 and ${MAX_PUBKEYS}`
      )
    }

    if (threshold > publicKeys.length) {
      throw new Error('threshold must be <= publicKeys.length')
    }

    // Sort according to BIP67 https://github.com/bitcoin/bips/blob/master/bip-0067.mediawiki
    publicKeys.sort((a, b) => Buffer.compare(toXOnly(a), toXOnly(b)))

    // Create multisig redeem script https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki#cite_note-5
    const OPS = bitcoinjsLib.script.OPS
    const chunks = []
    const keysIter = publicKeys[Symbol.iterator]()

    chunks.push(toXOnly(keysIter.next().value), OPS.OP_CHECKSIG)
    for (const key of keysIter) {
      chunks.push(toXOnly(key), OPS.OP_CHECKSIGADD)
    }

    chunks.push(Buffer.from([threshold]), OPS.OP_NUMEQUAL)

    const output = bitcoinjsLib.script.compile(chunks)

    return bitcoinjsLib.payments.p2tr({
      internalPubkey: toXOnly(internalPubkey),
      scriptTree: { output },
      redeem: { output, redeemVersion: LEAF_VERSION_TAPSCRIPT },
      network,
    })
  }
