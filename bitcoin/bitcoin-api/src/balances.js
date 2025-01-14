import { getUnconfirmedSentBalance } from '@exodus/asset-lib'
import assert from 'minimalistic-assert'

import { getUnconfirmedUtxos, getUtxos } from './utxos-utils.js'

// known issue!! fee data is static here!
// Hydra's balances's module does not provide it when calling asset.api.getBalances
// https://github.com/ExodusMovement/exodus-hydra/blob/f9110f8e9e76b8b199bc4d40461cb1bed3a5be1e/modules/balances/module/index.js#L130
// feeData is required to know if an unconfirmed tx can or cannot be RBFed?
// This could be fixed once we allow all unconfirmed utxos to be RBFed or if we change the balance module to provide the feeData when calling asset.api.getBalances
export const getBalancesFactory = ({ feeData, getSpendableBalance, ordinalsEnabled }) => {
  assert(feeData, 'feeData is required')
  assert(getSpendableBalance, 'getSpendableBalance is required')
  return ({ asset, accountState, txLog }) => {
    assert(asset, 'asset is required')
    assert(accountState, 'accountState is required')
    assert(txLog, 'txLog is required')

    if (accountState.magicEdenApiFungibleBalances) {
      const validBalances = accountState.magicEdenApiFungibleBalances.filter(
        (fungibleBalance) => fungibleBalance.asset.ticker === asset.ticker
      )
      const parsedBalances = validBalances.map(({ balance }) =>
        asset.currency.defaultUnit(balance.balance)
      )
      const totalBalance = asset.currency.defaultUnit(
        parsedBalances.reduce((sum, item) => sum.add(item), asset.currency.ZERO)
      )
      return {
        total: totalBalance,
        // legacy
        balance: totalBalance,
      }
    }

    const utxos = getUtxos({ asset, accountState })
    const balance = utxos.value
    const spendableBalance = getSpendableBalance({
      asset,
      accountState,
      txSet: txLog,
      feeData,
    })

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
