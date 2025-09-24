import type {
  AssetClientInterface,
  CreateSimulateTransactionsParams,
} from '@exodus/web3-types'
import { createEmptySimulationResult } from '@exodus/web3-utils'

import {
  getTransactionFee,
  simulateTransactions,
} from './simulation/simulateTransactions.js'
import { decodeTxInstructions } from './simulation/transactionInstructions.js'
import { decodeRecipientAddresses } from './transactions.js'
import type {
  AdvancedDetails,
  SolAggregatedTransactionSimulationResult,
  SolSimulateTransactionParams,
} from './types.js'

export const createSimulateTransactions =
  ({
    apiEndpoint = 'https://simulation.a.exodus.io/simulate',
    headers = {
      'X-Api-Version': '2023-06-05',
    },
    assetClientInterface,
  }: Partial<CreateSimulateTransactionsParams> & {
    assetClientInterface: AssetClientInterface
  }) =>
  async ({
    transactions,
    asset,
    origin,
    overrideApiEndpoint,
    senderAddress,
  }: SolSimulateTransactionParams): Promise<SolAggregatedTransactionSimulationResult> => {
    const simulationResult = createEmptySimulationResult<
      unknown,
      AdvancedDetails
    >({
      asset,
    })
    simulationResult.balanceChanges.willPayFee.push({
      balance: await getTransactionFee({
        asset,
        getFeeData: assetClientInterface.getFeeConfig,
        transactionsMessages: transactions,
        senderAddress,
      }),
    })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint: overrideApiEndpoint || apiEndpoint,
      origin,
      simulationResult,
      headers,
      senderAddress,
    })

    try {
      simulationResult.advancedDetails =
        await decodeTxInstructions(transactions)
    } catch {
      // TODO: accept a logger deps and log the error
    }

    // temporary until returned from the simulation endpoint
    simulationResult.recipientAddresses = transactions.map((tx) =>
      decodeRecipientAddresses(tx),
    )

    return simulationResult
  }
