export const getStakingInfo = (stakingInfo) => {
  return {
    loaded: stakingInfo.loaded,
    staking: stakingInfo.staking,
    isDelegating: stakingInfo.isDelegating,
    locked: stakingInfo.locked,
    activating: stakingInfo.activating,
    withdrawable: stakingInfo.withdrawable,
    pending: stakingInfo.pending,
    accounts: stakingInfo.accounts,
    earned: stakingInfo.earned,
  }
}
