// https://github.com/solana-labs/solana-web3.js/blob/master/src/transaction.js

import { signDetachedSync, verifyDetachedSync } from '@exodus/crypto/curve25519'
import bs58 from 'bs58'
import invariant from 'minimalistic-assert'

import { PACKET_DATA_SIZE } from './constants.js'
import { Message } from './message.js'
import { PublicKey } from './publickey.js'
import { guardedSplice } from './utils/guarded-array-utils.js'
import * as shortvec from './utils/shortvec-encoding.js'

/**
 * @typedef {string} TransactionSignature
 */

/**
 * Default (empty) signature
 *
 * Signatures are 64 bytes in length
 */
const DEFAULT_SIGNATURE = Buffer.alloc(64).fill(0)
const SIGNATURE_LENGTH = 64

/**
 * Account metadata used to define instructions
 *
 * @typedef {Object} AccountMeta
 * @property {PublicKey} pubkey An account's public key
 * @property {boolean} isSigner True if an instruction requires a transaction signature matching `pubkey`
 * @property {boolean} isWritable True if the `pubkey` can be loaded as a read-write account.
 */

/**
 * List of TransactionInstruction object fields that may be initialized at construction
 *
 * @typedef {Object} TransactionInstructionCtorFields
 * @property {?Array<PublicKey>} keys
 * @property {?PublicKey} programId
 * @property {?Buffer} data
 */

/**
 * Configuration object for Transaction.serialize()
 *
 * @typedef {Object} SerializeConfig
 * @property {boolean|undefined} requireAllSignatures Require all transaction signatures be present (default: true)
 * @property {boolean|undefined} verifySignatures Verify provided signatures (default: true)
 */

/**
 * Transaction Instruction class
 */
export class TransactionInstruction {
  /**
   * Public keys to include in this transaction
   * Boolean represents whether this pubkey needs to sign the transaction
   */
  keys = []

  /**
   * Program Id to execute
   */
  programId

  /**
   * Program input
   */
  data = Buffer.alloc(0)

  constructor(opts) {
    opts && Object.assign(this, opts)
  }
}

/**
 * @private
 */

/**
 * NonceInformation to be used to build a Transaction.
 *
 * @typedef {Object} NonceInformation
 * @property {Blockhash} nonce The current Nonce blockhash
 * @property {TransactionInstruction} nonceInstruction AdvanceNonceAccount Instruction
 */

/**
 * List of Transaction object fields that may be initialized at construction
 *
 * @typedef {Object} TransactionCtorFields
 * @property {?Blockhash} recentBlockhash A recent blockhash
 * @property {?Array<SignaturePubkeyPair>} signatures One or more signatures
 *
 */

/**
 * Transaction class
 */
export class Transaction {
  /**
   * Signatures for the transaction.  Typically created by invoking the
   * `sign()` method
   */
  signatures = []

  /**
   * The first (payer) Transaction signature
   */
  get signature() {
    if (this.signatures.length > 0) {
      return this.signatures[0].signature
    }

    return null
  }

  /**
   * The transaction fee payer
   */
  feePayer

  /**
   * The transaction fee payer (first signer)
   */
  getFeePayer() {
    if (this.signatures.length > 0) {
      return this.signatures[0].publicKey
    }

    return null
  }

  /**
   * The instructions to atomically execute
   */
  instructions = []

  /**
   * A recent transaction id.  Must be populated by the caller
   */
  recentBlockhash

  /**
   * Optional Nonce information. If populated, transaction will use a durable
   * Nonce hash instead of a recentBlockhash. Must be populated by the caller
   */
  nonceInfo

  /**
   * Construct an empty Transaction
   */
  constructor(opts) {
    opts && Object.assign(this, opts)
  }

  /**
   * Add one or more instructions to this Transaction
   */
  add(...items) {
    if (items.length === 0) {
      throw new Error('No instructions')
    }

    items.forEach((item) => {
      if ('instructions' in item) {
        this.instructions = [...this.instructions, ...item.instructions]
      } else if ('data' in item && 'programId' in item && 'keys' in item) {
        this.instructions.push(item)
      } else {
        this.instructions.push(new TransactionInstruction(item))
      }
    })
    return this
  }

  /**
   * Compile transaction data
   */
  compileMessage() {
    const { nonceInfo } = this
    if (nonceInfo && this.instructions[0] !== nonceInfo.nonceInstruction) {
      this.recentBlockhash = nonceInfo.nonce
      this.instructions.unshift(nonceInfo.nonceInstruction)
    }

    const { recentBlockhash } = this
    if (!recentBlockhash) {
      throw new Error('Transaction recentBlockhash required')
    }

    if (this.instructions.length === 0) {
      throw new Error('No instructions provided')
    }

    let feePayer
    if (this.feePayer) {
      feePayer = this.feePayer
    } else if (this.signatures.length > 0 && this.signatures[0].publicKey) {
      // Use implicit fee payer
      feePayer = this.signatures[0].publicKey
    } else {
      throw new Error('Transaction fee payer required')
    }

    const programIds = []
    const accountMetas = []
    this.instructions.forEach((instruction) => {
      instruction.keys.forEach((accountMeta) => {
        accountMetas.push({ ...accountMeta })
      })

      const programId = instruction.programId.toString()
      if (!programIds.includes(programId)) {
        programIds.push(programId)
      }
    })
    // Append programID account metas
    programIds.forEach((programId) => {
      accountMetas.push({
        pubkey: new PublicKey(programId),
        isSigner: false,
        isWritable: false,
      })
    })

    // Sort. Prioritizing first by signer, then by writable
    accountMetas.sort(function (x, y) {
      if (x.isSigner !== y.isSigner) {
        // Signers always come before non-signers
        return x.isSigner ? -1 : 1
      }

      if (x.isWritable !== y.isWritable) {
        // Writable accounts always come before read-only accounts
        return x.isWritable ? -1 : 1
      }

      const xPubKey = x.pubkey.toBase58().toLowerCase()
      const yPubKey = y.pubkey.toBase58().toLowerCase()

      return xPubKey < yPubKey ? -1 : xPubKey > yPubKey ? 1 : 0
    })

    // Cull duplicate account metas
    const uniqueMetas = []
    accountMetas.forEach((accountMeta) => {
      const pubkeyString = accountMeta.pubkey.toString()
      const uniqueIndex = uniqueMetas.findIndex((x) => {
        return x.pubkey.toString() === pubkeyString
      })
      if (uniqueIndex > -1) {
        uniqueMetas[uniqueIndex].isWritable =
          uniqueMetas[uniqueIndex].isWritable || accountMeta.isWritable
      } else {
        uniqueMetas.push(accountMeta)
      }
    })

    const feePayerIndex = uniqueMetas.findIndex((x) => {
      return x.pubkey.equals(feePayer)
    })

    if (feePayerIndex > -1) {
      const [payerMeta] = uniqueMetas.splice(feePayerIndex, 1)
      payerMeta.isSigner = true
      payerMeta.isWritable = true
      uniqueMetas.unshift(payerMeta)
    } else {
      uniqueMetas.unshift({
        pubkey: feePayer,
        isSigner: true,
        isWritable: true,
      })
    } // Disallow unknown signers

    // Move payer to the front and disallow unknown signers
    this.signatures.forEach((signature, signatureIndex) => {
      const isPayer = signatureIndex === 0
      const uniqueIndex = uniqueMetas.findIndex((x) => {
        return x.pubkey.equals(signature.publicKey)
      })
      if (uniqueIndex > -1) {
        if (isPayer) {
          const [payerMeta] = uniqueMetas.splice(uniqueIndex, 1)
          payerMeta.isSigner = true
          payerMeta.isWritable = true
          uniqueMetas.unshift(payerMeta)
        } else {
          uniqueMetas[uniqueIndex].isSigner = true
        }
      } else if (isPayer) {
        uniqueMetas.unshift({
          pubkey: signature.publicKey,
          isSigner: true,
          isWritable: true,
        })
      } else {
        throw new Error(`unknown signer: ${signature.publicKey.toString()}`)
      }
    })

    let numRequiredSignatures = 0
    let numReadonlySignedAccounts = 0
    let numReadonlyUnsignedAccounts = 0
    // Split out signing from non-signing keys and count header values
    const signedKeys = []
    const unsignedKeys = []
    uniqueMetas.forEach(({ pubkey, isSigner, isWritable }) => {
      if (isSigner) {
        signedKeys.push(pubkey.toString())
        numRequiredSignatures += 1
        if (!isWritable) {
          numReadonlySignedAccounts += 1
        }
      } else {
        unsignedKeys.push(pubkey.toString())
        if (!isWritable) {
          numReadonlyUnsignedAccounts += 1
        }
      }
    })

    const accountKeys = [...signedKeys, ...unsignedKeys]
    const instructions = this.instructions.map((instruction) => {
      const { data, programId } = instruction
      return {
        programIdIndex: accountKeys.indexOf(programId.toString()),
        accounts: instruction.keys.map((keyObj) => accountKeys.indexOf(keyObj.pubkey.toString())),
        data: bs58.encode(data),
      }
    })

    instructions.forEach((instruction) => {
      invariant(instruction.programIdIndex >= 0)
      instruction.accounts.forEach((keyIndex) => invariant(keyIndex >= 0))
    })

    return new Message({
      header: {
        numRequiredSignatures,
        numReadonlySignedAccounts,
        numReadonlyUnsignedAccounts,
      },
      accountKeys,
      recentBlockhash,
      instructions,
    })
  }

  /**
   * Get a buffer of the Transaction data that need to be covered by signatures
   */
  serializeMessage() {
    return this.compileMessage().serialize()
  }

  /**
   * Specify the public keys which will be used to sign the Transaction.
   * The first signer will be used as the transaction fee payer account.
   *
   * Signatures can be added with either `partialSign` or `addSignature`
   */
  setSigners(...signers) {
    if (signers.length === 0) {
      throw new Error('No signers')
    }

    const seen = new Set()
    this.signatures = signers
      .filter((publicKey) => {
        const key = publicKey.toString()
        if (seen.has(key)) {
          return false
        }

        seen.add(key)
        return true
      })
      .map((publicKey) => ({ signature: null, publicKey }))
  }

  /**
   * Sign the Transaction with the specified accounts. Multiple signatures may
   * be applied to a Transaction. The first signature is considered "primary"
   * and is used when testing for Transaction confirmation. The first signer
   * will be used as the transaction fee payer account.
   *
   * Transaction fields should not be modified after the first call to `sign`,
   * as doing so may invalidate the signature and cause the Transaction to be
   * rejected.
   *
   * The Transaction must be assigned a valid `recentBlockhash` before invoking this method
   */
  sign(...signers) {
    if (signers.length === 0) {
      throw new Error('No signers')
    }

    const seen = new Set()
    this.signatures = signers
      .filter((signer) => {
        const key = signer.publicKey.toString()
        if (seen.has(key)) {
          return false
        }

        seen.add(key)
        return true
      })
      .map((signer) => ({
        signature: null,
        publicKey: signer.publicKey,
      }))

    return this.partialSign(...signers)
  }

  /**
   * Partially sign a transaction with the specified accounts. All accounts must
   * correspond to a public key that was previously provided to `setSigners`.
   *
   * All the caveats from the `sign` method apply to `partialSign`
   */
  partialSign(...signers) {
    if (signers.length === 0) {
      throw new Error('No signers')
    }

    const message = this.compileMessage()
    this.signatures.sort(function (x, y) {
      const xIndex = message.findSignerIndex(x.publicKey)
      const yIndex = message.findSignerIndex(y.publicKey)
      return xIndex < yIndex ? -1 : 1
    })

    const signData = message.serialize()
    signers.forEach((signer) => {
      const signature = signDetachedSync({ message: signData, privateKey: signer.privateKey })
      this.addSignature(signer.publicKey, signature)
    })
  }

  /**
   * Add an externally created signature to a transaction. The public key
   * must correspond to a public key that was previously provided to `setSigners`.
   */
  addSignature(pubkey, signature) {
    invariant(signature.length === 64)

    const index = this.signatures.findIndex((sigpair) => pubkey.equals(sigpair.publicKey))
    if (index < 0) {
      throw new Error(`unknown signer: ${pubkey.toString()}`)
    }

    this.signatures[index].signature = Buffer.from(signature)
  }

  /**
   * Verify signatures of a complete, signed Transaction
   */
  verifySignatures() {
    return this._verifySignatures(this.serializeMessage(), true)
  }

  /**
   * @private
   */
  _verifySignatures(signData, requireAllSignatures) {
    for (const { signature, publicKey } of this.signatures) {
      if (signature === null) {
        if (requireAllSignatures) {
          return false
        }
      } else {
        if (
          !verifyDetachedSync({ message: signData, signature, publicKey: publicKey.toBuffer() })
        ) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Serialize the Transaction in the wire format.
   */
  serialize(config) {
    const { requireAllSignatures, verifySignatures } = Object.assign(
      { requireAllSignatures: true, verifySignatures: true },
      config
    )

    const signData = this.serializeMessage()
    if (verifySignatures && !this._verifySignatures(signData, requireAllSignatures)) {
      throw new Error('Signature verification failed')
    }

    return this._serialize(signData)
  }

  /**
   * @private
   */
  _serialize(signData) {
    const { signatures } = this
    const signatureCount = []
    shortvec.encodeLength(signatureCount, signatures.length)
    const transactionLength = signatureCount.length + signatures.length * 64 + signData.length
    const wireTransaction = Buffer.alloc(transactionLength)
    invariant(signatures.length < 256)
    Buffer.from(signatureCount).copy(wireTransaction, 0)
    signatures.forEach(({ signature }, index) => {
      if (signature !== null) {
        invariant(signature.length === 64, `signature has invalid length`)
        Buffer.from(signature).copy(wireTransaction, signatureCount.length + index * 64)
      }
    })
    signData.copy(wireTransaction, signatureCount.length + signatures.length * 64)
    invariant(
      wireTransaction.length <= PACKET_DATA_SIZE,
      `Transaction too large: ${wireTransaction.length} > ${PACKET_DATA_SIZE}`
    )
    return wireTransaction
  }

  /**
   * Deprecated method
   * @private
   */
  get keys() {
    invariant(this.instructions.length === 1)
    return this.instructions[0].keys.map((keyObj) => keyObj.pubkey)
  }

  /**
   * Deprecated method
   * @private
   */
  get programId() {
    invariant(this.instructions.length === 1)
    return this.instructions[0].programId
  }

  /**
   * Deprecated method
   * @private
   */
  get data() {
    invariant(this.instructions.length === 1)
    return this.instructions[0].data
  }

  /**
   * Parse a wire transaction into a Transaction object.
   */
  static from(buffer) {
    // Slice up wire data
    const byteArray = [...buffer]

    const signatureCount = shortvec.decodeLength(byteArray)
    const signatures = []
    for (let i = 0; i < signatureCount; i++) {
      const signature = guardedSplice(byteArray, 0, SIGNATURE_LENGTH)
      signatures.push(bs58.encode(Buffer.from(signature)))
    }

    return Transaction.populate(Message.from(byteArray), signatures)
  }

  /**
   * Populate Transaction object from message and signatures
   */
  static populate(message, signatures) {
    const transaction = new Transaction()
    transaction.recentBlockhash = message.recentBlockhash
    signatures.forEach((signature, index) => {
      const sigPubkeyPair = {
        signature: signature === bs58.encode(DEFAULT_SIGNATURE) ? null : bs58.decode(signature),
        publicKey: message.accountKeys[index],
      }
      transaction.signatures.push(sigPubkeyPair)
    })

    message.instructions.forEach((instruction) => {
      const keys = instruction.accounts.map((account) => {
        const pubkey = message.accountKeys[account]
        return {
          pubkey,
          isSigner: transaction.signatures.some(
            (keyObj) => keyObj.publicKey.toString() === pubkey.toString()
          ),
          isWritable: message.isAccountWritable(account),
        }
      })

      transaction.instructions.push(
        new TransactionInstruction({
          keys,
          programId: message.accountKeys[instruction.programIdIndex],
          data: bs58.decode(instruction.data),
        })
      )
    })

    return transaction
  }
}
