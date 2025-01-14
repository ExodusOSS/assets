import { decodeTransactionInstructions, PublicKey } from '@exodus/solana-lib'
import { formatAmount } from '@exodus/web3-utils'

import { prepareSolTransactions } from '../transactions.js'

import type {
  AdvancedDetails,
  DecodedTransactionInstruction,
  LegacyOrVersionedTransaction,
} from '../types.js'

function instructionNameToTitle(instructionName: string) {
  return (
    instructionName
      // inject space before the upper case letters
      .replace(/(\w)([A-Z])/g, `$1 $2`)
      // replace first char with upper case
      .replace(/^./, (match) => match.toUpperCase())
  )
}

const formatInstruction = (
  instructionName: string,
  instructionValue: typeof PublicKey,
) => {
  let value = instructionValue
  instructionName = instructionName.replace(/PubKey/i, 'Public Key')
  let name = instructionNameToTitle(instructionName)

  if (Buffer.isBuffer(value)) {
    value = Buffer.from(value).toString('base64')
  } else if (value instanceof PublicKey) {
    value = value.toBase58()
  } else {
    value = value.toString()
  }

  if (name === 'Lamports') {
    name = 'Amount'
    value = `${formatAmount(value, 9).substring(0, 6)} SOL`
  }

  value = String(value)
  const formattedValue =
    value.length > 14 ? `${value.substring(0, 4)}..${value.slice(-4)}` : value

  return {
    name,
    value,
    formattedValue,
  }
}

export const decodeTxInstructions = async (
  transactions: LegacyOrVersionedTransaction[],
): Promise<AdvancedDetails> => {
  const transactionMessages = await prepareSolTransactions(transactions)
  const messages = transactionMessages.map(
    (message) => message.decompiled || message.compiled,
  )

  return decodeTransactionInstructions(messages).map(
    ({ title, data }: DecodedTransactionInstruction) => {
      return {
        title,
        instructions: Object.keys(data).map((name) =>
          formatInstruction(name, data[name]),
        ),
      }
    },
  )
}
