/**
 * This utility calculates how many Satoshis a TX signer is going to spend when the TX gets confirmed.
 * Note: the actual sending value may be changed even after TX is signed, which depends on the SIGHASH value(s).
 **/

import { calculateInputs, calculateOutputs } from './common.js'

import type { BtcAggregatedTransactionSimulationResult } from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Asset, NumberUnit } from '@exodus/web3-types'

export function estimateTransfer({
  addresses,
  asset,
  fee,
  inputIndexesToSign,
  psbt,
  simulationResult,
}: {
  addresses: Record<string, boolean>
  asset: Asset
  fee: NumberUnit
  inputIndexesToSign: Array<number>
  psbt: Psbt
  simulationResult: BtcAggregatedTransactionSimulationResult
}): void | never {
  const inputAmount = asset.currency.baseUnit(
    calculateInputs({ psbt, inputIndexesToSign }).toString(),
  )
  const outputAmountSelfSend = asset.currency.baseUnit(
    calculateOutputs({ psbt, addresses }).toString(),
  )
  const outputAmountSelfSendWithFee = outputAmountSelfSend.add(fee)

  if (inputAmount.gte(outputAmountSelfSendWithFee)) {
    simulationResult.balanceChanges.willSend.push({
      balance: inputAmount.sub(outputAmountSelfSendWithFee),
    })
  } else {
    simulationResult.balanceChanges.willReceive.push({
      balance: outputAmountSelfSendWithFee.sub(inputAmount),
    })
  }
}
