import { TxSet } from '@exodus/models'

// staking may be a feature that may not be available for a given wallet.
// In this case, The wallet should exclude the staking balance from the general balance

export const getBalancesFactory =
  ({ stakingFeatureAvailable, allowSendingAll }) =>
  ({ asset, accountState, txLog }) => {
    const zero = asset.currency.ZERO

    const {
      balance,
      locked,
      activating,
      withdrawable,
      pending,
      unconfirmedSent,
      unconfirmedReceived,
    } = fixBalances({
      txLog,
      balance: getBalanceFromAccountState({ asset, accountState }),
      locked: accountState.stakingInfo?.locked || zero,
      withdrawable: accountState.stakingInfo?.withdrawable || zero,
      activating: accountState.stakingInfo?.activating || zero,
      pending: accountState.stakingInfo?.pending || zero,
      asset,
      unconfirmedSent: zero,
      unconfirmedReceived: zero,
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
      .sub(activating)
      .sub(withdrawable)
      .sub(pending)
      .clampLowerZero()

    const total = stakingFeatureAvailable ? balance : balanceWithoutStaking

    // there is no wallet reserve when there are no tokens nor staking actions. Just network reserve for the rent exempt amount.
    const needsReserve =
      hasStakedFunds({ locked, activating, withdrawable, pending }) ||
      hasTokensBalance({ accountState })

    const rentExemptAmountConditional =
      (accountState.accountSize > 0 ? accountState.rentExemptAmount : zero) || zero
    const networkReserve = allowSendingAll && !needsReserve ? zero : rentExemptAmountConditional

    const spendable = balanceWithoutStaking.sub(networkReserve).clampLowerZero()

    const stakeable = spendable

    const staked = locked
    const unstaked = withdrawable
    const unstaking = pending

    const staking = activating || zero

    return {
      // legacy
      balance: total,
      spendableBalance: spendable,
      // new
      total,
      spendable,
      stakeable,
      staked,
      unstaked,
      staking,
      unstaking,
      networkReserve,
      walletReserve: zero,
      unconfirmedSent,
      unconfirmedReceived,
    }
  }

const fixBalances = ({
  txLog = TxSet.EMPTY,
  balance,
  locked,
  withdrawable,
  activating,
  pending,
  asset,
  unconfirmedSent,
  unconfirmedReceived,
}) => {
  for (const tx of txLog) {
    if (!tx.pending || tx.error) {
      continue
    }

    if (tx.data.staking) {
      if (tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        unconfirmedSent = unconfirmedSent.add(tx.feeAmount)
      }

      // staking tx
      switch (tx.data.staking?.method) {
        case 'delegate':
          activating = activating.add(tx.coinAmount.abs())
          break
        case 'withdraw':
          withdrawable = asset.currency.ZERO
          break
        case 'undelegate':
          pending = pending.add(locked).add(activating)
          locked = asset.currency.ZERO
          activating = asset.currency.ZERO
          break
      }
    } else if (tx.sent) {
      if (tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        unconfirmedSent = unconfirmedSent.add(tx.feeAmount)
      }

      unconfirmedSent = unconfirmedSent.add(tx.coinAmount.abs())
    } else if (tx.received) {
      if (tx.coinAmount.unitType.equals(tx.feeAmount.unitType)) {
        unconfirmedReceived = unconfirmedReceived.sub(tx.feeAmount)
      }

      unconfirmedReceived = unconfirmedReceived.add(tx.coinAmount.abs())
    }
  }

  return {
    balance: balance.sub(unconfirmedSent).clampLowerZero(),
    locked: locked.clampLowerZero(),
    withdrawable: withdrawable.clampLowerZero(),
    activating: activating.clampLowerZero(),
    pending: pending.clampLowerZero(),
    unconfirmedSent,
    unconfirmedReceived,
  }
}

const getBalanceFromAccountState = ({ asset, accountState }) => {
  const isBase = asset.name === asset.baseAsset.name
  return (
    (isBase ? accountState?.balance : accountState?.tokenBalances?.[asset.name]) ||
    asset.currency.ZERO
  )
}

const hasStakedFunds = ({ locked, activating, withdrawable, pending }) =>
  [locked, activating, withdrawable, pending].some((amount) => amount.isPositive)

const hasTokensBalance = ({ accountState }) =>
  Object.values(accountState?.tokenBalances || {}).some((balance) => balance.isPositive)
