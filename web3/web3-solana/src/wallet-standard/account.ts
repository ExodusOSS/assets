// This file is copied with modification from @wallet-standard/wallet.

import { omitBy } from '@exodus/basic-utils'
import {
  SignAndSendAllTransactions,
  SolanaSignAndSendTransaction,
  SolanaSignIn,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@exodus/solana-wallet-standard-features'
import type { WalletAccount, WalletIcon } from '@wallet-standard/base'
import bs58 from 'bs58'

import { SOLANA_CHAINS } from './chains.js'

const chains = SOLANA_CHAINS
const features = [
  SolanaSignIn,
  SolanaSignAndSendTransaction,
  SignAndSendAllTransactions,
  SolanaSignTransaction,
  SolanaSignMessage,
] as const

export class ExodusSolanaWalletAccount implements WalletAccount {
  readonly #address: WalletAccount['address']
  readonly #publicKey: WalletAccount['publicKey']
  readonly #label: WalletAccount['label']
  readonly #icon: WalletAccount['icon']

  get address() {
    return this.#address
  }

  get publicKey() {
    return this.#publicKey.slice()
  }

  get chains() {
    return chains.slice()
  }

  get features() {
    return features.slice()
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
    this.#label = label
    this.#icon = icon

    // Always apply freezing at end of construction
    // babel transpilation will give you a hard time otherwise
    if (new.target === ExodusSolanaWalletAccount) {
      Object.freeze(this)
    }
  }

  toJSON() {
    return omitBy(
      {
        address: this.#address,
        chains,
        features,
        label: this.#label,
        icon: this.#icon,
      },
      (value) => value === undefined,
    )
  }

  static fromJSON(json: {
    address: string
    label?: string
    icon?: WalletIcon
  }) {
    return new ExodusSolanaWalletAccount({
      address: json.address,
      publicKey: bs58.decode(json.address),
      label: json.label,
      icon: json.icon,
    })
  }
}
