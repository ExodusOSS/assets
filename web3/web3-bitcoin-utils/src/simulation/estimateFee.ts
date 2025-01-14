import { calculateInputs, calculateOutputs } from './common.js'

import type { BtcAggregatedTransactionSimulationResult } from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Asset } from '@exodus/web3-types'

export const estimateFee = ({
  asset,
  inputIndexesToSign,
  psbt,
  simulationResult,
}: {
  asset: Asset
  inputIndexesToSign: Array<number>
  psbt: Psbt
  simulationResult: BtcAggregatedTransactionSimulationResult
}): void => {
  const inputAmount = calculateInputs({ psbt, inputIndexesToSign })
  const outputAmount = calculateOutputs({ psbt })

  const diff = inputAmount.sub(outputAmount)
  const fee = asset.currency.baseUnit(diff.gtn(0) ? diff.toString() : '0')
  simulationResult.balanceChanges.willPayFee.push({ balance: fee })
}
