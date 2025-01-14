import * as BufferLayout from '@exodus/buffer-layout'
import bs58 from 'bs58'

import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../helpers/spl-token.js'
import { SystemInstruction, SystemProgram } from './../vendor/index.js'
import * as TokenInstructions from './token-instructions.js'

const INSTRUCTION_LAYOUT = BufferLayout.union(BufferLayout.u8('instruction'))
INSTRUCTION_LAYOUT.addVariant(
  12,
  BufferLayout.struct([BufferLayout.nu64('amount'), BufferLayout.u8('decimals')]),
  'transferChecked'
)

export const INSTRUCTION_TITLE_BY_TYPE = {
  approve: 'Approve',
  cancelOrder: 'Cancel Order',
  cancelOrderV2: 'Cancel Order',
  closeAccount: 'Close Account',
  createAssociatedTokenAccount: 'Create Token Account',
  createSyncNativeInstruction: 'Create Sync Native Account',
  initializeAccount: 'Initialize Account',
  initializeMint: 'Initialize Mint',
  matchOrders: 'Match Orders',
  mintTo: 'Mint To',
  newOrder: 'Place Order',
  newOrderV3: 'Place Order',
  settleFunds: 'Settle Funds',
  signMessage: 'Sign Message',
  systemAssign: 'Assign',
  systemAllocate: 'Allocate',
  systemCreate: 'Create Account',
  systemCreateWithSeed: 'Create Account With Seed',
  systemTransfer: 'Transfer SOL',
  systemInitializeNonceAccount: 'Initialize Nonce Account',
  systemAdvanceNonceAccount: 'Advance Nonce Account',
  systemAuthorizeNonceAccount: 'Authorize Nonce Account',
  systemWithdrawNonceAccount: 'Withdraw Nonce Account',
  transfer: 'Transfer Token',
  transferChecked: 'Transfer Token Checked',
  unknown: 'Unknown',
}

class InstructionKeys {
  constructor(keys) {
    this.keys = keys
  }

  getAddress(index) {
    return this.keys[index] ? this.keys[index].pubkey : undefined
  }
}

export function getTransactionInstructionsFromMessage(message) {
  const { accountKeys, instructions } = message
  return instructions.map((instruction) => {
    const { accounts, data, programIdIndex } = instruction
    return {
      programId: accountKeys[programIdIndex],
      keys: accounts.map((account, index) => ({
        pubkey: accountKeys[account],
        isSigner: message.isAccountSigner(index),
        isWritable: message.isAccountWritable(index),
      })),
      data: bs58.decode(data),
    }
  })
}

function decodeSystemInstruction(instruction) {
  const instructionType = SystemInstruction.decodeInstructionType(instruction)

  let data
  if (instructionType === 'Create') {
    data = SystemInstruction.decodeCreateAccount(instruction)
  } else if (instructionType.includes('Nonce')) {
    data = SystemInstruction[`decodeNonce${instructionType.split('Nonce')[0]}`](instruction)
  } else {
    data = SystemInstruction[`decode${instructionType}`](instruction)
  }

  const type = `system${instructionType}`
  return {
    type,
    title: INSTRUCTION_TITLE_BY_TYPE[type],
    data,
  }
}

function decodeTokenInstructionData(data) {
  if (data.length === 1) {
    switch (data[0]) {
      case 1:
        return {
          initializeAccount: {},
        }
      case 9:
        return {
          closeAccount: {},
        }
      case 17:
        return {
          createSyncNativeInstruction: {},
        }
    }
  }

  // Type TransferChecked
  if (data.length > 1 && data[0] === 12) {
    return INSTRUCTION_LAYOUT.decode(data)
  }

  return TokenInstructions.decodeTokenInstructionData(data)
}

export function decodeTokenProgramInstruction(instruction) {
  const decodedInstructionData = decodeTokenInstructionData(instruction.data)

  if (!decodedInstructionData || Object.keys(decodedInstructionData).length > 1) {
    throw new Error('Unexpected Token Program instruction')
  }

  const keys = new InstructionKeys(instruction.keys)

  const type = Object.keys(decodedInstructionData)[0]

  let data = decodedInstructionData[type]

  switch (type) {
    case 'initializeAccount': {
      data = {
        accountPubkey: keys.getAddress(TokenInstructions.INITIALIZE_ACCOUNT_ACCOUNT_INDEX),
        mintPubKey: keys.getAddress(TokenInstructions.INITIALIZE_ACCOUNT_MINT_INDEX),
        ownerPubKey: keys.getAddress(TokenInstructions.INITIALIZE_ACCOUNT_OWNER_INDEX),
      }

      break
    }

    case 'closeAccount':
    case 'transfer': {
      data = {
        ...data,
        sourcePubkey: keys.getAddress(TokenInstructions.TRANSFER_SOURCE_INDEX),
        destinationPubKey: keys.getAddress(TokenInstructions.TRANSFER_DESTINATION_INDEX),
        ownerPubKey: keys.getAddress(TokenInstructions.TRANSFER_OWNER_INDEX),
      }

      break
    }

    case 'createSyncNativeInstruction': {
      data = {
        pubkey: keys.getAddress(0),
      }

      break
    }
    // No default
  }

  return {
    type,
    title: INSTRUCTION_TITLE_BY_TYPE[type],
    data,
  }
}

function decodeAssociatedTokenProgramInstruction(instruction) {
  const { programId } = instruction
  const type = 'createAssociatedTokenAccount'
  return {
    type,
    title: INSTRUCTION_TITLE_BY_TYPE[type],
    data: { programId },
  }
}

function decodeTokenInstruction(instruction) {
  const { programId } = instruction

  try {
    if (programId.equals(TOKEN_PROGRAM_ID)) {
      return decodeTokenProgramInstruction(instruction)
    }

    if (programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID)) {
      return decodeAssociatedTokenProgramInstruction(instruction)
    }
  } catch (err) {
    console.warn(err)
  }

  const type = 'unknown'
  return {
    type,
    title: INSTRUCTION_TITLE_BY_TYPE[type],
    data: {
      programId,
      rawData: instruction.data,
    },
  }
}

export function decodeTransactionInstructions(transactionMessages) {
  const transactionInstructions = transactionMessages.reduce((prevInstructions, message) => {
    let instructions
    const isTransactionMessage =
      message.instructions.length > 0 && message.instructions[0].programId !== undefined
    if (isTransactionMessage) {
      instructions = message.instructions
    } else {
      instructions = getTransactionInstructionsFromMessage(message)
    }

    return [...prevInstructions, ...instructions]
  }, [])
  return transactionInstructions.map((instruction) => {
    if (instruction.programId.equals(SystemProgram.programId)) {
      return decodeSystemInstruction(instruction)
    }

    return decodeTokenInstruction(instruction)
  })
}
