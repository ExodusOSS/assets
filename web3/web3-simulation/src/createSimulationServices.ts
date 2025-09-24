import { createSimulateTransactions as createEthSimulateTransactions } from '@exodus/web3-ethereum-utils'
import { createSimulateTransactions as createSolanaSimulateTransactions } from '@exodus/web3-solana-utils'
import { createScanDomains } from '@exodus/web3-utils'
import assert from 'minimalistic-assert'

import type { SimulationServiceFn } from './types.js'
import type {
  AssetClientInterface,
  CreateSimulationServiceParams,
} from '@exodus/web3-types'

const SIMULATION_HEADERS = {
  'X-Api-Version': '2023-06-05',
}
const SIMULATE_TRANSACTIONS_PATHNAME = '/simulate'
const SCAN_DOMAINS_PATHNAME = 'scan-domains'

export const createSimulationServices = ({
  apiBaseURL,
  scanDomainsPathName,
  headers = SIMULATION_HEADERS,
  assetClientInterface,
}: Partial<CreateSimulationServiceParams> & {
  assetClientInterface: AssetClientInterface
}): SimulationServiceFn => {
  assert(apiBaseURL, 'apiBaseURL is required')
  assert(assetClientInterface, 'assetClientInterface is required')

  const simulateTxsParams = {
    apiEndpoint: apiBaseURL + SIMULATE_TRANSACTIONS_PATHNAME,
    headers,
    assetClientInterface,
  }

  return {
    scanDomains: createScanDomains({
      url: encodeURI(
        `${apiBaseURL}/${
          scanDomainsPathName ? scanDomainsPathName : SCAN_DOMAINS_PATHNAME
        }`,
      ),
      headers,
    }),
    simulateEthereumTransactions:
      createEthSimulateTransactions(simulateTxsParams),
    simulateSolanaTransactions:
      createSolanaSimulateTransactions(simulateTxsParams),
  }
}
