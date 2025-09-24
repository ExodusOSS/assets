import type { Deps as BaseProviderDeps } from '@exodus/web3-provider'
import type { Observable, Storage } from '@exodus/web3-types'

export type ChainId = string

export interface ProviderConnectInfo {
  chainId: ChainId
}

export interface ChainParameter {
  chainId: ChainId
}

export interface AddEthereumChainParameter {
  chainId: ChainId
  chainName: string
  rpcUrls: string[]
  iconUrls?: string[]
  nativeCurrency: {
    name?: string
    symbol: string
    decimals: number
  }
  blockExplorerUrls?: string[]
}

export interface RequestArguments {
  method: string
  params?: unknown[] | Record<string, unknown>
}

type JsonRpcId = string | undefined

export interface JsonRpcRequest {
  id: JsonRpcId
  jsonrpc: '2.0'
  method: string
  params?: unknown[]
}

type JsonRpcSuccess = {
  id: JsonRpcId
  jsonrpc: '2.0'
  result: unknown
}

type JsonRpcFailure = {
  id: JsonRpcId
  jsonrpc: '2.0'
  error: Error
}

export type JsonRpcResult = JsonRpcSuccess | JsonRpcFailure

export type JsonRpcCallback = (
  error: Error | null,
  result?: JsonRpcResult,
) => unknown

export type Deps = BaseProviderDeps & {
  accountsObservable: Observable
  storage: Storage
  storageKeyPrefix?: string
  supportedChainIds?: ChainId[]
  getDefaultChainId?: () => Promise<ChainId | null>
}

export interface ProviderStorage {
  getChainId: () => Promise<ChainId | null>
  setChainId: (chainId: ChainId) => Promise<void>
  clearChainId: () => Promise<void>
}
