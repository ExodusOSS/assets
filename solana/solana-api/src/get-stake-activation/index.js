import { getStakeActivatingAndDeactivating } from './delegation.js'

const SYSVAR_STAKE_HISTORY_ADDRESS = 'SysvarStakeHistory1111111111111111111111111'

// Extracted from https://github.com/anza-xyz/solana-rpc-client-extensions/blob/main/js/src/rpc.ts

export async function getStakeActivation(api, stakeAddress) {
  const [epoch, stakeAccount, stakeHistory] = await Promise.all([
    api.getEpochInfo(),
    (async () => {
      const stakeAccount = await api.getAccountInfo(stakeAddress)
      if (!stakeAccount) return null
      if (stakeAccount.data.discriminant === 0) {
        throw new Error('data.discriminant is 0')
      }

      return stakeAccount
    })(),
    (async () => {
      return api.getAccountInfo(SYSVAR_STAKE_HISTORY_ADDRESS)
    })(),
  ])

  if (!stakeAccount) {
    return {
      status: 'inactive',
      active: 0,
      inactive: 0,
    }
  }

  const rentExemptReserve = stakeAccount.data.parsed.info.meta.rentExemptReserve
  if (stakeAccount.data.parsed.discriminant === 1) {
    return {
      status: 'inactive',
      active: 0,
      inactive: stakeAccount.lamports - rentExemptReserve,
    }
  }

  // THE HARD PART
  const { effective, activating, deactivating } = stakeAccount.data.parsed.info.stake
    ? getStakeActivatingAndDeactivating(
        stakeAccount.data.parsed.info.stake.delegation,
        epoch,
        stakeHistory.data.parsed.info
      )
    : {
        effective: 0,
        activating: 0,
        deactivating: 0,
      }

  let status
  if (deactivating > 0) {
    status = 'deactivating'
  } else if (activating > 0) {
    status = 'activating'
  } else if (effective > 0) {
    status = 'active'
  } else {
    status = 'inactive'
  }

  const inactive = stakeAccount.lamports - effective - rentExemptReserve

  return {
    status,
    active: effective,
    inactive,
  }
}
