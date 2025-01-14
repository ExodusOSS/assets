import { createSimulateTransactions } from './createSimulateTransactions.js'

export const createWeb3API = (deps) => {
  return {
    simulateTransactions: createSimulateTransactions(deps),
  }
}
