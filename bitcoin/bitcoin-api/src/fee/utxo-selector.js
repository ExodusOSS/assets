import NumberUnit from '@exodus/currency'
import { UtxoCollection } from '@exodus/models'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { getChangeDustValue } from '../dust.js'
import { getConfirmedOrRfbDisabledUtxos, getConfirmedUtxos } from '../utxos-utils.js'
import { getExtraFee } from './fee-utils.js'

const { sortBy } = lodash

const MIN_RELAY_FEE = 1000

const getBestReceiveAddresses = ({ asset, receiveAddress, inscriptionIds }) => {
  if (inscriptionIds) {
    return receiveAddress || 'P2TR'
  }

  if (receiveAddress === null) {
    return null
  }

  return ['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(asset.name) ? 'P2WSH' : 'P2PKH'
}

export const selectUtxos = ({
  asset,
  utxosDescendingOrder,
  usableUtxos,
  replaceableTxs,
  amount,
  feeRate,
  receiveAddress, // it could be null
  receiveAddresses = [],
  isSendAll,
  getFeeEstimator,
  disableReplacement = false,
  mustSpendUtxos,
  allowUnconfirmedRbfEnabledUtxos,
  unconfirmedTxAncestor,
  inscriptionIds, // for each inscription transfer, we need to calculate one more input and one more output
  transferOrdinalsUtxos, // to calculate the size of the input
  taprootInputWitnessSize,
  changeAddressType = 'P2PKH',
}) => {
  const resolvedReceiveAddresses = getBestReceiveAddresses({
    asset,
    receiveAddress,
    inscriptionIds,
  })

  if (inscriptionIds) {
    receiveAddresses.push(...inscriptionIds.map(() => resolvedReceiveAddresses))
  } else if (receiveAddresses.length === 0) {
    receiveAddresses.push(resolvedReceiveAddresses)
  }

  assert(asset, 'asset is required')
  assert(usableUtxos, 'usableUtxos is required')
  assert(getFeeEstimator, 'getFeeEstimator is required')

  const feeEstimator = getFeeEstimator(asset, { feePerKB: feeRate, unconfirmedTxAncestor })
  const { currency } = asset
  if (!amount) amount = currency.ZERO

  // We can only replace for a sendAll if only 1 replaceable tx and no unconfirmed utxos
  const confirmedUtxosArray = getConfirmedUtxos({ asset, utxos: usableUtxos }).toArray()
  const canReplace =
    !inscriptionIds &&
    !mustSpendUtxos &&
    !disableReplacement &&
    replaceableTxs &&
    (!isSendAll ||
      (replaceableTxs.length === 1 && confirmedUtxosArray.length === usableUtxos.size - 1))

  if (canReplace) {
    for (const tx of replaceableTxs) {
      const changeUtxos = usableUtxos.getTxIdUtxos(tx.txId)
      // Don't replace a tx that has already been spent
      if (tx.data.changeAddress && changeUtxos.size === 0) continue
      let feePerKB
      if (tx.data.feePerKB + MIN_RELAY_FEE > feeRate.toBaseNumber()) {
        feePerKB = new NumberUnit(tx.data.feePerKB + MIN_RELAY_FEE, asset.currency.baseUnit)
      } else {
        feePerKB = feeRate
      }

      const replaceFeeEstimator = getFeeEstimator(asset, { feePerKB, unconfirmedTxAncestor })
      // how to avoid replace tx inputs when inputs are ordinals? !!!!
      const inputs = UtxoCollection.fromJSON(tx.data.inputs, { currency })
      const outputs = isSendAll
        ? tx.data.sent.map(({ address }) => address)
        : [
            ...tx.data.sent.map(({ address }) => address),
            tx.data.changeAddress?.address || changeAddressType,
          ]
      if (receiveAddresses.some(Boolean)) outputs.push(...receiveAddresses)

      let fee
      let additionalUtxos
      const replaceTxAmount = changeUtxos.value.add(tx.feeAmount)

      if (isSendAll) {
        additionalUtxos = UtxoCollection.fromArray(confirmedUtxosArray, { currency })
        fee = replaceFeeEstimator({
          inputs: inputs.union(additionalUtxos),
          outputs,
          taprootInputWitnessSize,
        })
      } else {
        fee = replaceFeeEstimator({ inputs, outputs, taprootInputWitnessSize })
        additionalUtxos = UtxoCollection.createEmpty({ currency })
        while (replaceTxAmount.add(additionalUtxos.value).lt(amount.add(fee))) {
          if (confirmedUtxosArray.length === 0) {
            // Try estimating fee with no change
            if (replaceTxAmount.add(additionalUtxos.value).lt(amount.add(fee))) {
              const noChangeOutputs = [
                ...tx.data.sent.map(({ address }) => address),
                ...receiveAddresses,
              ]

              fee = replaceFeeEstimator({
                inputs: inputs.union(additionalUtxos),
                outputs: noChangeOutputs,
                taprootInputWitnessSize,
              })
            }

            break
          }

          // Add a new UTXO and recalculate the fee
          additionalUtxos = additionalUtxos.addUtxo(confirmedUtxosArray.shift())
          fee = replaceFeeEstimator({
            inputs: inputs.union(additionalUtxos),
            outputs,
            taprootInputWitnessSize,
          })
        }
      }

      if (isSendAll || replaceTxAmount.add(additionalUtxos.value).gte(amount.add(fee))) {
        const chainOutputs = isSendAll ? receiveAddresses : [...receiveAddresses, changeAddressType]
        const chainFee = feeEstimator({
          inputs: changeUtxos.union(additionalUtxos),
          outputs: chainOutputs,
          taprootInputWitnessSize,
        })
        // If batching is same or more expensive than chaining, don't replace
        // Unless we are accelerating a changeless tx, then we must replace because it can't be chained
        if ((!amount.isZero || tx.data.changeAddress) && fee.sub(tx.feeAmount).gte(chainFee)) {
          continue
        }

        return { selectedUtxos: additionalUtxos, fee, replaceTx: tx }
      }
    }
  }

  if (!mustSpendUtxos) mustSpendUtxos = UtxoCollection.createEmpty({ currency })

  // We can still spend our rbf utxos, but put them last
  let ourRbfUtxos = UtxoCollection.createEmpty({ currency })
  if (replaceableTxs) {
    for (const tx of replaceableTxs) {
      if (!tx.data.changeAddress) continue
      const changeUtxos = usableUtxos.getTxIdUtxos(tx.txId)
      ourRbfUtxos = ourRbfUtxos.union(changeUtxos)
    }
  }

  const spendableUtxos = getConfirmedOrRfbDisabledUtxos({
    asset,
    utxos: usableUtxos,
    allowUnconfirmedRbfEnabledUtxos,
  })

  const utxosArray = _toPriorityOrderedArray({
    utxosDescendingOrder,
    utxos: spendableUtxos.union(ourRbfUtxos),
  })

  if (isSendAll) {
    const selectedUtxos = UtxoCollection.fromArray(utxosArray, { currency })
    const fee = feeEstimator({
      inputs: selectedUtxos,
      outputs: receiveAddresses,
      taprootInputWitnessSize,
    })
    if (selectedUtxos.value.lt(amount.add(fee))) {
      return { fee }
    }

    return { selectedUtxos, fee }
  }

  // quickly add utxos to get to amount before starting to figure out fees, the minimum place to start is as much as the amount
  const selectedUtxosArray = mustSpendUtxos.toArray()
  let selectedUtxosValue = selectedUtxosArray.reduce(
    (total, utxo) => total.add(utxo.value),
    currency.ZERO
  )
  const remainingUtxosArray = _toPriorityOrderedArray({
    utxosDescendingOrder,
    utxos: spendableUtxos.union(ourRbfUtxos).difference(mustSpendUtxos),
  })

  while (selectedUtxosValue.lte(amount) && remainingUtxosArray.length > 0) {
    const newUtxo = remainingUtxosArray.shift()
    selectedUtxosArray.push(newUtxo)
    selectedUtxosValue = selectedUtxosValue.add(newUtxo.value)
  }

  let selectedUtxos = (transferOrdinalsUtxos || UtxoCollection.createEmpty({ currency })).union(
    UtxoCollection.fromArray(selectedUtxosArray, { currency })
  ) // extremelly important, orden must be kept!!! ordinals utxos go first!!!

  // start figuring out fees
  const outputs =
    amount.isZero && !inscriptionIds
      ? [changeAddressType]
      : [...receiveAddresses, changeAddressType]

  let fee = feeEstimator({ inputs: selectedUtxos, outputs, taprootInputWitnessSize })

  while (selectedUtxos.value.lt(amount.add(fee))) {
    // We ran out of UTXOs, give up now
    if (remainingUtxosArray.length === 0) {
      // Try fee with no change
      fee = feeEstimator({
        inputs: selectedUtxos,
        outputs: receiveAddresses,
        taprootInputWitnessSize,
      })
      break
    }

    // Add a new UTXO and recalculate the fee
    selectedUtxos = selectedUtxos.addUtxo(remainingUtxosArray.shift())
    fee = feeEstimator({ inputs: selectedUtxos, outputs, taprootInputWitnessSize })
  }

  if (selectedUtxos.value.lt(amount.add(fee))) {
    return { fee }
  }

  return { selectedUtxos, fee }
}

export const getUtxosData = ({
  asset,
  usableUtxos,
  replaceableTxs,
  amount,
  feeRate,
  receiveAddress,
  isSendAll,
  getFeeEstimator,
  disableReplacement,
  mustSpendUtxos,
  allowUnconfirmedRbfEnabledUtxos,
  inscriptionIds,
  transferOrdinalsUtxos,
  unconfirmedTxAncestor,
  utxosDescendingOrder,
  taprootInputWitnessSize,
  changeAddressType,
}) => {
  const {
    selectedUtxos,
    replaceTx,
    fee: unspendableFee,
  } = selectUtxos({
    asset,
    usableUtxos,
    replaceableTxs,
    amount,
    feeRate,
    receiveAddress,
    isSendAll,
    getFeeEstimator,
    disableReplacement,
    mustSpendUtxos,
    allowUnconfirmedRbfEnabledUtxos,
    unconfirmedTxAncestor,
    inscriptionIds,
    transferOrdinalsUtxos,
    utxosDescendingOrder,
    taprootInputWitnessSize,
    changeAddressType,
  })

  let fee = replaceTx ? unspendableFee.sub(replaceTx.feeAmount) : unspendableFee
  const empty = UtxoCollection.createEmpty({ currency: asset.currency })

  const replaceUtxos = replaceTx ? usableUtxos.getTxIdUtxos(replaceTx.txId) : empty

  const spendableUtxos = getConfirmedOrRfbDisabledUtxos({
    asset,
    utxos: usableUtxos,
    allowUnconfirmedRbfEnabledUtxos,
  }).union(replaceUtxos)

  const spendableBalance = spendableUtxos.value

  const extraFeeCpfp = selectedUtxos
    ? asset.currency.baseUnit(
        getExtraFee({
          asset,
          inputs: selectedUtxos,
          feePerKB: feeRate,
          unconfirmedTxAncestor,
        })
      )
    : asset.currency.ZERO

  const availableBalance = spendableBalance.sub(fee).clampLowerZero()

  const change =
    selectedUtxos?.size && amount
      ? selectedUtxos.union(replaceUtxos).value.sub(amount).sub(fee)
      : undefined

  const dust = getChangeDustValue(asset)

  let extraFeeDust = asset.currency.ZERO
  if (change && !change.isZero && change.lt(dust)) {
    fee = fee.add(change)
    extraFeeDust = change
  }

  let extraFeeData
  if (!extraFeeCpfp.isZero && !extraFeeDust.isZero) {
    extraFeeData = { type: 'cpfpdust', extraFee: extraFeeCpfp.add(extraFeeDust) }
  } else if (!extraFeeDust.isZero) {
    extraFeeData = { type: 'dust', extraFee: extraFeeDust }
  } else if (!extraFeeCpfp.isZero) {
    extraFeeData = { type: 'cpfp', extraFee: extraFeeCpfp }
  }

  return {
    spendableBalance,
    availableBalance,
    selectedUtxos,
    unspendableFee,
    fee,
    replaceTx,
    extraFeeData,
  }
}

/**
 * Replacing the `toPriorityOrderedArray` from @exodus/models
 * Adding the functionality to sort utxos by ascending / descending order
 */
const _toPriorityOrderedArray = ({ utxosDescendingOrder = false, utxos }) => {
  return sortBy(
    utxos.toArray(),
    (utxo) => !utxo.confirmations && utxo.rbfEnabled,
    (utxo) => !utxo.confirmations,
    (utxo) => utxo.value.toBaseNumber() * (utxosDescendingOrder ? -1 : 1)
  )
}
