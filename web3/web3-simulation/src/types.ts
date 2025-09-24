import type {
  EthAggregatedTransactionSimulationResult,
  EthSimulateTransactionParams,
} from '@exodus/web3-ethereum-utils'
import type {
  SolAggregatedTransactionSimulationResult,
  SolSimulateTransactionParams,
} from '@exodus/web3-solana-utils'
import type { ScanDomainsFn } from '@exodus/web3-types'

export type SimulationServiceFn = {
  scanDomains: ScanDomainsFn
  simulateEthereumTransactions: (
    params: EthSimulateTransactionParams,
  ) => Promise<EthAggregatedTransactionSimulationResult>
  simulateSolanaTransactions: (
    params: SolSimulateTransactionParams,
  ) => Promise<SolAggregatedTransactionSimulationResult>
}
