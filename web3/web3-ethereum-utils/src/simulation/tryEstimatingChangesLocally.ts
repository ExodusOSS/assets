import { createCurrency } from '@exodus/web3-utils'

import { getCreateCurrencyParams } from './common.js'
import {
  estimateSimpleTransfer,
  NotSimpleTransferError,
} from './estimateSimpleTransfer.js'

import type {
  EthAggregatedTransactionSimulationResult,
  EthTransaction,
} from '../types.js'
import type { Asset } from '@exodus/web3-types'

/*
 Mutates the provided 'simulationResult' adding a 'willSend' entry if the transaction is a simple transfer.
 The function also returns a boolean indicating whether the local simulation was possible (e.g., if any balance changes were made).
 */

export const tryEstimatingChangesLocally = ({
  asset,
  simulationResult,
  transaction,
}: {
  asset: Asset
  simulationResult: EthAggregatedTransactionSimulationResult
  transaction: EthTransaction
}): boolean => {
  try {
    const estimatedValue = estimateSimpleTransfer({ asset, transaction })
    const actualTransferValue =
      transaction.from.toLowerCase() === transaction.to!.toLowerCase()
        ? createCurrency(getCreateCurrencyParams(asset, 0)) // A self-send does not transfer any funds.
        : estimatedValue
    simulationResult.balanceChanges.willSend.push({
      balance: actualTransferValue,
    })

    return true
  } catch (err) {
    const expectedError = err instanceof NotSimpleTransferError
    if (!expectedError) {
      // ToDo: accept a logger dep and log an error here
    }

    return false
  }
}
