// The code below was inspired by `bitcoinjs-lib` fee calculation logic.
// https://github.com/bitcoinjs/bitcoinjs-lib/blob/b5fd4d644c4b7a9dfc6f6fd4046626c37596241b/ts_src/psbt.ts#L2040-L2052

import { Transaction } from '@exodus/bitcoinjs'
import BN from 'bn.js'

import type { Inscription, RawTransaction } from '../types.js'
import type { Psbt } from '@exodus/bitcoinjs'
import type { Asset } from '@exodus/web3-types'
import type { PsbtInput } from 'bip174/src/lib/interfaces.js'

export function getTxId({ input }: { input: PsbtInput }): string | null {
  if (input.nonWitnessUtxo) {
    const nwTx = Transaction.fromBuffer(input.nonWitnessUtxo)
    return nwTx.getId()
  }
  return null
}

export function getInscriptionsDataFromInput({
  currency,
  psbt,
  inputIdx,
  txObjectsMap,
}: {
  currency: Asset['currency']
  psbt: Psbt
  inputIdx: number
  txObjectsMap: Map<string, RawTransaction>
}): { value: number; inscriptions: Inscription[] } | null {
  const input = psbt.data.inputs[inputIdx]
  if (input.nonWitnessUtxo) {
    const nwTx = Transaction.fromBuffer(input.nonWitnessUtxo)
    const vout = psbt.txInputs[inputIdx].index
    const tx = txObjectsMap.get(nwTx.getId())

    if (!tx?.vout?.[vout]) {
      return null
    }
    const value = currency.defaultUnit(tx.vout[vout].value).toBaseNumber()
    const inscriptions = tx.vout[vout].inscriptions || []
    return { value, inscriptions }
  }
  if (input.witnessUtxo) {
    return { value: input.witnessUtxo.value, inscriptions: [] }
  }
  return null
}

export function getInputValue({
  psbt,
  inputIdx,
  input,
}: {
  psbt: Psbt
  inputIdx: number
  input: PsbtInput
}): BN | null {
  if (input.witnessUtxo) {
    return new BN(input.witnessUtxo.value)
  } else if (input.nonWitnessUtxo) {
    const nwTx = Transaction.fromBuffer(input.nonWitnessUtxo)
    const vout = psbt.txInputs[inputIdx].index
    const out = nwTx.outs[vout]
    return new BN(out.value)
  }

  return null
}

// If `inputsToSign` provided then calculating only certain inputs.
export function calculateInputs({
  psbt,
  inputIndexesToSign,
}: {
  psbt: Psbt
  inputIndexesToSign?: Array<number>
}): BN {
  const inputAmount = new BN(0)
  psbt.data.inputs.forEach((input, inputIdx) => {
    if (inputIndexesToSign && !inputIndexesToSign.includes(inputIdx)) {
      return
    }
    const value = getInputValue({ psbt, inputIdx, input })
    if (value !== null) {
      inputAmount.iadd(value)
    }
  })

  return inputAmount
}

// If `addresses` provided then calculating only outputs that belong to those addresses.
export function calculateOutputs({
  psbt,
  addresses,
}: {
  psbt: Psbt
  addresses?: Record<string, boolean>
}): BN | never {
  return psbt.txOutputs.reduce((total, o) => {
    if (!addresses) {
      return total.iadd(new BN(o.value))
    }

    if (addresses[o.address!]) {
      return total.iadd(new BN(o.value))
    }

    return total
  }, new BN(0))
}
