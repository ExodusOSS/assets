import assert from 'minimalistic-assert'

export const getBalanceFromTxLog = ({ asset, txLog }) => {
  assert(asset, 'asset is required')
  assert(txLog, 'txLog is required')
  return txLog.size > 0 ? txLog.getMutations().slice(-1)[0].balance : asset.currency.ZERO
}

export const getBalanceFromAccountState = ({ asset, accountState }) => {
  assert(accountState, 'accountState is required')
  assert(asset, 'asset is required')
  const isBase = asset.name === asset.baseAsset.name
  if (isBase) {
    return accountState?.balance || asset.currency.ZERO
  }

  return accountState?.tokenBalances?.[asset.name] || asset.currency.ZERO
}

const getUnconfirmedBalance = ({ asset, txLog, sent, received }) => {
  assert(sent || received, 'At least sent: true or received: true must be provided')
  let result = asset.currency.ZERO

  for (const tx of txLog) {
    const isSent = tx.sent
    const isUnconfirmed = !tx.failed && tx.pending

    if (isUnconfirmed && ((isSent && sent) || (!isSent && received))) {
      result = result.add(tx.coinAmount.abs())

      if (tx.feeAmount && isSent && sent && tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        result = result.add(tx.feeAmount.abs())
      }
    }
  }

  return result
}

export const getUnconfirmedReceivedBalance = ({ asset, txLog }) => {
  assert(asset, 'asset is required')
  assert(txLog, 'txLog is required')
  return getUnconfirmedBalance({ asset, txLog, received: true })
}

export const getUnconfirmedSentBalance = ({ asset, txLog }) => {
  assert(asset, 'asset is required')
  assert(txLog, 'txLog is required')
  return getUnconfirmedBalance({ asset, txLog, sent: true })
}

export const fixBalance = ({ txLog, balance }) => {
  assert(txLog, 'txLog is required')
  assert(balance, 'balance is required')
  for (const tx of txLog) {
    // TODO: pending can only be less than a few minutes old, we can only search the latest txs to improve performance
    if (tx.sent && tx.pending && !tx.error) {
      // coinAmount is negative for sent tx
      balance = balance.sub(tx.coinAmount.abs())
      if (tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        balance = balance.sub(tx.feeAmount)
      }
    }
  }

  return balance
}

/*
 * Generic asset.api.getBalances for simple account state based assets
 */
export const getBalancesFromAccountStateFactory =
  ({
    shouldFixBalance = false,
    getFrozenBalances = () => ({}),
    getOtherBalances = () => ({}),
  } = {}) =>
  ({ accountState, asset, txLog }) => {
    const unconfirmedReceived = getUnconfirmedReceivedBalance({ asset, txLog })
    const unconfirmedSent = getUnconfirmedSentBalance({ asset, txLog })
    const balance = getBalanceFromAccountState({ accountState, asset })
    const total = shouldFixBalance ? fixBalance({ txLog, balance }) : balance

    const basicBalances = {
      total,
      unconfirmedReceived,
      unconfirmedSent,
    }

    const frozenBalances =
      getFrozenBalances({ asset, accountState, txLog, balances: { ...basicBalances, balance } }) ||
      {}
    const frozen = Object.values(frozenBalances).reduce((a, b) => a.add(b), asset.currency.ZERO)
    const spendable = total.sub(unconfirmedReceived).sub(frozen).clampLowerZero()

    const balances = {
      ...basicBalances,
      spendable,
      ...frozenBalances,
      frozen,
    }

    const otherBalances =
      getOtherBalances({ asset, accountState, txLog, balances: { ...balances, balance } }) || {}

    return {
      ...balances,
      ...otherBalances,
    }
  }
