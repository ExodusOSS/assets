import * as BufferLayout from '@exodus/buffer-layout'

import { decodeData, encodeData } from './instruction.js'
import { NONCE_ACCOUNT_LENGTH } from './nonce-account.js'
import { PublicKey } from './publickey.js'
import { SYSVAR_RECENT_BLOCKHASHES_PUBKEY, SYSVAR_RENT_PUBKEY } from './sysvar.js'
import { Transaction, TransactionInstruction } from './transaction.js'
import * as Layout from './utils/layout.js'

/**
 * Create account system transaction params
 * @typedef {Object} CreateAccountParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} newAccountPubkey
 * @property {number} lamports
 * @property {number} space
 * @property {PublicKey} programId
 */

/**
 * Transfer system transaction params
 * @typedef {Object} TransferParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} toPubkey
 * @property {number} lamports
 */

/**
 * Assign system transaction params
 * @typedef {Object} AssignParams
 * @property {PublicKey} accountPubkey
 * @property {PublicKey} programId
 */

/**
 * Create account with seed system transaction params
 * @typedef {Object} CreateAccountWithSeedParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} newAccountPubkey
 * @property {PublicKey} basePubkey
 * @property {string} seed
 * @property {number} lamports
 * @property {number} space
 * @property {PublicKey} programId
 */

/**
 * Create nonce account system transaction params
 * @typedef {Object} CreateNonceAccountParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} noncePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {number} lamports
 */

/**
 * Create nonce account with seed system transaction params
 * @typedef {Object} CreateNonceAccountWithSeedParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} noncePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} basePubkey
 * @property {string} seed
 * @property {number} lamports
 */

/**
 * Initialize nonce account system instruction params
 * @typedef {Object} InitializeNonceParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} programId
 */

/**
 * Advance nonce account system instruction params
 * @typedef {Object} AdvanceNonceParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} programId
 */

/**
 * Withdraw nonce account system transaction params
 * @typedef {Object} WithdrawNonceParams
 * @property {PublicKey} noncePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} toPubkey
 * @property {number} lamports
 */

/**
 * Authorize nonce account system transaction params
 * @typedef {Object} AuthorizeNonceParams
 * @property {PublicKey} noncePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} newAuthorizedPubkey
 */

/**
 * Allocate account system transaction params
 * @typedef {Object} AllocateParams
 * @property {PublicKey} accountPubkey
 * @property {number} space
 */

/**
 * Allocate account with seed system transaction params
 * @typedef {Object} AllocateWithSeedParams
 * @property {PublicKey} accountPubkey
 * @property {PublicKey} basePubkey
 * @property {string} seed
 * @property {number} space
 * @property {PublicKey} programId
 */

/**
 * Assign account with seed system transaction params
 * @typedef {Object} AssignWithSeedParams
 * @property {PublicKey} accountPubkey
 * @property {PublicKey} basePubkey
 * @property {string} seed
 * @property {PublicKey} programId
 */

/**
 * An enumeration of valid system InstructionType's
 */
export const SYSTEM_INSTRUCTION_LAYOUTS = Object.freeze({
  Create: {
    index: 0,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      BufferLayout.ns64('lamports'),
      BufferLayout.ns64('space'),
      Layout.publicKey('programId'),
    ]),
  },
  Assign: {
    index: 1,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), Layout.publicKey('programId')]),
  },
  Transfer: {
    index: 2,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), BufferLayout.ns64('lamports')]),
  },
  CreateWithSeed: {
    index: 3,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.publicKey('base'),
      Layout.rustString('seed'),
      BufferLayout.ns64('lamports'),
      BufferLayout.ns64('space'),
      Layout.publicKey('programId'),
    ]),
  },
  AdvanceNonceAccount: {
    index: 4,
    layout: BufferLayout.struct([BufferLayout.u32('instruction')]),
  },
  WithdrawNonceAccount: {
    index: 5,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), BufferLayout.ns64('lamports')]),
  },
  InitializeNonceAccount: {
    index: 6,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), Layout.publicKey('authorized')]),
  },
  AuthorizeNonceAccount: {
    index: 7,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), Layout.publicKey('authorized')]),
  },
  Allocate: {
    index: 8,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), BufferLayout.ns64('space')]),
  },
  AllocateWithSeed: {
    index: 9,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.publicKey('base'),
      Layout.rustString('seed'),
      BufferLayout.ns64('space'),
      Layout.publicKey('programId'),
    ]),
  },
  AssignWithSeed: {
    index: 10,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.publicKey('base'),
      Layout.rustString('seed'),
      Layout.publicKey('programId'),
    ]),
  },
})

/**
 * System Instruction class
 */
export const SystemInstruction = {
  /**
   * Decode a system instruction and retrieve the instruction type.
   */
  decodeInstructionType(instruction) {
    this.checkProgramId(instruction.programId)

    const instructionTypeLayout = BufferLayout.u32('instruction')
    const typeIndex = instructionTypeLayout.decode(instruction.data)

    let type
    for (const t of Object.keys(SYSTEM_INSTRUCTION_LAYOUTS)) {
      if (SYSTEM_INSTRUCTION_LAYOUTS[t].index === typeIndex) {
        type = t
      }
    }

    if (!type) {
      throw new Error('Instruction type incorrect; not a SystemInstruction')
    }

    return type
  },

  /**
   * Decode a create account system instruction and retrieve the instruction params.
   */
  decodeCreateAccount(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 2)

    const { lamports, space, programId } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.Create,
      instruction.data
    )

    return {
      fromPubkey: instruction.keys[0].pubkey,
      newAccountPubkey: instruction.keys[1].pubkey,
      lamports,
      space,
      programId: new PublicKey(programId),
    }
  },

  /**
   * Decode a transfer system instruction and retrieve the instruction params.
   */
  decodeTransfer(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 2)

    const { lamports } = decodeData(SYSTEM_INSTRUCTION_LAYOUTS.Transfer, instruction.data)

    return {
      fromPubkey: instruction.keys[0].pubkey,
      toPubkey: instruction.keys[1].pubkey,
      lamports,
    }
  },

  /**
   * Decode an allocate system instruction and retrieve the instruction params.
   */
  decodeAllocate(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 1)

    const { space } = decodeData(SYSTEM_INSTRUCTION_LAYOUTS.Allocate, instruction.data)

    return {
      accountPubkey: instruction.keys[0].pubkey,
      space,
    }
  },

  /**
   * Decode an allocate with seed system instruction and retrieve the instruction params.
   */
  decodeAllocateWithSeed(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 1)

    const { base, seed, space, programId } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed,
      instruction.data
    )

    return {
      accountPubkey: instruction.keys[0].pubkey,
      basePubkey: new PublicKey(base),
      seed,
      space,
      programId: new PublicKey(programId),
    }
  },

  /**
   * Decode an assign system instruction and retrieve the instruction params.
   */
  decodeAssign(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 1)

    const { programId } = decodeData(SYSTEM_INSTRUCTION_LAYOUTS.Assign, instruction.data)

    return {
      accountPubkey: instruction.keys[0].pubkey,
      programId: new PublicKey(programId),
    }
  },

  /**
   * Decode an assign with seed system instruction and retrieve the instruction params.
   */
  decodeAssignWithSeed(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 1)

    const { base, seed, programId } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed,
      instruction.data
    )

    return {
      accountPubkey: instruction.keys[0].pubkey,
      basePubkey: new PublicKey(base),
      seed,
      programId: new PublicKey(programId),
    }
  },

  /**
   * Decode a create account with seed system instruction and retrieve the instruction params.
   */
  decodeCreateWithSeed(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 2)

    const { base, seed, lamports, space, programId } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed,
      instruction.data
    )

    return {
      fromPubkey: instruction.keys[0].pubkey,
      newAccountPubkey: instruction.keys[1].pubkey,
      basePubkey: new PublicKey(base),
      seed,
      lamports,
      space,
      programId: new PublicKey(programId),
    }
  },

  /**
   * Decode a nonce initialize system instruction and retrieve the instruction params.
   */
  decodeNonceInitialize(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 3)

    const { authorized } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount,
      instruction.data
    )

    return {
      noncePubkey: instruction.keys[0].pubkey,
      authorizedPubkey: new PublicKey(authorized),
    }
  },

  /**
   * Decode a nonce advance system instruction and retrieve the instruction params.
   */
  decodeNonceAdvance(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 3)

    decodeData(SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount, instruction.data)

    return {
      noncePubkey: instruction.keys[0].pubkey,
      authorizedPubkey: instruction.keys[2].pubkey,
    }
  },

  /**
   * Decode a nonce withdraw system instruction and retrieve the instruction params.
   */
  decodeNonceWithdraw(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 5)

    const { lamports } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount,
      instruction.data
    )

    return {
      noncePubkey: instruction.keys[0].pubkey,
      toPubkey: instruction.keys[1].pubkey,
      authorizedPubkey: instruction.keys[4].pubkey,
      lamports,
    }
  },

  /**
   * Decode a nonce authorize system instruction and retrieve the instruction params.
   */
  decodeNonceAuthorize(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 2)

    const { authorized } = decodeData(
      SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount,
      instruction.data
    )

    return {
      noncePubkey: instruction.keys[0].pubkey,
      authorizedPubkey: instruction.keys[1].pubkey,
      newAuthorizedPubkey: new PublicKey(authorized),
    }
  },

  /**
   * @private
   */
  checkProgramId(programId) {
    if (!programId.equals(SystemProgram.programId)) {
      throw new Error('invalid instruction; programId is not SystemProgram')
    }
  },

  /**
   * @private
   */
  checkKeyLength(keys, expectedLength) {
    if (keys.length < expectedLength) {
      throw new Error(
        `invalid instruction; found ${keys.length} keys, expected at least ${expectedLength}`
      )
    }
  },
}

/**
 * Factory class for transactions to interact with the System program
 */
export const SystemProgram = {
  /**
   * Public key that identifies the System program
   */
  get programId() {
    return new PublicKey('11111111111111111111111111111111')
  },

  /**
   * Generate a transaction instruction that creates a new account
   */
  createAccount(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.Create
    const data = encodeData(type, {
      lamports: params.lamports,
      space: params.space,
      programId: params.programId.toBuffer(),
    })

    return new TransactionInstruction({
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.newAccountPubkey, isSigner: true, isWritable: true },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction instruction that transfers lamports from one account to another
   */
  transfer(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer
    const data = encodeData(type, { lamports: params.lamports })

    return new TransactionInstruction({
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction instruction that assigns an account to a program
   */
  assign(params) {
    let data
    if (params.basePubkey) {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.AssignWithSeed
      data = encodeData(type, {
        base: params.basePubkey.toBuffer(),
        seed: params.seed,
        programId: params.programId.toBuffer(),
      })
    } else {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.Assign
      data = encodeData(type, { programId: params.programId.toBuffer() })
    }

    return new TransactionInstruction({
      keys: [{ pubkey: params.accountPubkey, isSigner: true, isWritable: true }],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction instruction that creates a new account at
   *   an address generated with `from`, a seed, and programId
   */
  createAccountWithSeed(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.CreateWithSeed
    const data = encodeData(type, {
      base: params.basePubkey.toBuffer(),
      seed: params.seed,
      lamports: params.lamports,
      space: params.space,
      programId: params.programId.toBuffer(),
    })

    return new TransactionInstruction({
      keys: [
        { pubkey: params.fromPubkey, isSigner: true, isWritable: true },
        { pubkey: params.newAccountPubkey, isSigner: false, isWritable: true },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction that creates a new Nonce account
   */
  createNonceAccount(params) {
    const transaction = new Transaction()
    if (params.basePubkey && params.seed) {
      transaction.add(
        SystemProgram.createAccountWithSeed({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          basePubkey: params.basePubkey,
          seed: params.seed,
          lamports: params.lamports,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId,
        })
      )
    } else {
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: params.fromPubkey,
          newAccountPubkey: params.noncePubkey,
          lamports: params.lamports,
          space: NONCE_ACCOUNT_LENGTH,
          programId: this.programId,
        })
      )
    }

    const initParams = {
      noncePubkey: params.noncePubkey,
      authorizedPubkey: params.authorizedPubkey,
    }

    transaction.add(this.nonceInitialize(initParams))
    return transaction
  },

  /**
   * Generate an instruction to initialize a Nonce account
   */
  nonceInitialize(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.InitializeNonceAccount
    const data = encodeData(type, {
      authorized: params.authorizedPubkey.toBuffer(),
    })
    const instructionData = {
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    }
    return new TransactionInstruction(instructionData)
  },

  /**
   * Generate an instruction to advance the nonce in a Nonce account
   */
  nonceAdvance(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.AdvanceNonceAccount
    const data = encodeData(type)
    const instructionData = {
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    }
    return new TransactionInstruction(instructionData)
  },

  /**
   * Generate a transaction instruction that withdraws lamports from a Nonce account
   */
  nonceWithdraw(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.WithdrawNonceAccount
    const data = encodeData(type, { lamports: params.lamports })

    return new TransactionInstruction({
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        { pubkey: params.toPubkey, isSigner: false, isWritable: true },
        {
          pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction instruction that authorizes a new PublicKey as the authority
   * on a Nonce account.
   */
  nonceAuthorize(params) {
    const type = SYSTEM_INSTRUCTION_LAYOUTS.AuthorizeNonceAccount
    const data = encodeData(type, {
      authorized: params.newAuthorizedPubkey.toBuffer(),
    })

    return new TransactionInstruction({
      keys: [
        { pubkey: params.noncePubkey, isSigner: false, isWritable: true },
        { pubkey: params.authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a transaction instruction that allocates space in an account without funding
   */
  allocate(params) {
    let data
    if (params.basePubkey) {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.AllocateWithSeed
      data = encodeData(type, {
        base: params.basePubkey.toBuffer(),
        seed: params.seed,
        space: params.space,
        programId: params.programId.toBuffer(),
      })
    } else {
      const type = SYSTEM_INSTRUCTION_LAYOUTS.Allocate
      data = encodeData(type, {
        space: params.space,
      })
    }

    return new TransactionInstruction({
      keys: [{ pubkey: params.accountPubkey, isSigner: true, isWritable: true }],
      programId: this.programId,
      data,
    })
  },
}
