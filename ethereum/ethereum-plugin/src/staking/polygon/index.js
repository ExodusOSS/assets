import { tokens } from '@exodus/ethereum-meta'

import { stakingAccountState } from './account-state.js'
import { stakingServerFactory } from './api.js'
import { mainnetContracts, methodIds } from './contracts/index.js'
import { stakingServiceFactory } from './service.js'
import { txUtilsFactory } from './staking-utils.js'

const polygon = tokens.find(({ name: tokenName }) => tokenName === 'polygon')

export const polygonStakingConfig = {
  accountStateExtraData: stakingAccountState(polygon),
  features: {
    stake: true,
    unstake: true,
    claimUnstaked: true,
    claimRewards: true,
  },
  contracts: mainnetContracts,
  methodIds,
}

export const polygonStakingDeps = {
  txUtilsFactory,
  stakingServiceFactory,
  stakingServerFactory,
}
