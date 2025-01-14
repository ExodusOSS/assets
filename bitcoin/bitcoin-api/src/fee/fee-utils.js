import { isNumberUnit, UnitType } from '@exodus/currency'
import { UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'

import { resolveExtraFeeOfTx } from '../unconfirmed-ancestor-data.js'
import { isUtxoConfirmed } from '../utxos-utils.js'

export const isHex = (s) => typeof s === 'string' && /[\da-f]*/.test(s.toLowerCase())

export function getExtraFee({ asset, inputs, feePerKB, unconfirmedTxAncestor }) {
  let extraFee = 0
  // Add extra fee to unconfirmed bitcoin utxos to allow transaction to CPFP ancestors
  if (
    ['bitcoin', 'bitcointestnet', 'bitcoinregtest'].includes(asset.name) &&
    (inputs instanceof UtxoCollection || !Array.isArray(inputs))
  ) {
    const feeRate = feePerKB.toBaseNumber() / 1000
    const utxos = [...inputs].filter((utxo) => !isUtxoConfirmed(utxo))
    const txIds = new Set(utxos.map(({ txId }) => txId))
    for (const txId of txIds) {
      extraFee += resolveExtraFeeOfTx({
        assetName: asset.name,
        feeRate,
        txId,
        unconfirmedTxAncestor,
      })
    }

    extraFee = Math.ceil(extraFee)
  }

  return extraFee
}

export default function createDefaultFeeEstimator(getSize) {
  return (asset, feePerKB, options = {}) => {
    return ({
      inputs = options.inputs,
      outputs = options.outputs,
      unconfirmedTxAncestor = options.unconfirmedTxAncestor,
      taprootInputWitnessSize,
    } = {}) => {
      const extraFee = getExtraFee({ asset, inputs, feePerKB, unconfirmedTxAncestor })
      // Yes, it's suppose to be '1000' and not '1024'
      // https://bitcoin.stackexchange.com/questions/24000/a-fee-is-added-per-kilobyte-of-data-that-means-1000-bytes-or-1024
      const size = getSize(asset, inputs, outputs, { ...options, taprootInputWitnessSize })
      const feeRaw = Math.ceil((feePerKB.toBaseNumber() * size) / 1000)
      return asset.currency.baseUnit(feeRaw + extraFee)
    }
  }
}

export function parseCurrency(val, currency) {
  assert(currency instanceof UnitType, 'Currency must be supples as a UnitType')

  if (isNumberUnit(val)) return val // TODO: consider checking if the unitType.equals(currency) (if currency is object)

  if (typeof val === 'string') return currency.parse(val)
  return currency.parse(val.value + ' ' + val.unit)
}

export function serializeCurrency(val, currency) {
  if (val === undefined) {
    return val
  }

  return parseCurrency(val, currency).toDefaultString({ unit: true })
}
