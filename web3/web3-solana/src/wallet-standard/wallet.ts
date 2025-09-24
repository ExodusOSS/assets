import type {
  SolanaSignAndSendAllTransactionsFeature,
  SolanaSignAndSendAllTransactionsMethod,
  SolanaSignAndSendAllTransactionsOptions,
  SolanaSignAndSendTransactionFeature,
  SolanaSignAndSendTransactionInput,
  SolanaSignAndSendTransactionMethod,
  SolanaSignAndSendTransactionOutput,
  SolanaSignInFeature,
  SolanaSignInInput,
  SolanaSignInMethod,
  SolanaSignInOutput,
  SolanaSignMessageFeature,
  SolanaSignMessageInput,
  SolanaSignMessageMethod,
  SolanaSignMessageOutput,
  SolanaSignTransactionFeature,
  SolanaSignTransactionInput,
  SolanaSignTransactionMethod,
  SolanaSignTransactionOutput,
} from '@exodus/solana-wallet-standard-features'
import {
  SignAndSendAllTransactions,
  SolanaSignAndSendTransaction,
  SolanaSignIn,
  SolanaSignMessage,
  SolanaSignTransaction,
} from '@exodus/solana-wallet-standard-features'
import { PublicKey } from '@exodus/solana-web3.js'
import { StandardWallet } from '@exodus/web3-provider'
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
import {
  StandardConnect,
  StandardDisconnect,
  StandardEvents,
} from '@wallet-standard/features'
import assert from 'minimalistic-assert'

import type { SolanaProvider } from '../provider/provider.js'
import type { WalletStandardDeps } from '../types.js'
import { ExodusSolanaWalletAccount } from './account.js'
import { isSolanaChain, SOLANA_CHAINS } from './chains.js'
import { bytesEqual } from './util.js'

export class ExodusSolanaWallet extends StandardWallet implements Wallet {
  readonly #listeners: {
    [E in StandardEventsNames]?: StandardEventsListeners[E][]
  } = Object.create(null)

  readonly #version = '1.0.0' as const
  readonly #name
  readonly #icon
  readonly #provider: SolanaProvider

  #accounts: ExodusSolanaWalletAccount[] = []

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
    return [...SOLANA_CHAINS]
  }

  get features(): StandardConnectFeature &
    StandardDisconnectFeature &
    StandardEventsFeature &
    SolanaSignInFeature &
    SolanaSignAndSendTransactionFeature &
    SolanaSignAndSendAllTransactionsFeature &
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
      [SolanaSignIn]: {
        version: '1.0.0',
        signIn: this.#signIn,
      },
      [SolanaSignAndSendTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: [...supportedTransactionVersionsSet],
        signAndSendTransaction: this.#signAndSendTransaction,
      },
      [SignAndSendAllTransactions]: {
        version: '1.0.0',
        supportedTransactionVersions: [...supportedTransactionVersionsSet],
        signAndSendAllTransactions: this.#signAndSendAllTransactions,
      },
      [SolanaSignTransaction]: {
        version: '1.0.0',
        supportedTransactionVersions: [...supportedTransactionVersionsSet],
        signTransaction: this.#signTransaction,
      },
      [SolanaSignMessage]: {
        version: '1.0.0',
        signMessage: this.#signMessage,
      },
    }
  }

  get accounts() {
    return this.#accounts
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

    // auto-connect if trusted
    this.#provider.connect({ onlyIfTrusted: true, silent: true }).catch(() => {
      // origin not trusted
    })
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
    const keysAndAddresses = this.#provider.publicKeys.map((publicKey) => ({
      publicKey: publicKey.toBytes(),
      address: publicKey.toBase58(),
    }))

    if (keysAndAddresses.length === 0) {
      return
    }

    const accounts = this.#accounts

    const hasMatchingAccount = ({
      address,
      publicKey,
    }: (typeof keysAndAddresses)[number]) =>
      accounts.some(
        (account) =>
          address === account.address &&
          bytesEqual(account.publicKey, publicKey),
      )

    if (
      keysAndAddresses.length > 0 &&
      // order for the first account is important, the others can be matching in arbitrary order
      accounts[0]?.address === keysAndAddresses[0].address &&
      keysAndAddresses.every(hasMatchingAccount)
    ) {
      return
    }

    this.#accounts = keysAndAddresses.map(
      ({ publicKey, address }) =>
        new ExodusSolanaWalletAccount({
          publicKey,
          address,
        }),
    )

    this.#emit('change', { accounts: this.accounts })
  }

  #disconnected = () => {
    if (this.#accounts.length > 0) {
      this.#accounts = []
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
    if (this.#accounts.length === 0) {
      await this.#provider.connect(silent ? { onlyIfTrusted: true } : undefined)
    }

    this.#connected()

    return { accounts: this.accounts }
  }

  #disconnect: StandardDisconnectMethod = async () => {
    await this.#provider.disconnect()
  }

  #signIn: SolanaSignInMethod = async (
    ...inputs: readonly SolanaSignInInput[]
  ): Promise<readonly SolanaSignInOutput[]> => {
    const outputs: SolanaSignInOutput[] = []
    if (inputs.length > 1) {
      for (const input of inputs) {
        outputs.push(await this.#provider.signIn(input))
      }
    } else {
      return [await this.#provider.signIn(inputs[0])]
    }

    return outputs
  }

  #signAndSendTransaction: SolanaSignAndSendTransactionMethod = async (
    ...inputs
  ) => {
    assert(this.#accounts.length, 'not connected')
    const outputs: SolanaSignAndSendTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain, options } = inputs[0]
      const { minContextSlot, preflightCommitment, skipPreflight, maxRetries } =
        options || {}

      assert(this.#accounts.includes(account), 'invalid account')

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
      const areInputsFromSameChain = inputs.every(
        ({ chain }) => chain === inputs[0].chain,
      )
      if (!areInputsFromSameChain) {
        throw new Error('conflicting chain')
      }

      for (const input of inputs) {
        outputs.push(...(await this.#signAndSendTransaction(input)))
      }
    }

    return outputs
  }

  #signAndSendAllTransactions: SolanaSignAndSendAllTransactionsMethod = async (
    inputs: readonly SolanaSignAndSendTransactionInput[],
    options?: SolanaSignAndSendAllTransactionsOptions,
  ): Promise<
    readonly PromiseSettledResult<SolanaSignAndSendTransactionOutput>[]
  > => {
    assert(this.#accounts.length, 'not connected')
    const firstChain = inputs[0]?.chain

    const transactionsWithOptions = inputs.map(
      ({ transaction, account, chain, options }, i) => {
        assert(
          this.#accounts.includes(account),
          `invalid account for transaction at index ${i}`,
        )
        assert(
          isSolanaChain(chain),
          `invalid chain for transaction at index ${i}`,
        )
        assert(chain === firstChain, 'transactions must be from the same chain')

        return { transaction, options }
      },
    )

    const { signatures } = await this.#provider.signAndSendAllTransactions(
      transactionsWithOptions,
      { parallel: options?.mode !== 'serial', atomic: false },
    )

    return signatures
  }

  #signTransaction: SolanaSignTransactionMethod = async (
    ...inputs: SolanaSignTransactionInput[]
  ): Promise<SolanaSignTransactionOutput[]> => {
    assert(this.#accounts.length, 'not connected')

    const outputs: SolanaSignTransactionOutput[] = []

    if (inputs.length === 1) {
      const { transaction, account, chain } = inputs[0]

      assert(this.#accounts.includes(account), 'invalid account')

      if (chain && !isSolanaChain(chain)) {
        throw new Error('invalid chain')
      }

      const signedTransaction =
        await this.#provider.signTransaction(transaction)

      // 'transaction' is a Uint8Array so the provider returns the same type.
      outputs.push({ signedTransaction } as { signedTransaction: Uint8Array })
    } else if (inputs.length > 1) {
      const areInputsFromSameChain = inputs.every(
        ({ chain }) => chain === inputs[0].chain,
      )
      if (!areInputsFromSameChain) {
        throw new Error('conflicting chain')
      }

      for (const input of inputs) {
        assert(this.#accounts.includes(input.account), 'invalid account')

        if (!isSolanaChain(input.chain)) {
          throw new Error('invalid chain')
        }
      }

      const transactions = inputs.map(({ transaction }) => transaction)

      const signedTransactions =
        await this.#provider.signAllTransactions(transactions)

      outputs.push(
        ...signedTransactions.map((signedTransaction) => ({
          signedTransaction,
        })),
      )
    }

    return outputs
  }

  #signMessage: SolanaSignMessageMethod = async (
    ...inputs: SolanaSignMessageInput[]
  ): Promise<SolanaSignMessageOutput[]> => {
    assert(this.#accounts.length, 'not connected')

    const outputs: SolanaSignMessageOutput[] = []

    if (inputs.length === 1) {
      const { message, account } = inputs[0]

      assert(this.#accounts.includes(account), 'invalid account')

      const { signature } = await this.#provider.signMessage(message, {
        publicKey: new PublicKey(account.publicKey),
      })

      outputs.push({ signedMessage: message, signature })
    } else if (inputs.length > 1) {
      for (const input of inputs) {
        const publicKey = new PublicKey(input.account.publicKey)
        outputs.push(...(await this.#signMessage(input, { publicKey })))
      }
    }

    return outputs
  }
}
