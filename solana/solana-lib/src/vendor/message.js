import * as BufferLayout from '@exodus/buffer-layout'
import bs58 from 'bs58'

import { PACKET_DATA_SIZE } from './constants.js'
import { PublicKey } from './publickey.js'
import { guardedShift, guardedSplice } from './utils/guarded-array-utils.js'
import * as Layout from './utils/layout.js'
import * as shortvec from './utils/shortvec-encoding.js'

/**
 * The message header, identifying signed and read-only account
 *
 * @typedef {Object} MessageHeader
 * @property {number} numRequiredSignatures The number of signatures required for this message to be considered valid. The
 * signatures must match the first `numRequiredSignatures` of `accountKeys`.
 * @property {number} numReadonlySignedAccounts: The last `numReadonlySignedAccounts` of the signed keys are read-only accounts
 * @property {number} numReadonlyUnsignedAccounts The last `numReadonlySignedAccounts` of the unsigned keys are read-only accounts
 */

/**
 * An instruction to execute by a program
 *
 * @typedef {Object} CompiledInstruction
 * @property {number} programIdIndex Index into the transaction keys array indicating the program account that executes this instruction
 * @property {number[]} accounts Ordered indices into the transaction keys array indicating which accounts to pass to the program
 * @property {string} data The program input data encoded as base 58
 */

/**
 * Message constructor arguments
 *
 * @typedef {Object} MessageArgs
 * @property {MessageHeader} header The message header, identifying signed and read-only `accountKeys`
 * @property {string[]} accounts All the account keys used by this transaction
 * @property {Blockhash} recentBlockhash The hash of a recent ledger block
 * @property {CompiledInstruction[]} instructions Instructions that will be executed in sequence and committed in one atomic transaction if all succeed.
 */

const PUBLIC_KEY_LENGTH = 32
const VERSION_PREFIX_MASK = 0x7f

/**
 * List of instructions to be processed atomically
 */
export class Message {
  header
  accountKeys
  recentBlockhash
  instructions

  constructor(args) {
    this.header = args.header
    this.accountKeys = args.accountKeys.map((account) => new PublicKey(account))
    this.recentBlockhash = args.recentBlockhash
    this.instructions = args.instructions
  }

  isAccountSigner(index) {
    return index < this.header.numRequiredSignatures
  }

  isAccountWritable(index) {
    return (
      index < this.header.numRequiredSignatures - this.header.numReadonlySignedAccounts ||
      (index >= this.header.numRequiredSignatures &&
        index < this.accountKeys.length - this.header.numReadonlyUnsignedAccounts)
    )
  }

  findSignerIndex(signer) {
    const index = this.accountKeys.findIndex((accountKey) => {
      return accountKey.equals(signer)
    })
    if (index < 0) {
      throw new Error(`unknown signer: ${signer.toString()}`)
    }

    return index
  }

  serialize() {
    const numKeys = this.accountKeys.length

    const keyCount = []
    shortvec.encodeLength(keyCount, numKeys)

    const instructions = this.instructions.map((instruction) => {
      const { accounts, programIdIndex } = instruction
      const data = bs58.decode(instruction.data)

      const keyIndicesCount = []
      shortvec.encodeLength(keyIndicesCount, accounts.length)

      const dataCount = []
      shortvec.encodeLength(dataCount, data.length)

      return {
        programIdIndex,
        keyIndicesCount: Buffer.from(keyIndicesCount),
        keyIndices: Buffer.from(accounts),
        dataLength: Buffer.from(dataCount),
        data,
      }
    })

    const instructionCount = []
    shortvec.encodeLength(instructionCount, instructions.length)
    let instructionBuffer = Buffer.alloc(PACKET_DATA_SIZE)
    Buffer.from(instructionCount).copy(instructionBuffer)
    let instructionBufferLength = instructionCount.length

    instructions.forEach((instruction) => {
      const instructionLayout = BufferLayout.struct([
        BufferLayout.u8('programIdIndex'),

        BufferLayout.blob(instruction.keyIndicesCount.length, 'keyIndicesCount'),
        BufferLayout.seq(BufferLayout.u8('keyIndex'), instruction.keyIndices.length, 'keyIndices'),
        BufferLayout.blob(instruction.dataLength.length, 'dataLength'),
        BufferLayout.seq(BufferLayout.u8('userdatum'), instruction.data.length, 'data'),
      ])
      const length = instructionLayout.encode(
        instruction,
        instructionBuffer,
        instructionBufferLength
      )
      instructionBufferLength += length
    })
    instructionBuffer = instructionBuffer.slice(0, instructionBufferLength)

    const signDataLayout = BufferLayout.struct([
      BufferLayout.blob(1, 'numRequiredSignatures'),
      BufferLayout.blob(1, 'numReadonlySignedAccounts'),
      BufferLayout.blob(1, 'numReadonlyUnsignedAccounts'),
      BufferLayout.blob(keyCount.length, 'keyCount'),
      BufferLayout.seq(Layout.publicKey('key'), numKeys, 'keys'),
      Layout.publicKey('recentBlockhash'),
    ])

    const transaction = {
      numRequiredSignatures: Buffer.from([this.header.numRequiredSignatures]),
      numReadonlySignedAccounts: Buffer.from([this.header.numReadonlySignedAccounts]),
      numReadonlyUnsignedAccounts: Buffer.from([this.header.numReadonlyUnsignedAccounts]),
      keyCount: Buffer.from(keyCount),
      keys: this.accountKeys.map((key) => key.toBuffer()),
      recentBlockhash: bs58.decode(this.recentBlockhash),
    }

    const signData = Buffer.alloc(2048)
    const length = signDataLayout.encode(transaction, signData)
    instructionBuffer.copy(signData, length)
    return signData.slice(0, length + instructionBuffer.length)
  }

  /**
   * Decode a compiled message into a Message object.
   */
  static from(buffer) {
    // Slice up wire data
    const byteArray = [...buffer]

    const numRequiredSignatures = guardedShift(byteArray)
    if (numRequiredSignatures !== (numRequiredSignatures & VERSION_PREFIX_MASK)) {
      throw new Error('Versioned messages must be deserialized with VersionedMessage.deserialize()')
    }

    const numReadonlySignedAccounts = guardedShift(byteArray)
    const numReadonlyUnsignedAccounts = guardedShift(byteArray)

    const accountCount = shortvec.decodeLength(byteArray)
    const accountKeys = []
    for (let i = 0; i < accountCount; i++) {
      const account = guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH)
      accountKeys.push(Buffer.from(account))
    }

    const recentBlockhash = guardedSplice(byteArray, 0, PUBLIC_KEY_LENGTH)

    const instructionCount = shortvec.decodeLength(byteArray)
    const instructions = []
    for (let i = 0; i < instructionCount; i++) {
      const programIdIndex = guardedShift(byteArray)
      const accountCount = shortvec.decodeLength(byteArray)
      const accounts = guardedSplice(byteArray, 0, accountCount)
      const dataLength = shortvec.decodeLength(byteArray)
      const dataSlice = guardedSplice(byteArray, 0, dataLength)
      const data = bs58.encode(Buffer.from(dataSlice))
      instructions.push({
        programIdIndex,
        accounts,
        data,
      })
    }

    const messageArgs = {
      header: {
        numRequiredSignatures,
        numReadonlySignedAccounts,
        numReadonlyUnsignedAccounts,
      },
      recentBlockhash: bs58.encode(Buffer.from(recentBlockhash)),
      accountKeys,
      instructions,
    }

    return new Message(messageArgs)
  }
}
