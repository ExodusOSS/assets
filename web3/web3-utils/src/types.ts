import type {
  Asset,
  BalanceChanges,
  NumberUnit,
  ScanTransactionsEvmRequest,
  ScanTransactionsSolanaRequest,
  ObjectWithDomainsPropertyOfTypeArray,
  ScanMessageEvmRequest,
} from '@exodus/web3-types'

interface BaseScanAPICallParams {
  url: string
  headers?: Record<string, string>
}

export interface DomainsScanAPICallParams extends BaseScanAPICallParams {
  payload: ObjectWithDomainsPropertyOfTypeArray
}

export interface TransactionScanAPICallParams extends BaseScanAPICallParams {
  chain: string
  network: string
  payload: ScanTransactionsEvmRequest | ScanTransactionsSolanaRequest
}

export interface MessageScanAPICallParams extends BaseScanAPICallParams {
  chain: string
  network: string
  payload: ScanMessageEvmRequest
}

export type SimulationAPICallParams =
  | TransactionScanAPICallParams
  | MessageScanAPICallParams
  | DomainsScanAPICallParams

export type CreateCurrencyParams = {
  amount: number | string
  base?: string
  denominator: number
  symbol: string
}

export { Asset, BalanceChanges, NumberUnit }
