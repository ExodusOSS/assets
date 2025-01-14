export const stakingAccountState = ({ currency }) => ({
  isDelegating: false,
  isUndelegateInProgress: false,
  canClaimUndelegatedBalance: false,
  minRewardsToWithdraw: currency.defaultUnit(1),
  minDelegateAmount: currency.defaultUnit(1),
  unclaimedUndelegatedBalance: currency.ZERO,
  delegatedBalance: currency.ZERO,
  rewardsBalance: currency.ZERO,
  withdrawable: currency.ZERO,
  unbondNonce: '0',
})
