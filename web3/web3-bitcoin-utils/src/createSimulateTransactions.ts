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
  InsightClient,
} from './types.js'
import type { Logger } from '@exodus/logger'
import type { Asset } from '@exodus/web3-types'

function sanitizeErroredSimulationResult(
  simulationResult: BtcAggregatedTransactionSimulationResult,
) {
  simulationResult.balanceChanges.willSend = []
  simulationResult.balanceChanges.willReceive = []
}

export const createSimulateTransactions = ({
  baseAssetName,
  currency,
  insightClient,
  logger,
}: {
  baseAssetName: string
  currency: Asset['currency']
  insightClient: InsightClient
  logger?: Logger
}) => {
  return async function simulationTransactions({
    transactions,
    indexToAddressRecord,
    walletAddresses,
  }: BtcSimulateTransactionParams): Promise<BtcAggregatedTransactionSimulationResult> {
    const simulationResult = createEmptySimulationResult<
      unknown,
      BitcoinAdvancedDetails
    >({
      baseAssetName,
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
        inputIndexesToSign,
        currency,
        psbt,
        simulationResult,
      })
      estimateTransfer({
        currency,
        inputIndexesToSign,
        addresses: walletAddresses,
        psbt,
        simulationResult,
        fee: simulationResult.balanceChanges.willPayFee[0].balance,
      })
      fillAdvancedDetails({
        addresses: walletAddresses,
        currency,
        indexToAddressRecord,
        psbt,
        simulationResult,
      })
      await estimateOrdinalsTransfers({
        addresses: walletAddresses,
        currency,
        insightClient,
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
