import * as BufferLayout from '@exodus/buffer-layout'

import { decodeData, encodeData } from './instruction.js'
import { PublicKey } from './publickey.js'
import { SystemProgram } from './system-program.js'
import { SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, SYSVAR_STAKE_HISTORY_PUBKEY } from './sysvar.js'
import { Transaction, TransactionInstruction } from './transaction.js'
import * as Layout from './utils/layout.js'

export const STAKE_CONFIG_ID = new PublicKey('StakeConfig11111111111111111111111111111111')

export class Authorized {
  staker
  withdrawer

  /**
   * Create a new Authorized object
   */
  constructor(staker, withdrawer) {
    this.staker = staker
    this.withdrawer = withdrawer
  }
}

export class Lockup {
  unixTimestamp
  epoch
  custodian

  /**
   * Create a new Lockup object
   */
  constructor(unixTimestamp, epoch, custodian) {
    this.unixTimestamp = unixTimestamp
    this.epoch = epoch
    this.custodian = custodian
  }
}

/**
 * Create stake account transaction params
 * @typedef {Object} CreateStakeAccountParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} stakePubkey
 * @property {Authorized} authorized
 * @property {Lockup} lockup
 * @property {number} lamports
 */

/**
 * Create stake account with seed transaction params
 * @typedef {Object} CreateStakeAccountWithSeedParams
 * @property {PublicKey} fromPubkey
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} basePubkey
 * @property {string} seed
 * @property {Authorized} authorized
 * @property {Lockup} lockup
 * @property {number} lamports
 */

/**
 * Initialize stake instruction params
 * @typedef {Object} InitializeStakeParams
 * @property {PublicKey} stakePubkey
 * @property {Authorized} authorized
 * @property {Lockup} lockup
 */

/**
 * Delegate stake instruction params
 * @typedef {Object} DelegateStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} votePubkey
 */

/**
 * @typedef {Object} StakeAuthorizationType
 * @property (index} The Stake Authorization index (from solana-stake-program)
 */

/**
 * Authorize stake instruction params
 * @typedef {Object} AuthorizeStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} newAuthorizedPubkey
 * @property {StakeAuthorizationType} stakeAuthorizationType
 */

/**
 * Authorize stake instruction params using a derived key
 * @typedef {Object} AuthorizeWithSeedStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorityBase
 * @property {string} authoritySeed
 * @property {PublicKey} authorityOwner
 * @property {PublicKey} newAuthorizedPubkey
 * @property {StakeAuthorizationType} stakeAuthorizationType
 */

/**
 * Split stake instruction params
 * @typedef {Object} SplitStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} splitStakePubkey
 * @property {number} lamports
 */

/**
 * Withdraw stake instruction params
 * @typedef {Object} WithdrawStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorizedPubkey
 * @property {PublicKey} toPubkey
 * @property {number} lamports
 */

/**
 * Deactivate stake instruction params
 * @typedef {Object} DeactivateStakeParams
 * @property {PublicKey} stakePubkey
 * @property {PublicKey} authorizedPubkey
 */

/**
 * An enumeration of valid stake InstructionType's
 */
export const STAKE_INSTRUCTION_LAYOUTS = Object.freeze({
  Initialize: {
    index: 0,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.authorized(),
      Layout.lockup(),
    ]),
  },
  Authorize: {
    index: 1,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.publicKey('newAuthorized'),
      BufferLayout.u32('stakeAuthorizationType'),
    ]),
  },
  Delegate: {
    index: 2,
    layout: BufferLayout.struct([BufferLayout.u32('instruction')]),
  },
  Split: {
    index: 3,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), BufferLayout.ns64('lamports')]),
  },
  Withdraw: {
    index: 4,
    layout: BufferLayout.struct([BufferLayout.u32('instruction'), BufferLayout.ns64('lamports')]),
  },
  Deactivate: {
    index: 5,
    layout: BufferLayout.struct([BufferLayout.u32('instruction')]),
  },
  AuthorizeWithSeed: {
    index: 8,
    layout: BufferLayout.struct([
      BufferLayout.u32('instruction'),
      Layout.publicKey('newAuthorized'),
      BufferLayout.u32('stakeAuthorizationType'),
      Layout.rustString('authoritySeed'),
      Layout.publicKey('authorityOwner'),
    ]),
  },
})

/**
 * Stake Instruction class
 */
export const StakeInstruction = {
  /**
   * Decode a stake instruction and retrieve the instruction type.
   */
  decodeInstructionType(instruction) {
    this.checkProgramId(instruction.programId)

    const instructionTypeLayout = BufferLayout.u32('instruction')
    const typeIndex = instructionTypeLayout.decode(instruction.data)

    let type
    for (const t of Object.keys(STAKE_INSTRUCTION_LAYOUTS)) {
      if (STAKE_INSTRUCTION_LAYOUTS[t].index === typeIndex) {
        type = t
      }
    }

    if (!type) {
      throw new Error('Instruction type incorrect; not a StakeInstruction')
    }

    return type
  },

  /**
   * Decode a initialize stake instruction and retrieve the instruction params.
   */
  decodeInitialize(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 2)

    const { authorized, lockup } = decodeData(
      STAKE_INSTRUCTION_LAYOUTS.Initialize,
      instruction.data
    )

    return {
      stakePubkey: instruction.keys[0].pubkey,
      authorized: new Authorized(
        new PublicKey(authorized.staker),
        new PublicKey(authorized.withdrawer)
      ),
      lockup: new Lockup(lockup.unixTimestamp, lockup.epoch, new PublicKey(lockup.custodian)),
    }
  },

  /**
   * Decode a delegate stake instruction and retrieve the instruction params.
   */
  decodeDelegate(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 6)
    decodeData(STAKE_INSTRUCTION_LAYOUTS.Delegate, instruction.data)

    return {
      stakePubkey: instruction.keys[0].pubkey,
      votePubkey: instruction.keys[1].pubkey,
      authorizedPubkey: instruction.keys[5].pubkey,
    }
  },

  /**
   * Decode a withdraw stake instruction and retrieve the instruction params.
   */
  decodeWithdraw(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 5)
    const { lamports } = decodeData(STAKE_INSTRUCTION_LAYOUTS.Withdraw, instruction.data)

    return {
      stakePubkey: instruction.keys[0].pubkey,
      toPubkey: instruction.keys[1].pubkey,
      authorizedPubkey: instruction.keys[4].pubkey,
      lamports,
    }
  },

  /**
   * Decode a deactivate stake instruction and retrieve the instruction params.
   */
  decodeDeactivate(instruction) {
    this.checkProgramId(instruction.programId)
    this.checkKeyLength(instruction.keys, 3)
    decodeData(STAKE_INSTRUCTION_LAYOUTS.Deactivate, instruction.data)

    return {
      stakePubkey: instruction.keys[0].pubkey,
      authorizedPubkey: instruction.keys[2].pubkey,
    }
  },

  /**
   * @private
   */
  checkProgramId(programId) {
    if (!programId.equals(StakeProgram.programId)) {
      throw new Error('invalid instruction; programId is not StakeProgram')
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
 * An enumeration of valid StakeAuthorizationLayout's
 */
export const StakeAuthorizationLayout = Object.freeze({
  Staker: {
    index: 0,
  },
  Withdrawer: {
    index: 1,
  },
})

/**
 * Factory class for transactions to interact with the Stake program
 */
export const StakeProgram = {
  /**
   * Public key that identifies the Stake program
   */
  get programId() {
    return new PublicKey('Stake11111111111111111111111111111111111111')
  },

  /**
   * Max space of a Stake account
   *
   * This is generated from the solana-stake-program StakeState struct as
   * `std::mem::size_of::<StakeState>()`:
   * https://docs.rs/solana-stake-program/1.4.4/solana_stake_program/stake_state/enum.StakeState.html
   */
  get space() {
    return 200
  },

  /**
   * Generate an Initialize instruction to add to a Stake Create transaction
   */
  initialize(params) {
    const { stakePubkey, authorized, lockup } = params
    const type = STAKE_INSTRUCTION_LAYOUTS.Initialize
    const data = encodeData(type, {
      authorized: {
        staker: authorized.staker.toBuffer(),
        withdrawer: authorized.withdrawer.toBuffer(),
      },
      lockup: {
        unixTimestamp: lockup.unixTimestamp,
        epoch: lockup.epoch,
        custodian: lockup.custodian.toBuffer(),
      },
    })
    const instructionData = {
      keys: [
        { pubkey: stakePubkey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data,
    }
    return new TransactionInstruction(instructionData)
  },

  /**
   * Generate a Transaction that creates a new Stake account at
   *   an address generated with `from`, a seed, and the Stake programId
   */
  createAccountWithSeed(params) {
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: params.fromPubkey,
        newAccountPubkey: params.stakePubkey,
        basePubkey: params.basePubkey,
        seed: params.seed,
        lamports: params.lamports,
        space: this.space,
        programId: this.programId,
      })
    )

    const { stakePubkey, authorized, lockup } = params
    return transaction.add(this.initialize({ stakePubkey, authorized, lockup }))
  },

  /**
   * Generate a Transaction that creates a new Stake account
   */
  createAccount(params) {
    const transaction = new Transaction()
    transaction.add(
      SystemProgram.createAccount({
        fromPubkey: params.fromPubkey,
        newAccountPubkey: params.stakePubkey,
        lamports: params.lamports,
        space: this.space,
        programId: this.programId,
      })
    )

    const { stakePubkey, authorized, lockup } = params
    return transaction.add(this.initialize({ stakePubkey, authorized, lockup }))
  },

  /**
   * Generate a Transaction that delegates Stake tokens to a validator
   * Vote PublicKey. This transaction can also be used to redelegate Stake
   * to a new validator Vote PublicKey.
   */
  delegate(params) {
    const { stakePubkey, authorizedPubkey, votePubkey } = params

    const type = STAKE_INSTRUCTION_LAYOUTS.Delegate
    const data = encodeData(type)

    return new Transaction().add({
      keys: [
        { pubkey: stakePubkey, isSigner: false, isWritable: true },
        { pubkey: votePubkey, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        {
          pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: STAKE_CONFIG_ID, isSigner: false, isWritable: false },
        { pubkey: authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a Transaction that withdraws deactivated Stake tokens.
   */
  withdraw(params) {
    const { stakePubkey, authorizedPubkey, toPubkey, lamports } = params
    const type = STAKE_INSTRUCTION_LAYOUTS.Withdraw
    const data = encodeData(type, { lamports })

    return new Transaction().add({
      keys: [
        { pubkey: stakePubkey, isSigner: false, isWritable: true },
        { pubkey: toPubkey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        {
          pubkey: SYSVAR_STAKE_HISTORY_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        { pubkey: authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    })
  },

  /**
   * Generate a Transaction that deactivates Stake tokens.
   */
  deactivate(params) {
    const { stakePubkey, authorizedPubkey } = params
    const type = STAKE_INSTRUCTION_LAYOUTS.Deactivate
    const data = encodeData(type)

    return new Transaction().add({
      keys: [
        { pubkey: stakePubkey, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: authorizedPubkey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data,
    })
  },
}
