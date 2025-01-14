/**
 * Generates pending Fee for stake-able asset
 * @param {Object} stakingInfo solana staking information object
 * @param {Object} fee solana asset fee
 *
 */
export const getSolStakedFee = ({ asset, stakingInfo, fee }) => {
  const { currency } = asset
  const { accounts } = stakingInfo

  const allPending = Object.entries(accounts).length
  return allPending > 0 ? fee.mul(allPending) : currency.ZERO
}

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

export const getUnstakingFee = ({ asset, fee, accountState }) => {
  const stakingInfo = getStakingInfo(accountState.stakingInfo ?? {})
  return getSolStakedFee({ asset, stakingInfo, fee })
}
