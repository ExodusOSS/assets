import { createEmptySimulationResult } from '@exodus/web3-utils'

import { estimateFee } from './simulation/estimateFee.js'
import { simulateTransactions } from './simulation/simulateTransactions.js'
import { tryEstimatingChangesLocally } from './simulation/tryEstimatingChangesLocally.js'
import { decodeRecipientAddresses, getDisplayDetails, getTxFeeDetails } from './transactions.js'

import type {
  EthAggregatedTransactionSimulationResult,
  EthFeeDetails,
  EthSimulateTransactionParams,
} from './types.js'
import type { CreateSimulateTransactionsParams } from '@exodus/web3-types'

export const createSimulateTransactions =
  ({ apiEndpoint, headers }: Required<CreateSimulateTransactionsParams>) =>
  async ({
    transactions,
    asset,
    origin,
    overrideApiEndpoint,
  }: EthSimulateTransactionParams): Promise<EthAggregatedTransactionSimulationResult> => {
    // Ethereum transactions from web3 providers are always one item in an array.
    const transaction = transactions[0]

    const simulationResult = createEmptySimulationResult<EthFeeDetails>({
      asset,
    })
    simulationResult.balanceChanges.willPayFee.push({
      balance: estimateFee({ asset, transaction }),
      feeDetails: getTxFeeDetails(transaction),
    })

    if (!transaction.to) {
      return simulationResult
    }

    simulationResult.recipientAddresses = transactions.map((tx) => decodeRecipientAddresses(tx))

    const simulationTransactionInternalResult = await simulateTransactions({
      asset,
      transactions,
      apiEndpoint: overrideApiEndpoint || apiEndpoint,
      origin,
      simulationResult,
      headers,
    })

    if (simulationTransactionInternalResult.kind === 'error') {
      const simulatedLocally = tryEstimatingChangesLocally({
        asset,
        simulationResult,
        transaction,
      })
      if (!simulatedLocally) {
        simulationResult.warnings.push({
          kind: 'INTERNAL_ERROR',
          severity: 'HIGH',
          message: 'Balance changes cannot be estimated.',
        })
      }

      if (simulationTransactionInternalResult.errorMessage) {
        simulationResult.metadata.humanReadableError = simulationTransactionInternalResult.errorMessage
      }

      return simulationResult
    }

    simulationResult.displayDetails = getDisplayDetails(
      simulationResult.balanceChanges.willApprove,
    )

    return simulationResult
  }
