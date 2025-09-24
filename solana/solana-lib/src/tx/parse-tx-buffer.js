import BN from 'bn.js'
import bs58 from 'bs58'

import { COMPUTE_BUDGET_PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants.js'
import { deserializeTransaction } from './common.js'

function decodeSPLTransferData(base58Data) {
  const buffer = bs58.decode(base58Data)

  // 1 byte
  if (buffer[0] !== 3) {
    throw new Error(`Unsupported instruction type: ${buffer[0]}`)
  }

  const amountBytes = buffer.slice(1, 9)
  const amountBN = new BN(amountBytes, 'le')

  return { amount: amountBN, method: 'transfer' }
}

function decodeSystemTransferData(base58Data) {
  const buffer = bs58.decode(base58Data)

  // 4 bytes
  if (buffer.readUInt32LE(0) !== 2) {
    throw new Error(`Unsupported instruction type for SystemProgram: ${buffer.readUInt32LE(0)}`)
  }

  const amountBytes = buffer.slice(4, 12)
  const amountBN = new BN(amountBytes, 'le')

  return {
    amount: amountBN,
    method: 'systemTransfer',
  }
}

// TODO support more tx types/options
export function isTokenTransfer(tx) {
  const { message } = tx
  const { accountKeys, instructions } = message

  if (!Array.isArray(accountKeys) || accountKeys.length !== 6) return false
  if (!Array.isArray(instructions) || instructions.length !== 3) return false

  const [ix1, ix2, ix3] = instructions
  if (
    !accountKeys[ix1.programIdIndex].equals(COMPUTE_BUDGET_PROGRAM_ID) ||
    !accountKeys[ix2.programIdIndex].equals(COMPUTE_BUDGET_PROGRAM_ID)
  ) {
    return false
  }

  if (!accountKeys[ix3.programIdIndex].equals(TOKEN_PROGRAM_ID)) return false

  if (!Array.isArray(ix3.accounts) || ix3.accounts.length !== 3) return false

  try {
    const data = bs58.decode(ix3.data)
    if (data[0] !== 0x03) return false
  } catch {
    return false
  }

  return true
}

export function isSolanaTransfer(tx) {
  const { message } = tx
  const { accountKeys, instructions } = message

  if (!Array.isArray(accountKeys) || accountKeys.length !== 5) return false
  if (!Array.isArray(instructions) || instructions.length !== 3) return false

  if (
    !accountKeys[instructions[0].programIdIndex].equals(COMPUTE_BUDGET_PROGRAM_ID) ||
    !accountKeys[instructions[1].programIdIndex].equals(COMPUTE_BUDGET_PROGRAM_ID)
  ) {
    return false
  }

  const ix = instructions[2]
  if (!accountKeys[ix.programIdIndex].equals(SYSTEM_PROGRAM_ID)) return false

  if (!Array.isArray(ix.accounts) || ix.accounts.length !== 2) return false

  try {
    const data = bs58.decode(ix.data)
    if (data[0] !== 0x02) return false
  } catch {
    return false
  }

  return true
}

// TODO: Unify with parseTransaction in solana-api and use there as well?
// TODO: support more tx types.
export async function parseTxBuffer(buffer, api) {
  const transaction = deserializeTransaction(buffer)

  try {
    if (isTokenTransfer(transaction)) {
      const mainInstruction = transaction.message.instructions[2]
      const { amount, method } = decodeSPLTransferData(mainInstruction.data)

      const fromTokenAddress =
        transaction.message.accountKeys[mainInstruction.accounts[0]].toBase58()
      const toTokenAddress = transaction.message.accountKeys[mainInstruction.accounts[1]].toBase58()
      const from = await api.getTokenAddressOwner(fromTokenAddress)
      const to = await api.getTokenAddressOwner(toTokenAddress)
      return {
        method,
        from,
        to,
        amount,
      }
    }

    if (isSolanaTransfer(transaction)) {
      const mainInstruction = transaction.message.instructions[2]
      const { amount, method } = decodeSystemTransferData(mainInstruction.data)

      return {
        method,
        from: transaction.message.accountKeys[mainInstruction.accounts[0]],
        to: transaction.message.accountKeys[mainInstruction.accounts[1]],
        amount,
      }
    }
  } catch (error) {
    console.log('transaction check error', error)
  }

  throw new Error('Transaction not supported for buffer parsing')
}
