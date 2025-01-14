/**
 * This utility adds information about each TX input and output, which can be displayed in the UI.
 **/
import { script } from '@exodus/bitcoinjs'

import { getInputValue } from './common.js'

import type {
  IndexToAddressRecord,
  BtcAggregatedTransactionSimulationResult,
} from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Asset } from '@exodus/web3-types'

// This is copied from https://github.com/bitcoinjs/bitcoinjs-lib/blob/45187a32d06349546ed91e4d813c7bc8eb385433/ts_src/bufferutils.ts#L38-L49.
export function reverseBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 1) {
    return buffer
  }
  let j = buffer.length - 1
  let tmp = 0
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i]
    buffer[i] = buffer[j]
    buffer[j] = tmp
    j--
  }
  return buffer
}

export function fillAdvancedDetails({
  addresses,
  asset,
  indexToAddressRecord,
  psbt,
  simulationResult,
}: {
  addresses: Record<string, boolean>
  asset: Asset
  psbt: Psbt
  indexToAddressRecord: IndexToAddressRecord
  simulationResult: BtcAggregatedTransactionSimulationResult
}): void {
  psbt.data.inputs.forEach((input, inputIdx) => {
    const value = getInputValue({ psbt, inputIdx, input })
    if (value !== null) {
      simulationResult.advancedDetails.inputs.push({
        txID: reverseBuffer(psbt.txInputs[inputIdx].hash).toString('hex'),
        index: psbt.txInputs[inputIdx].index,
        value: asset.currency.baseUnit(value.toString(10)),
        address: indexToAddressRecord[inputIdx]
          ? indexToAddressRecord[inputIdx].address
          : undefined,
      })
    }
  })

  psbt.txOutputs.forEach((output) => {
    simulationResult.advancedDetails.outputs.push({
      value: asset.currency.baseUnit(output.value),
      address: output.address
        ? output.address
        : script.toASM(script.decompile(output.script)!),
      isWalletAddress: output.address! in addresses,
    })
  })
}
