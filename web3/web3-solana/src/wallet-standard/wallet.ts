import {
  SolanaSignAndSendTransaction,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@exodus/solana-wallet-standard-features'
import { StandardWallet } from '@exodus/web3-provider'
import {
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
} from '@wallet-standard/features'

import { ExodusSolanaWalletAccount } from './account.js'
import { isSolanaChain, SOLANA_CHAINS } from './chains.js'
import { bytesEqual } from './util.js'

import type { SolanaProvider } from '../provider/provider.js'
import type { WalletStandardDeps } from '../types.js'
import type {
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput,
} from '@exodus/solana-wallet-standard-features'
import type { Wallet } from '@wallet-standard/base'
import type {
  StandardConnectFeature,
  StandardConnectMethod,
  StandardDisconnectFeature,
  StandardDisconnectMethod,
  StandardEventsFeature,
  StandardEventsListeners,
  StandardEventsNames,
  StandardEventsOnMethod,
} from '@wallet-standard/features'

export class ExodusSolanaWallet extends StandardWallet implements Wallet {
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = Object.create(null)
  readonly #version = '1.0.0' as const
  readonly #name
  readonly #icon
  #account: ExodusSolanaWalletAccount | null = null
  readonly #provider: SolanaProvider

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
    return SOLANA_CHAINS.slice()
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignTransactionFeature &
    SolanaSignMessageFeature {
    const { supportedTransactionVersions: supportedTransactionVersionsSet } =
      this.#provider

    return {
      [StandardConnect]: {
        version: '1.0.0',
        connect: this.#connect,
      },
      [StandardDisconnect]: {
        version: '1.0.0',
        disconnect: this.#disconnect,
      },
      [StandardEvents]: {
        version: '1.0.0',
        on: this.#on,
      },
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: Array.from(
          supportedTransactionVersionsSet,
        ),
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: Array.from(
          supportedTransactionVersionsSet,
        ),
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
    }
  }

  get accounts() {
    return this.#account ? [this.#account] : []
  }

  constructor({ provider, name, icon }: WalletStandardDeps) {
    super({ name, icon })

    if (!provider) {
      throw new Error('Solana Provider is required!')
    }

    this.#name = name
    this.#icon = icon
    this.#provider = provider

    provider.on('connect', this.#connected, this)
    provider.on('disconnect', this.#disconnected, this)
    provider.on('accountChanged', this.#reconnected, this)

    this.#connected()
  }

  #on: StandardEventsOnMethod = (event, listener) => {
    this.#listeners[event]?.push(listener) ||
      (this.#listeners[event] = [listener])
    return (): void => this.#off(event, listener)
  }

  #emit<E extends StandardEventsNames>(
    event: E,
    ...args: Parameters<StandardEventsListeners[E]>
  ): void {
    // eslint-disable-next-line prefer-spread
    this.#listeners[event]?.forEach((listener) => listener.apply(null, args))
  }

  #off<E extends StandardEventsNames>(
    event: E,
    listener: StandardEventsListeners[E],
  ): void {
    this.#listeners[event] = this.#listeners[event]?.filter(
      (existingListener) => listener !== existingListener,
    )
  }

  #connected = () => {
    const address = this.#provider.publicKey?.toBase58()
    if (address) {
      const publicKey = this.#provider.publicKey!.toBytes()

      const account = this.#account
      if (
        !account ||
        account.address !== address ||
        !bytesEqual(account.publicKey, publicKey)
      ) {
        this.#account = new ExodusSolanaWalletAccount({ address, publicKey })
        this.#emit('change', { accounts: this.accounts })
      }
    }
  }

  #disconnected = () => {
    if (this.#account) {
      this.#account = null
      this.#emit('change', { accounts: this.accounts })
    }
  }

  #reconnected = () => {
    if (this.#provider.publicKey) {
      this.#connected()
    } else {
      this.#disconnected()
    }
  }

  #connect: StandardConnectMethod = async ({ silent } = {}) => {
    if (!this.#account) {
      await this.#provider.connect(silent ? { onlyIfTrusted: true } : undefined)
    }

    this.#connected()

    return { accounts: this.accounts }
  }

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#provider.disconnect()
  }

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignAndSendTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0]
      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } =
        options || {}

      if (account !== this.#account) {
        throw new Error('invalid account')
      }

      if (!isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      const { signature }: { signature: unknown } =
        await this.#provider.signAndSendTransaction(transaction, {
          maxRetries,
          minContextSlot,
          preflightCommitment,
          skipPreflight,
        })

      // 'transaction' is a Uint8Array so the provider returns the same type.
      outputs.push({ signature } as { signature: Uint8Array })
    } else if (inputs.length > 1) {
      const areInputsFromSameChain = inputs.every(({ chain }) => chain === inputs[0].chain)
      if (!areInputsFromSameChain) {
        throw new Error('conflicting chain')
      }

      for (const input of inputs) {
        outputs.push(...(await this.#signAndSendTransaction(input)))
      }
    }

    return outputs
  }

  #signTransaction: SolanaSignTransactionMethod = async (...inputs) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]

      if (account !== this.#account) {
        throw new Error('invalid account')
      }

      if (chain && !isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      const signedTransaction: unknown = await this.#provider.signTransaction(
        transaction,
      )

      // 'transaction' is a Uint8Array so the provider returns the same type.
      outputs.push({ signedTransaction } as { signedTransaction: Uint8Array })
    } else if (inputs.length > 1) {
      const areInputsFromSameChain = inputs.every(({ chain }) => chain === inputs[0].chain)
      if (!areInputsFromSameChain) {
        throw new Error('conflicting chain')
      }

      for (const input of inputs) {
        if (input.account !== this.#account) {
          throw new Error('invalid account')
        }

        if (!isSolanaChain(input.chain)) {
          throw new Error('invalid chain')
        }
      }

      const transactions = inputs.map(({ transaction }) => transaction)

      const signedTransactions: unknown =
        await this.#provider.signAllTransactions(transactions)

      // 'transactions' is an array of 'Uint8Array' so the provider returns the same type.
      outputs.push(
        ...(signedTransactions as Uint8Array[]).map((signedTransaction) => ({
          signedTransaction,
        })),
      )
    }

    return outputs
  }

  #signMessage: SolanaSignMessageMethod = async (...inputs) => {
    if (!this.#account) {
      throw new Error('not connected')
    }

    const outputs: SolanaSignMessageOutput[] = []

    if (inputs.length === 1) {
      const { message, account } = inputs[0]

      if (account !== this.#account) {
        throw new Error('invalid account')
      }

      const { signature } = await this.#provider.signMessage(message)

      outputs.push({ signedMessage: message, signature })
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(...(await this.#signMessage(input)))
      }
    }

    return outputs
  }
}
