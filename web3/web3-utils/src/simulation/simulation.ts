import { fetchival } from '@exodus/fetch'

import type {
  Asset,
  BalanceChanges,
  DomainsScanAPICallParams,
  SimulationAPICallParams,
} from '../types.js'
import type {
  AggregatedTransactionSimulationResult,
  CreateScanDomainsParams,
  ScanDomain200ResponseInner,
  ScanDomainsFn,
  ScanDomainsParams,
} from '@exodus/web3-types'

const createEmptyBalanceChanges = <
  FeeDetails,
>(): BalanceChanges<FeeDetails> => ({
  willSend: [],
  willApprove: [],
  willReceive: [],
  willPayFee: [],
})

export const createEmptySimulationResult = <FeeDetails, AdvancedDetails = []>({
  asset,
}: {
  asset: Asset
}): AggregatedTransactionSimulationResult<FeeDetails, AdvancedDetails> => {
  return {
    baseAssetName: asset.baseAssetName,
    balanceChanges: createEmptyBalanceChanges(),
    transactions: [],
    displayDetails: { warnings: [] },
    advancedDetails: [] as unknown as AdvancedDetails,
    warnings: [],
    metadata: {
      simulatedLocally: true,
    },
  }
}

export async function makeSimulationAPICall<
  ScanArguments extends SimulationAPICallParams,
  ScanResponse,
>(args: ScanArguments): Promise<ScanResponse | null> {
  const additionalParams =
    'network' in args && 'chain' in args
      ? { network: args.network, chain: args.chain }
      : {}

  try {
    const response = await fetchival(args.url, {
      method: 'POST',
      headers: {
        ...args.headers,
        'Content-Type': 'application/json',
      },
    }).post({
      ...additionalParams,
      serviceProvider: 'blowfish',
      ...args.payload,
    })

    return response
  } catch (error) {
    // ToDo: accept a logger dep and log the error
    return null
  }
}

export const createScanDomains =
  ({ url, headers }: CreateScanDomainsParams): ScanDomainsFn =>
  (domains: ScanDomainsParams) =>
    makeSimulationAPICall<
      DomainsScanAPICallParams,
      ScanDomain200ResponseInner[]
    >({
      url,
      headers,
      payload: { domains },
    })
