import { StandardWallet } from '@exodus/web3-provider'

import type { EthereumProvider } from '../provider/provider.js'
import type { WalletStandardDeps } from '../types.js'
import type { Wallet } from '@wallet-standard/base'

export type EthereumProviderFeature = {
  'eip1193:provider': {
    provider: EthereumProvider
  }
}

export class ExodusEthereumWallet extends StandardWallet implements Wallet {
  #version = '1.0.0' as const
  #name
  #icon
  #provider: EthereumProvider | null = null

  get version() {
    return this.#version
  }

  get name() {
    return this.#name
  }

  get icon() {
    return this.#icon
  }

  get chains() {
    return []
  }

  get features(): EthereumProviderFeature {
    return {
      'eip1193:provider': {
        provider: this.#provider!,
      },
    }
  }

  get accounts() {
    return []
  }

  constructor({ provider, name, icon }: WalletStandardDeps) {
    super({ name, icon })

    if (!provider) {
      throw new Error('Ethereum Provider is required!')
    }

    this.#name = name
    this.#icon = icon
    this.#provider = provider
  }
}
