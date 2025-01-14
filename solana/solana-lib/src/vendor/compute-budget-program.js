import * as BufferLayout from '@exodus/buffer-layout'

import { decodeData, encodeData } from './instruction.js'
import { PublicKey } from './publickey.js'
import { TransactionInstruction } from './transaction.js'

// 1 microLamport = 0.000001 lamports

/**
 * Compute Budget Instruction class
 */
// eslint-disable-next-line unicorn/no-static-only-class
export class ComputeBudgetInstruction {
  /**
   * Decode a compute budget instruction and retrieve the instruction type.
   */
  static decodeInstructionType(instruction) {
    this.checkProgramId(instruction.programId)

    const instructionTypeLayout = BufferLayout.u8('instruction')
    const typeIndex = instructionTypeLayout.decode(instruction.data)

    let type
    for (const [ixType, layout] of Object.entries(COMPUTE_BUDGET_INSTRUCTION_LAYOUTS)) {
      if (layout.index === typeIndex) {
        type = ixType
        break
      }
    }

    if (!type) {
      throw new Error('Instruction type incorrect; not a ComputeBudgetInstruction')
    }

    return type
  }

  /**
   * Decode request units compute budget instruction and retrieve the instruction params.
   */
  static decodeRequestUnits(instruction) {
    this.checkProgramId(instruction.programId)
    const { units, additionalFee } = decodeData(
      COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits,
      instruction.data
    )
    return { units, additionalFee }
  }

  /**
   * Decode request heap frame compute budget instruction and retrieve the instruction params.
   */
  static decodeRequestHeapFrame(instruction) {
    this.checkProgramId(instruction.programId)
    const { bytes } = decodeData(
      COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame,
      instruction.data
    )
    return { bytes }
  }

  /**
   * Decode set compute unit limit compute budget instruction and retrieve the instruction params.
   */
  static decodeSetComputeUnitLimit(instruction) {
    this.checkProgramId(instruction.programId)
    const { units } = decodeData(
      COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit,
      instruction.data
    )
    return { units }
  }

  /**
   * Decode set compute unit price compute budget instruction and retrieve the instruction params.
   */
  static decodeSetComputeUnitPrice(instruction) {
    this.checkProgramId(instruction.programId)
    const { microLamports } = decodeData(
      COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice,
      instruction.data
    )
    return { microLamports }
  }

  /**
   * @internal
   */
  static checkProgramId(programId) {
    if (!programId.equals(ComputeBudgetProgram.programId)) {
      throw new Error('invalid instruction; programId is not ComputeBudgetProgram')
    }
  }
}

/**
 * An enumeration of valid ComputeBudget InstructionType's
 * @internal
 */
export const COMPUTE_BUDGET_INSTRUCTION_LAYOUTS = Object.freeze({
  RequestUnits: {
    index: 0,
    layout: BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.u32('units'),
      BufferLayout.u32('additionalFee'),
    ]),
  },
  RequestHeapFrame: {
    index: 1,
    layout: BufferLayout.struct([BufferLayout.u8('instruction'), BufferLayout.u32('bytes')]),
  },
  SetComputeUnitLimit: {
    index: 2,
    layout: BufferLayout.struct([BufferLayout.u8('instruction'), BufferLayout.u32('units')]),
  },
  SetComputeUnitPrice: {
    index: 3,
    layout: BufferLayout.struct([
      BufferLayout.u8('instruction'),
      BufferLayout.ns64('microLamports'),
    ]),
  },
})

/**
 * Factory class for transaction instructions to interact with the Compute Budget program
 */
// eslint-disable-next-line unicorn/no-static-only-class
export class ComputeBudgetProgram {
  /**
   * Public key that identifies the Compute Budget program
   */
  static programId = new PublicKey('ComputeBudget111111111111111111111111111111')

  /**
   * @deprecated Instead, call {@link setComputeUnitLimit} and/or {@link setComputeUnitPrice}
   */
  static requestUnits(params) {
    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestUnits
    const data = encodeData(type, params)
    return new TransactionInstruction({
      keys: [],
      programId: this.programId,
      data,
    })
  }

  static requestHeapFrame(params) {
    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.RequestHeapFrame
    const data = encodeData(type, params)
    return new TransactionInstruction({
      keys: [],
      programId: this.programId,
      data,
    })
  }

  static setComputeUnitLimit(params) {
    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitLimit
    const data = encodeData(type, params)
    return new TransactionInstruction({
      keys: [],
      programId: this.programId,
      data,
    })
  }

  static setComputeUnitPrice(params) {
    const type = COMPUTE_BUDGET_INSTRUCTION_LAYOUTS.SetComputeUnitPrice
    const data = encodeData(type, {
      microLamports: Number(params.microLamports), // replaced from BigInt
    })
    return new TransactionInstruction({
      keys: [],
      programId: this.programId,
      data,
    })
  }
}
