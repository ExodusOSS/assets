import type { AppDeps, ScanDomainsProcessedResult } from '@exodus/web3-types'

/**
 * Management dependencies.
 */

export type ManagementFactory = () => ManagementDeps

export type WalletName = string

export type ManagementDeps = {
  chooseWallet: (network: string, wallets: WalletName[], scanResul?:
    ScanDomainsProcessedResult) => Promise<WalletName>
}

export type Dependencies = {
  app: AppDeps
  management: ManagementDeps
}
