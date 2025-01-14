import type { Deps as BaseProviderDeps } from '@exodus/web3-provider'
import type { Observable } from '@exodus/web3-types'

export type ConnectOptions = {
  onlyIfTrusted?: boolean
}

export type Deps = BaseProviderDeps & {
  accountsObservable: Observable
}
