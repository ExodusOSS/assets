/*
 This utility determines whether the provided transaction is a simple native token transfer
 and returns the value it's sending if that's true. Throws an error otherwise.

 Note: only simple transfers (non-smart contract calls) can be reliably evaluated locally.
 Even empty `data` field transactions ("0x") can cause unexpected state changes if sent to a smart contract
 with a gas limit exceeding 21000 units.
 */

import { createCurrency, hexToBN } from '@exodus/web3-utils'

import { getCreateCurrencyParams } from './common.js'
import { isSimpleTransfer } from '../transactions.js'

import type { EthTransaction } from '../types.js'
import type { Asset, NumberUnit } from '@exodus/web3-types'

export class NotSimpleTransferError extends Error {
  constructor(msg: string) {
    super(msg)
  }
}

export const estimateSimpleTransfer = ({
  asset,
  transaction,
}: {
  asset: Asset
  transaction: EthTransaction
}): NumberUnit | never => {
  if (!isSimpleTransfer(transaction)) {
    throw new NotSimpleTransferError(
      'The transaction input should be empty ("0x").',
    )
  }

  const txValue = hexToBN(transaction.value || '0x0').toString()

  return createCurrency(getCreateCurrencyParams(asset, txValue))
}
