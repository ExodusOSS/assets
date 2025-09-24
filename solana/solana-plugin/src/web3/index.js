import { createSimulateMessage } from '@exodus/web3-solana-utils'

import { createSimulateTransactions } from './createSimulateTransactions.js'

export const createWeb3API = (deps) => {
  return {
    simulateTransactions: createSimulateTransactions(deps),
    simulateMessage: createSimulateMessage(),
  }
}
