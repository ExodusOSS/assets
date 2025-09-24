import { getUnconfirmedSentBalance } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'

import { getUnconfirmedTxAncestorMap } from './unconfirmed-ancestor-data.js'
import {
  getConfirmedOrRfbDisabledUtxos,
  getUnconfirmedUtxos,
  getUsableUtxos,
  getUtxos,
} from './utxos-utils.js'

export const getBalancesFactory = ({
  feeData: defaultFeeData,
  allowUnconfirmedRbfEnabledUtxos,
}) => {
  assert(defaultFeeData, 'default feeData is required')
  assert(
    typeof allowUnconfirmedRbfEnabledUtxos === 'boolean',
    'allowUnconfirmedRbfEnabledUtxos is required'
  )

  return ({ asset, accountState, txLog, feeData = defaultFeeData }) => {
    assert(asset, 'asset is required')
    assert(accountState, 'accountState is required')
    assert(txLog, 'txLog is required')
    assert(feeData, 'feeData is required')

    const utxos = getUtxos({ asset, accountState })
    const balance = utxos.value

    const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({ accountState })

    const usableUtxos = getUsableUtxos({
      asset,
      utxos,
      feeData,
      txSet: txLog,
      unconfirmedTxAncestor,
    })

    const spendableUtxos = getConfirmedOrRfbDisabledUtxos({
      asset,
      utxos: usableUtxos,
      allowUnconfirmedRbfEnabledUtxos,
    })

    const spendableBalance = spendableUtxos.value

    const unconfirmedUtxos = getUnconfirmedUtxos({ utxos })
    const unconfirmedSent = getUnconfirmedSentBalance({ asset, txLog })
    return {
      total: balance,
      spendable: spendableBalance,
      unconfirmedReceived: unconfirmedUtxos.value,
      unconfirmedSent,
      // legacy
      balance,
      spendableBalance,
    }
  }
}
