import type {
  Deps as BaseProviderDeps,
} from '@exodus/web3-provider'

type WalletProvider = {
  name: string
  provider: any
}

export type WalletProviderManager = {
  getWalletProviders: () => WalletProvider[]
  setDefaultWalletProvider: (walletName: string) => void
  getDefaultWalletProvider: () => WalletProvider
}

export type Deps = BaseProviderDeps & {
  walletProviderManager: WalletProviderManager
}
