import { createEmptySimulationResult } from '@exodus/web3-utils'

import {
  deserializeAndSanityCheckPSBT,
  InvalidPSBTError,
} from './simulation/deserializeAndSanityCheckPSBT.js'
import { estimateOrdinalsTransfers } from './simulation/estimateOrdinalsTransfers.js'
import { fillAdvancedDetails } from './simulation/fillAdvancedDetails.js'
import { fillWarnings } from './simulation/fillWarnings.js'
import { estimateFee, estimateTransfer } from './simulation/index.js'

import type {
  BtcAggregatedTransactionSimulationResult,
  BtcSimulateTransactionParams,
  BitcoinAdvancedDetails,
} from './types.js'
import type { Logger } from '@exodus/logger'

function sanitizeErroredSimulationResult(
  simulationResult: BtcAggregatedTransactionSimulationResult,
) {
  simulationResult.balanceChanges.willSend = []
  simulationResult.balanceChanges.willReceive = []
}

export const createSimulateTransactions = ({
  logger,
}: { logger?: Logger } = {}) => {
  return async function simulationTransactions({
    transactions,
    asset,
    indexToAddressRecord,
    walletAddresses,
  }: BtcSimulateTransactionParams): Promise<BtcAggregatedTransactionSimulationResult> {
    const simulationResult = createEmptySimulationResult<
      unknown,
      BitcoinAdvancedDetails
    >({
      asset,
    })
    simulationResult.advancedDetails = {
      inputs: [],
      outputs: [],
    }

    const inputIndexesToSign = Object.keys(indexToAddressRecord).map((index) =>
      parseInt(index, 10),
    )

    try {
      // Bitcoin transactions from dApps are always one item in an array.
      const psbt = deserializeAndSanityCheckPSBT(
        transactions[0],
        indexToAddressRecord,
      )

      estimateFee({
        asset,
        inputIndexesToSign,
        psbt,
        simulationResult,
      })
      estimateTransfer({
        asset,
        inputIndexesToSign,
        addresses: walletAddresses,
        psbt,
        simulationResult,
        fee: simulationResult.balanceChanges.willPayFee[0].balance,
      })
      fillAdvancedDetails({
        addresses: walletAddresses,
        asset,
        indexToAddressRecord,
        psbt,
        simulationResult,
      })
      await estimateOrdinalsTransfers({
        asset,
        addresses: walletAddresses,
        inputIndexesToSign,
        logger,
        psbt,
        simulationResult,
      })
      fillWarnings({ indexToAddressRecord, simulationResult })
    } catch (err) {
      if (err instanceof InvalidPSBTError) {
        simulationResult.warnings.push({
          kind: 'INTERNAL_ERROR',
          severity: 'HIGH',
          message:
            'Invalid Bitcoin transaction is passed. Balance changes can not be estimated.',
        })
      } else {
        simulationResult.warnings.push({
          kind: 'INTERNAL_ERROR',
          severity: 'HIGH',
          message: 'Balance changes can not be estimated.',
        })
      }

      logger?.error(err)

      // If an error occurs, we have to ensure that the simulation result does not have a "partial" estimation
      // (e.g. if it failed on estimating the receiving part).
      // We still consider displaying the fee estimation as safe.
      sanitizeErroredSimulationResult(simulationResult)
    }

    return simulationResult
  }
}
