import assert from 'minimalistic-assert'

import { findUnconfirmedSentRbfTxs } from '../tx-utils.js'
import { getUnconfirmedTxAncestorMap } from '../unconfirmed-ancestor-data.js'
import {
  getInscriptionIds,
  getOrdinalsUtxos,
  getTransferOrdinalsUtxos,
  getUsableUtxos,
  getUtxos,
} from '../utxos-utils.js'
import { canBumpTx } from './can-bump-tx.js'
import { getUtxosData } from './utxo-selector.js'

export class GetFeeResolver {
  #getFeeEstimator
  #allowUnconfirmedRbfEnabledUtxos
  #utxosDescendingOrder
  #changeAddressType

  constructor({
    getFeeEstimator,
    allowUnconfirmedRbfEnabledUtxos,
    utxosDescendingOrder,
    changeAddressType,
  }) {
    assert(getFeeEstimator, 'getFeeEstimator must be provided')
    this.#getFeeEstimator = (asset, { feePerKB, ...options }) =>
      getFeeEstimator(asset, feePerKB, options)
    this.#allowUnconfirmedRbfEnabledUtxos = allowUnconfirmedRbfEnabledUtxos
    this.#utxosDescendingOrder = utxosDescendingOrder
    this.#changeAddressType = changeAddressType
  }

  getFee = ({
    asset,
    accountState,
    txSet,
    feeData,
    amount,
    customFee,
    isSendAll,
    nft, // sending one nft
    brc20, // sending multiple inscriptions ids (as in sending multiple transfer ordinals)
    receiveAddress,
    taprootInputWitnessSize,
  }) => {
    if (nft) {
      assert(!amount, 'amount must not be provided when nft is provided!!!')
      assert(!isSendAll, 'isSendAll must not be provided when nft is provided!!!')
      assert(!brc20, 'brc20 must not be provided when nft is provided!!!')
    }

    if (brc20) {
      // assert(!amount, 'amount must not be provided when brc20 is provided!!!')
      assert(!isSendAll, 'isSendAll must not be provided when brc20 is provided!!!')
      assert(!nft, 'nft must not be provided when brc20 is provided!!!')
    }

    const inscriptionIds = getInscriptionIds({ nft, brc20 })

    const { fee, unspendableFee, extraFeeData } = this.#getUtxosData({
      asset,
      accountState,
      txSet,
      feeData,
      receiveAddress,
      amount: brc20 ? undefined : amount,
      customFee,
      isSendAll,
      inscriptionIds,
      taprootInputWitnessSize,
    })
    return { fee, unspendableFee, extraFeeData }
  }

  getAvailableBalance = ({
    asset,
    accountState,
    txSet,
    feeData,
    amount,
    customFee,
    isSendAll,
    taprootInputWitnessSize,
  }) => {
    return this.#getUtxosData({
      asset,
      accountState,
      txSet,
      feeData,
      customFee,
      isSendAll,
      amount,
      taprootInputWitnessSize,
    }).availableBalance
  }

  getSpendableBalance = ({ asset, accountState, txSet, feeData, taprootInputWitnessSize }) => {
    return this.#getUtxosData({
      asset,
      accountState,
      txSet,
      feeData,
      isSendAll: true,
      taprootInputWitnessSize,
    }).spendableBalance
  }

  #getUtxosData = ({
    asset,
    accountState,
    txSet,
    feeData,
    receiveAddress,
    amount,
    customFee,
    isSendAll,
    inscriptionIds,
    taprootInputWitnessSize,
  }) => {
    assert(asset, 'asset must be provided')
    assert(feeData, 'feeData must be provided')
    assert(customFee || feeData.feePerKB, 'feePerKB must be provided')
    assert(accountState, 'accountState must be provided')
    assert(txSet, 'txSet must be provided')

    const utxos = getUtxos({ accountState, asset })
    const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({ accountState })

    const ordinalsUtxos = getOrdinalsUtxos({ accountState, asset })

    const transferOrdinalsUtxos = inscriptionIds
      ? getTransferOrdinalsUtxos({ inscriptionIds, ordinalsUtxos })
      : undefined

    const usableUtxos = getUsableUtxos({
      asset,
      utxos,
      feeData,
      txSet,
      unconfirmedTxAncestor,
    })
    const replaceableTxs = findUnconfirmedSentRbfTxs(txSet)

    const feePerKB = customFee || feeData.feePerKB
    return getUtxosData({
      asset,
      usableUtxos,
      replaceableTxs,
      amount,
      feeRate: feePerKB,
      receiveAddress,
      transferOrdinalsUtxos,
      inscriptionIds,
      isSendAll,
      getFeeEstimator: this.#getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos: this.#allowUnconfirmedRbfEnabledUtxos,
      unconfirmedTxAncestor,
      utxosDescendingOrder: this.#utxosDescendingOrder,
      taprootInputWitnessSize,
      changeAddressType: this.#changeAddressType,
    })
  }

  canBumpTx = ({ asset, tx, txSet, accountState, feeData, taprootInputWitnessSize }) => {
    return canBumpTx({
      asset,
      tx,
      txSet,
      accountState,
      feeData,
      getFeeEstimator: this.#getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos: this.#allowUnconfirmedRbfEnabledUtxos,
      utxosDescendingOrder: this.#utxosDescendingOrder,
      taprootInputWitnessSize,
      changeAddressType: this.#changeAddressType,
    })
  }
}
