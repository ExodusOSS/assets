import { struct, u8 } from '@exodus/buffer-layout'
import * as BufferLayout from '@exodus/buffer-layout'

import { PublicKey, TransactionInstruction } from '../vendor/index.js'
import { U64 } from './spl-token.js'

/**
 * Layout for a 64bit unsigned value
 */
const u64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property)
}

// Extracted from https://github.com/solana-labs/solana-program-library/blob/token-js-v0.4.1/token/js/src/extensions/transferFee/instructions.ts

export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

export const TransferFeeInstruction = {
  InitializeTransferFeeConfig: 0,
  TransferCheckedWithFee: 1,
  WithdrawWithheldTokensFromMint: 2,
  WithdrawWithheldTokensFromAccounts: 3,
  HarvestWithheldTokensToMint: 4,
  SetTransferFee: 5,
}

// https://github.com/solana-labs/solana-program-library/blob/token-js-v0.4.1/token/js/src/instructions/types.ts
export const TokenInstruction = {
  TransferFeeExtension: 26,
}

/*
// TransferCheckedWithFee
export interface TransferCheckedWithFeeInstructionData {
    instruction: TokenInstruction.TransferFeeExtension;
    transferFeeInstruction: TransferFeeInstruction.TransferCheckedWithFee;
    amount: bigint;
    decimals: number;
    fee: bigint;
}
*/

export const transferCheckedWithFeeInstructionData = struct([
  u8('instruction'),
  u8('transferFeeInstruction'),
  u64('amount'),
  u8('decimals'),
  u64('fee'),
])

/**
 * Construct an TransferCheckedWithFee instruction
 *
 * @param source          The source account
 * @param mint            The token mint
 * @param destination     The destination account
 * @param authority       The source account's owner/delegate
 * @param signers         The signer account(s)
 * @param amount          The amount of tokens to transfer
 * @param decimals        The expected number of base 10 digits to the right of the decimal place
 * @param fee             The expected fee assesed on this transfer, calculated off-chain based on the transferFeeBasisPoints and maximumFee of the mint.
 * @param programId       SPL Token program account
 *
 * @returns Instruction to add to a transaction
 */
export function createTransferCheckedWithFeeInstruction(
  source, // PublicKey
  mint, // PublicKey
  destination, // PublicKey
  authority, // PublicKey
  amount, // bigint
  decimals, // number
  fee, // bigint
  multiSigners = [], // (Signer | PublicKey)[]
  programId = TOKEN_2022_PROGRAM_ID
) {
  source = new PublicKey(source)
  mint = new PublicKey(mint)
  destination = new PublicKey(destination)
  authority = new PublicKey(authority)

  if (programId !== TOKEN_2022_PROGRAM_ID) {
    throw new Error('TokenUnsupportedInstructionError')
  }

  const data = Buffer.alloc(transferCheckedWithFeeInstructionData.span)
  transferCheckedWithFeeInstructionData.encode(
    {
      instruction: TokenInstruction.TransferFeeExtension,
      transferFeeInstruction: TransferFeeInstruction.TransferCheckedWithFee,
      amount: new U64(amount).toBuffer(),
      decimals,
      fee: new U64(fee).toBuffer(),
    },
    data
  )
  const keys = addSigners(
    [
      { pubkey: source, isSigner: false, isWritable: true },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: destination, isSigner: false, isWritable: true },
    ],
    authority,
    multiSigners
  )
  return new TransactionInstruction({ keys, programId, data })
}

/**
 * Decode a TransferCheckedWithFee instruction and validate it
 *
 * @param instruction Transaction instruction to decode
 * @param programId   SPL Token program account
 *
 * @returns Decoded, valid instruction
 */
export function decodeTransferCheckedWithFeeInstruction(
  instruction, // TransactionInstruction
  programId // PublicKey
) {
  if (!instruction.programId.equals(programId))
    throw new Error('TokenInvalidInstructionProgramError')
  if (instruction.data.length !== transferCheckedWithFeeInstructionData.span)
    throw new Error('TokenInvalidInstructionDataError')

  const {
    keys: { source, mint, destination, authority, signers },
    data,
  } = decodeTransferCheckedWithFeeInstructionUnchecked(instruction)
  if (
    data.instruction !== TokenInstruction.TransferFeeExtension ||
    data.transferFeeInstruction !== TransferFeeInstruction.TransferCheckedWithFee
  )
    throw new Error('TokenInvalidInstructionTypeError')
  if (!mint) throw new Error('TokenInvalidInstructionKeysError')

  return {
    programId,
    keys: {
      source,
      mint,
      destination,
      authority,
      signers: signers || null,
    },
    data,
  }
}

/**
 * Decode a TransferCheckedWithFees instruction without validating it
 *
 * @param instruction Transaction instruction to decode
 *
 * @returns Decoded, non-validated instruction
 */
export function decodeTransferCheckedWithFeeInstructionUnchecked({
  programId,
  keys: [source, mint, destination, authority, ...signers],
  data,
}) {
  const { instruction, transferFeeInstruction, amount, decimals, fee } =
    transferCheckedWithFeeInstructionData.decode(data)

  return {
    programId,
    keys: {
      source,
      mint,
      destination,
      authority,
      signers,
    },
    data: {
      instruction,
      transferFeeInstruction,
      amount,
      decimals,
      fee,
    },
  }
}

// utils

export function addSigners(
  keys, // AccountMeta[],
  ownerOrAuthority, // PublicKey,
  multiSigners // (Signer | PublicKey)[]
) {
  if (multiSigners.length > 0) {
    keys.push({ pubkey: ownerOrAuthority, isSigner: false, isWritable: false })
    for (const signer of multiSigners) {
      keys.push({
        pubkey: signer instanceof PublicKey ? signer : signer.publicKey,
        isSigner: true,
        isWritable: false,
      })
    }
  } else {
    keys.push({ pubkey: ownerOrAuthority, isSigner: true, isWritable: false })
  }

  return keys
}
