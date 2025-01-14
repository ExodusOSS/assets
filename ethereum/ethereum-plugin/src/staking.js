import { ethStakeAccountState } from '@exodus/ethereum-lib'
import { asset } from '@exodus/ethereum-meta'

import { polygonStakingConfig, polygonStakingDeps } from './staking/polygon/index.js'

export const stakingConfiguration = {
  ethereum: { accountStateExtraData: ethStakeAccountState(asset) },
  polygon: polygonStakingConfig,
}

export const stakingDependencies = {
  polygon: polygonStakingDeps,
}
