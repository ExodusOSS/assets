// This file is copied with modification from @wallet-standard/wallet.

import {
  SolanaSignAndSendTransaction,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@exodus/solana-wallet-standard-features'

import { SOLANA_CHAINS } from './chains.js'

import type { WalletAccount } from '@wallet-standard/base'

const chains = SOLANA_CHAINS
const features = [
  SolanaSignAndSendTransaction,
  SolanaSignTransaction,
  SolanaSignMessage,
] as const

export class ExodusSolanaWalletAccount implements WalletAccount {
  readonly #address: WalletAccount['address']
  readonly #publicKey: WalletAccount['publicKey']
  readonly #chains: WalletAccount['chains']
  readonly #features: WalletAccount['features']
  readonly #label: WalletAccount['label']
  readonly #icon: WalletAccount['icon']

  get address() {
    return this.#address
  }

  get publicKey() {
    return this.#publicKey.slice()
  }

  get chains() {
    return this.#chains.slice()
  }

  get features() {
    return this.#features.slice()
  }

  get label() {
    return this.#label
  }

  get icon() {
    return this.#icon
  }

  constructor({
    address,
    publicKey,
    label,
    icon,
  }: Omit<WalletAccount, 'chains' | 'features'>) {
    this.#address = address
    this.#publicKey = publicKey
    this.#chains = chains
    this.#features = features
    this.#label = label
    this.#icon = icon

    // Always apply freezing at end of construction
    // babel transpilation will give you a hard time otherwise
    if (new.target === ExodusSolanaWalletAccount) {
      Object.freeze(this)
    }
  }
}
