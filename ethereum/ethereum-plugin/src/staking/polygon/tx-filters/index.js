export const txFiltersFactory = ({ contracts, methodIds }) => {
  const isAssetTx = ({ coinName }) => coinName === 'polygon'
  const isDelegateTx = (tx) =>
    isAssetTx(tx) &&
    tx.to === contracts.STAKING_MANAGER_ADDR &&
    tx.data?.methodId === methodIds.DELEGATE
  const isUndelegateTx = (tx) =>
    isAssetTx(tx) &&
    tx.from[0] === contracts.STAKING_MANAGER_ADDR &&
    tx.data?.methodId === methodIds.UNDELEGATE
  const isRewardTx = (tx) =>
    isAssetTx(tx) &&
    tx.from[0] === contracts.STAKING_MANAGER_ADDR &&
    tx.data?.methodId === methodIds.CLAIM_REWARD
  const isClaimUndelegateTx = (tx) =>
    isAssetTx(tx) &&
    tx.from[0] === contracts.STAKING_MANAGER_ADDR &&
    tx.data?.methodId === methodIds.CLAIM_UNDELEGATE

  const isStakingTx = (tx) => tx.to === contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR

  const getStakingTxLogFilter = (tx) =>
    isDelegateTx(tx) || isClaimUndelegateTx(tx) || isUndelegateTx(tx)

  return {
    isAssetTx,
    isStakingTx,
    isDelegateTx,
    isUndelegateTx,
    isClaimUndelegateTx,
    isRewardTx,
    getStakingTxLogFilter,
  }
}
