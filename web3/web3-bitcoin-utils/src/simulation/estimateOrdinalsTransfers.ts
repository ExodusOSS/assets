import { createCurrency } from '@exodus/web3-utils'

import { getInscriptionsDataFromInput, getTxId } from './common.js'

import type {
  BtcAggregatedTransactionSimulationResult,
  Inscription,
  InsightClient,
  RawTransaction,
} from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Logger } from '@exodus/logger'
import type { Asset } from '@exodus/web3-types'

export async function estimateOrdinalsTransfers({
  addresses,
  currency,
  insightClient,
  inputIndexesToSign,
  logger,
  psbt,
  simulationResult,
}: {
  addresses: Record<string, boolean>
  currency: Asset['currency']
  insightClient: InsightClient
  inputIndexesToSign: number[]
  logger?: Logger
  psbt: Psbt
  simulationResult: BtcAggregatedTransactionSimulationResult
}) {
  try {
    const allInscriptions: Inscription[] = []
    let inputOffset = 0

    const txIds = psbt.txInputs.map((_, inputIdx) => {
      return getTxId({
        input: psbt.data.inputs[inputIdx],
      })
    })

    const txIdsUnique = Array.from(new Set(txIds))

    const txObjectsMap = new Map<string, RawTransaction>()

    await Promise.all(
      txIdsUnique.map(async (txId) => {
        if (txId) {
          const tx = await insightClient.fetchTxObject(txId)
          txObjectsMap.set(txId, tx)
        }
      }),
    )

    for (let inputIdx = 0; inputIdx < psbt.txInputs.length; inputIdx++) {
      const inputData = getInscriptionsDataFromInput({
        currency,
        psbt,
        inputIdx,
        txObjectsMap,
      })

      if (!inputData) {
        throw new Error(
          `Unable to load tx ordinal data of tx input ${inputIdx}`,
        )
      }

      const { value, inscriptions } = inputData

      if (inscriptions) {
        allInscriptions.push(
          ...inscriptions.map((i: Inscription) => ({
            ...i,
            offset: i.offset + inputOffset,
          })),
        )
        if (inputIndexesToSign.includes(inputIdx) && inscriptions[0]) {
          const balanceChange = {
            balance: createCurrency({
              amount: 1,
              symbol: 'NFT',
              denominator: 1,
            }),
            nft: {
              id: `bitcoin:${inscriptions[0].inscriptionId}`,
              compositeId: inscriptions[0].inscriptionId,
            },
          }
          simulationResult.balanceChanges.willSend.push(balanceChange)
        }
      }

      inputOffset += value
    }

    let outputOffset = 0
    for (const output of psbt.txOutputs) {
      const value = currency.baseUnit(output.value).toBaseNumber()
      const inscriptions = allInscriptions
        .map((i) => ({ ...i, offset: i.offset - outputOffset }))
        .filter((i) => i.offset >= 0 && i.offset < value)

      if (inscriptions.length && addresses[output.address!]) {
        const balanceChange = {
          balance: createCurrency({ amount: 1, symbol: 'NFT', denominator: 1 }),
          nft: {
            id: `bitcoin:${inscriptions[0].inscriptionId}`,
            compositeId: inscriptions[0].inscriptionId,
          },
        }
        simulationResult.balanceChanges.willReceive.push(balanceChange)
      }
      outputOffset += value
    }

    // The PSBT is receiving more than sending, this is a selling Ordinals PSBT.
    if (outputOffset > inputOffset) {
      simulationResult.balanceChanges.willReceive =
        simulationResult.balanceChanges.willReceive.filter(({ nft }) => !nft)
    }
  } catch (err) {
    logger?.error(err)
    simulationResult.displayDetails!.warnings = [
      'The transaction may include Ordinals transfers that we were not able to detect.',
    ]
  }
}
