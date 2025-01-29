import { TxSet } from '@exodus/models'

// staking may be a feature that may not be available for a given wallet.
// In this case, The wallet should exclude the staking balance from the general balance

export const getBalancesFactory =
  ({ stakingFeatureAvailable }) =>
  ({ asset, accountState, txLog }) => {
    const zero = asset.currency.ZERO
    const { balance, locked, withdrawable, pending } = fixBalances({
      txLog,
      balance: getBalanceFromAccountState({ asset, accountState }),
      locked: accountState.stakingInfo?.locked || zero,
      withdrawable: accountState.stakingInfo?.withdrawable || zero,
      pending: accountState.stakingInfo?.pending || zero,
      asset,
    })
    if (asset.baseAsset.name !== asset.name) {
      return {
        // legacy
        balance,
        spendableBalance: balance,
        // new
        total: balance,
        spendable: balance,
      }
    }

    const balanceWithoutStaking = balance
      .sub(locked)
      .sub(withdrawable)
      .sub(pending)
      .clampLowerZero()

    const total = stakingFeatureAvailable ? balance : balanceWithoutStaking

    const networkReserve = accountState.rentExemptAmount || zero

    const accountReserve = asset.accountReserve || zero

    // there is no wallet reserve when there are no tokens nor staking actions. Just network reserve for the rent exempt amount.
    const walletReserve =
      hasStakedFunds({ locked, withdrawable, pending }) || hasTokensBalance({ accountState })
        ? accountReserve.sub(networkReserve).clampLowerZero()
        : zero

    const spendable = balanceWithoutStaking.sub(walletReserve).sub(networkReserve).clampLowerZero()

    // leave enough amount for accountReserve if it's not reserved already
    const stakeable = walletReserve.isZero ? spendable.sub(accountReserve) : spendable

    const staked = locked
    const unstaking = pending

    const staking = accountState.activating || zero

    return {
      // legacy
      balance: total,
      spendableBalance: spendable,
      // new
      total,
      spendable,
      stakeable,
      staked,
      staking,
      unstaking,
      networkReserve,
      walletReserve,
    }
  }

const fixBalances = ({ txLog = TxSet.EMPTY, balance, locked, withdrawable, pending, asset }) => {
  for (const tx of txLog) {
    if ((tx.sent || tx.data.staking) && tx.pending && !tx.error) {
      if (tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        balance = balance.sub(tx.feeAmount)
      }

      if (tx.data.staking) {
        // staking tx
        switch (tx.data.staking?.method) {
          case 'delegate':
            locked = locked.add(tx.coinAmount.abs())
            break
          case 'withdraw':
            withdrawable = asset.currency.ZERO
            break
          case 'undelegate':
            pending = pending.add(locked)
            locked = asset.currency.ZERO
            break
        }
      } else {
        // coinAmount is negative for sent tx
        balance = balance.sub(tx.coinAmount.abs())
      }
    }
  }

  return {
    balance: balance.clampLowerZero(),
    locked: locked.clampLowerZero(),
    withdrawable: withdrawable.clampLowerZero(),
    pending: pending.clampLowerZero(),
  }
}

const getBalanceFromAccountState = ({ asset, accountState }) => {
  const isBase = asset.name === asset.baseAsset.name
  return (
    (isBase ? accountState?.balance : accountState?.tokenBalances?.[asset.name]) ||
    asset.currency.ZERO
  )
}

const hasStakedFunds = ({ locked, withdrawable, pending }) =>
  [locked, withdrawable, pending].some((amount) => amount.isPositive)

const hasTokensBalance = ({ accountState }) =>
  Object.values(accountState?.tokenBalances || {}).some((balance) => balance.isPositive)
