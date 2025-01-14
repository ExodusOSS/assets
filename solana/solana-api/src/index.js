import { connectAssets } from '@exodus/assets'
import { keyBy } from '@exodus/basic-utils'
import assetsList from '@exodus/solana-meta'

import { Api } from './api.js'

export { SolanaMonitor, SolanaAutoWithdrawMonitor } from './tx-log/index.js'
export { createAccountState } from './account-state.js'
export { getSolStakedFee, getStakingInfo, getUnstakingFee } from './staking-utils.js'
export {
  isSolanaStaking,
  isSolanaUnstaking,
  isSolanaWithdrawn,
  isSolanaRewardsActivityTx,
} from './txs-utils.js'
export { createAndBroadcastTXFactory } from './tx-send.js'
export { getBalancesFactory } from './get-balances.js'
export { stakingProviderClientFactory } from './staking-provider-client.js'

// These are not the same asset objects as the wallet creates, so they should never be returned to the wallet.
// Initially this may be violated by the Solana code until the first monitor tick updates assets with setTokens()
const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))

// At some point we would like to exclude this export. Default export should be the whole asset "plugin" ready to be injected.
// Clients should not call an specific server api directly.
const serverApi = new Api({ assets })
export default serverApi

export { Api } from './api.js'
