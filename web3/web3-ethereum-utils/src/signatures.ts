import { Common, Hardfork } from '@exodus/ethereumjs/common'
import {
  SignTypedDataVersion,
  personalSign,
  signTypedData as ethSigUtilSignTypedData,
} from '@exodus/ethereumjs/eth-sig-util'
import {
  FeeMarketEIP1559Transaction,
  Transaction as LegacyTransaction,
} from '@exodus/ethereumjs/tx'

import type { EthTransactionParams } from './types.js'
import type {
  MessageTypes,
  TypedDataV1,
  TypedMessage,
} from '@exodus/ethereumjs/eth-sig-util'

const custom = Common.default?.custom || Common.custom

export function signMessage(message: string, privateKey: Buffer): string {
  return personalSign({ privateKey, data: message })
}

export function signTypedData(
  typedData: TypedDataV1 | TypedMessage<MessageTypes>,
  privateKey: Buffer,
  version: SignTypedDataVersion = SignTypedDataVersion.V4,
): string {
  return ethSigUtilSignTypedData({ privateKey, data: typedData, version })
}

export function signTransaction(
  transactionParams: EthTransactionParams,
  privateKey: Buffer,
): Buffer {
  const { chainId, ...transactionData } = transactionParams

  const isEIP1559Enabled = !!transactionParams.maxFeePerGas
  const transaction = isEIP1559Enabled
    ? FeeMarketEIP1559Transaction.fromTxData(transactionData, {
        common: custom({ chainId }, { hardfork: Hardfork.London }),
      })
    : LegacyTransaction.fromTxData(transactionData, {
        common: custom({ chainId }),
      })

  const signedTransaction = transaction.sign(privateKey)
  return signedTransaction.serialize()
}

export function hex0xStringToBuffer(hex: string): Buffer {
  // Remove the 0x
  const hexWithout0x = hex.startsWith('0x') ? hex.slice(2) : hex
  // Pad the value until even
  const hexWithLeadingZeros =
    hexWithout0x.length % 2 === 0 ? hexWithout0x : '0' + hexWithout0x
  // Finally  return the buffer
  return Buffer.from(hexWithLeadingZeros, 'hex')
}

export function bufferToHex0xString(buf: Buffer): string {
  if (!Buffer.isBuffer(buf)) {
    throw new Error('expected a buffer')
  }
  const hex = buf.toString('hex')

  if (typeof hex !== 'string') {
    throw new Error('expected hex string')
  }

  return '0x' + hex
}
