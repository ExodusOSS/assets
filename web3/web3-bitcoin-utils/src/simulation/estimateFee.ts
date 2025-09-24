import { calculateInputs, calculateOutputs } from './common.js'

import type { BtcAggregatedTransactionSimulationResult } from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Asset } from '@exodus/web3-types'

export const estimateFee = ({
  inputIndexesToSign,
  currency,
  psbt,
  simulationResult,
}: {
  inputIndexesToSign: Array<number>
  currency: Asset['currency']
  psbt: Psbt
  simulationResult: BtcAggregatedTransactionSimulationResult
}): void => {
  const inputAmount = calculateInputs({ psbt, inputIndexesToSign })
  const outputAmount = calculateOutputs({ psbt })

  const diff = inputAmount.sub(outputAmount)
  const fee = currency.baseUnit(diff.gtn(0) ? diff.toString() : '0')
  simulationResult.balanceChanges.willPayFee.push({ balance: fee })
}
