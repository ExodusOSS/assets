import { BumpType } from '@exodus/bitcoin-lib'
import assert from 'minimalistic-assert'

import { findUnconfirmedSentRbfTxs } from '../tx-utils.js'
import { getUnconfirmedTxAncestorMap } from '../unconfirmed-ancestor-data.js'
import { getUsableUtxos, getUtxos, isUtxoConfirmed } from '../utxos-utils.js'
import { selectUtxos } from './utxo-selector.js'

export const ASSET_NAMES = ['bitcoin', 'bitcoinregtest', 'bitcointestnet']

// Copied over from bitcion-lib, to eventually replace it
const _canBumpTx = ({
  asset,
  tx,
  txSet,
  accountState,
  feeData,
  getFeeEstimator,
  allowUnconfirmedRbfEnabledUtxos,
  utxosDescendingOrder,
  taprootInputWitnessSize,
  changeAddressType,
}) => {
  assert(asset, 'asset must be provided')
  assert(tx, 'tx must be provided')
  assert(asset.name === tx.coinName, `asset must be ${tx.coinName}`)
  assert(txSet, 'txSet must be provided')
  assert(accountState, 'accountState must be provided')
  assert(feeData, 'feeData must be provided')
  assert(getFeeEstimator, 'getFeeEstimator must be provided')
  // Only bump bitcoin txs for now
  if (!ASSET_NAMES.includes(tx.coinName)) return { errorMessage: 'asset does not support bumping' }
  if (tx.received) return { errorMessage: 'must be spent, not received' }
  if (!tx.data) return { errorMessage: 'insufficient data' }
  if (!tx.pending) return { errorMessage: 'already confirmed' }

  const feeRate = feeData.feePerKB
  const rbfBumpFeeBlocks = validateIsNumber(feeData.rbfBumpFeeBlocks, 'rbfBumpFeeBlocks')
  const rbfBumpFeeThreshold = validateIsNumber(feeData.rbfBumpFeeThreshold, 'rbfBumpFeeThreshold')

  // Allow bumping if tx hasn't confirmed in rbfBumpFeeBlocks
  // Or the tx fee is below nextBlockMinimumFee if exists
  // Or the tx fee is below rbfBumpFeeThreshold * the current fee estimate
  if (tx.data.blocksSeen < rbfBumpFeeBlocks) {
    const feePerKB = tx.data.feePerKB ? asset.currency.baseUnit(tx.data.feePerKB) : undefined
    if (!feePerKB) {
      return { errorMessage: 'fee rate is high enough' }
    }

    if (feeData.nextBlockMinimumFee) {
      if (feePerKB.gt(feeData.nextBlockMinimumFee.mul(1e3))) {
        return { errorMessage: 'fee rate is high enough' }
      }
    } else if (feePerKB.gt(feeRate.mul(rbfBumpFeeThreshold))) {
      return { errorMessage: 'fee rate is high enough' }
    }
  }

  const utxos = getUtxos({ accountState, asset })
  const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({ accountState })
  const usableUtxos = getUsableUtxos({
    asset,
    utxos,
    feeData,
    txSet,
    allowUnconfirmedRbfEnabledUtxos,
    unconfirmedTxAncestor,
  })
  if (usableUtxos.value.isZero) return { errorMessage: 'insufficient funds' }

  const { txId } = tx
  const replaceableTxs = findUnconfirmedSentRbfTxs(txSet)
  const bumpTx = replaceableTxs.find((tx) => tx.txId === txId)
  const changeUtxos = usableUtxos.getTxIdUtxos(txId)

  // Can't bump a non-rbf tx with no change
  if (!bumpTx && changeUtxos.size === 0) return { errorMessage: 'no change' }
  // Can't bump a confirmed tx
  if (!bumpTx && changeUtxos.toArray().every(isUtxoConfirmed))
    return { errorMessage: 'already confirmed' }
  // Can't bump an rbf tx if change is already spent
  if (bumpTx && bumpTx.data.changeAddress && changeUtxos.size === 0)
    return {
      errorMessage: 'already spent',
    }

  if (bumpTx) {
    const { replaceTx, fee } = selectUtxos({
      asset,
      usableUtxos,
      replaceableTxs: [bumpTx],
      feeRate,
      receiveAddress: null,
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      unconfirmedTxAncestor,
      utxosDescendingOrder,
      taprootInputWitnessSize,
      changeAddressType,
    })
    if (replaceTx) return { bumpType: BumpType.RBF, bumpFee: fee.sub(replaceTx.feeAmount) }
  }

  const { fee } = selectUtxos({
    asset,
    usableUtxos,
    feeRate,
    receiveAddress: changeAddressType,
    getFeeEstimator,
    mustSpendUtxos: changeUtxos,
    allowUnconfirmedRbfEnabledUtxos,
    unconfirmedTxAncestor,
    utxosDescendingOrder,
    taprootInputWitnessSize,
    changeAddressType,
  })

  return fee ? { bumpType: BumpType.CPFP, bumpFee: fee } : { errorMessage: 'insufficient funds' }
}

const validateIsNumber = (number, name) => {
  assert(typeof number === 'number' && !Number.isNaN(number), `${name} must be a number`)
  return number
}

const wrapResponseToObject = ({ bumpType = BumpType.NONE, bumpFee, errorMessage = null } = {}) => ({
  bumpType,
  bumpFee,
  errorMessage,
})

export const canBumpTx = (opts) => wrapResponseToObject(_canBumpTx(opts))
