import type { AppDeps, WalletDeps } from '@exodus/web3-types'

export type BaseConnectDependencies = Pick<
  AppDeps,
  | 'approveConnection'
  | 'ensureTrusted'
  | 'isTrusted'
  | 'scanDomains'
  | 'getOrigin'
  | 'getPathname'
> &
  Pick<WalletDeps, 'ensureUnlocked'>

export interface CommonDeps {
  app: AppDeps
  wallet?: WalletDeps
}

export interface Chain {
  assetName: string
  network: string
}
