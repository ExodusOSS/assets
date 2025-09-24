import type {
  SolanaSignInInput,
  SolanaSignInOutput,
} from '@exodus/solana-wallet-standard-features'
import type {
  Blockhash,
  TransactionSignature,
  TransactionVersion,
} from '@exodus/solana-web3.js'
import { PublicKey } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import {
  DisconnectedError,
  InvalidInputError,
  MethodNotFoundError,
  UnsupportedMethodError,
} from '@exodus/web3-errors'
import { BaseProvider } from '@exodus/web3-provider'
import type { Base58, Base64, Bytes } from '@exodus/web3-types'
import assert from 'minimalistic-assert'

import {
  RpcConnectParams,
  RpcConnectResult,
  RpcSignAndSendAllParams,
  RpcSignAndSendAllResult,
  RpcSignInParams,
  RpcSignInResult,
  RpcSignMessageParams,
} from '../rpc-handlers/types.js'
import { ExodusSolanaWalletAccount } from '../wallet-standard/account.js'
import {
  ConnectOptions,
  Deps,
  NonEmptyArray,
  SendAllOptions,
  SignAndSendAllReturnValue,
  SignAndSendAllTransactionsInput,
  SignMessageOptions,
  TransactionOrRawTransaction,
  TransactionReturnValue,
} from './types.js'
import { assertNonEmpty } from './utils/arrays.js'
import type { LegacyOrVersionedTransaction } from './utils/index.js'
import {
  applySignatures,
  areFulfilled,
  deserializeMessageSignature,
  deserializePublicKey,
  deserializeTransaction,
  deserializeTransactionBytes,
  deserializeTransactionSignature,
  isLegacyTransaction,
  serializeEncodedMessage,
  serializeTransaction,
  serializeTransactionAsBytes,
  SUPPORTED_TRANSACTION_VERSIONS,
  toUint8Array,
} from './utils/index.js'
import { normalizeSignMessageOptions } from './utils/messages.js'
import {
  isRawTransaction,
  normalizeSignAndSendAllTransactionInputs,
} from './utils/transactions.js'

interface SolanaProviderEvents {
  accountChanged(publicKey: PublicKey | undefined): void
  connect(publicKey: PublicKey): void
  disconnect(): void
}

export class SolanaProvider extends BaseProvider<SolanaProviderEvents> {
  #publicKeys: PublicKey[] = []

  constructor({ transport, accountsObservable }: Deps) {
    super({ transport })

    // Observe account changes.
    this.on('connect', () => {
      const unobserve = accountsObservable.observe((accounts: string[]) => {
        // while `accounts` is an array, it only ever contains the active wallet account address or is empty
        this.#handleActiveAccountChange(accounts[0])
      })
      this.on('disconnect', unobserve)
    })
  }

  get supportedTransactionVersions(): ReadonlySet<TransactionVersion> {
    return SUPPORTED_TRANSACTION_VERSIONS
  }

  get publicKey(): PublicKey | null {
    return this.#publicKeys[0] ?? null
  }

  get publicKeys(): PublicKey[] {
    return this.#publicKeys
  }

  get isConnected(): boolean {
    return !!this.publicKey
  }

  #assertConnected = (): void => {
    if (!this.isConnected) {
      throw new DisconnectedError()
    }
  }

  #handleActiveAccountChange = (address: string | undefined) => {
    const publicKey = address ? deserializePublicKey(address) : undefined

    const isDifferentWallet = (publicKey: PublicKey) => {
      if (this.#publicKeys.length === 0) return false
      return !this.#publicKeys.some((it) => it.equals(publicKey))
    }

    if (!publicKey || isDifferentWallet(publicKey)) {
      this.#publicKeys = []
      this.emitAndIgnoreErrors('accountChanged', publicKey)
      return
    }

    const activePublicKey = this.publicKey
    if (!activePublicKey?.equals(publicKey)) {
      // move the active account to the front of the list
      const publicKeys = this.#publicKeys.filter((it) => !it.equals(publicKey))
      publicKeys.unshift(publicKey)
      this.#publicKeys = publicKeys

      this.emitAndIgnoreErrors('accountChanged', publicKey)
    }
  }

  #prepareTransaction = async (
    transactions: LegacyOrVersionedTransaction[],
    forceBlockhashOverride = false,
  ): Promise<void> => {
    let latestBlockhash: Blockhash = ''

    const legacyTransactions = transactions.filter(isLegacyTransaction)
    for (const transaction of legacyTransactions) {
      if (!transaction.feePayer) {
        transaction.feePayer = this.publicKey! // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }

      if (
        transaction.signatures.length === 0 &&
        (!transaction.recentBlockhash || forceBlockhashOverride)
      ) {
        if (!latestBlockhash) {
          latestBlockhash = await this._callRpcMethod(
            'sol_getLatestBlockhash',
            ['finalized'],
          )
        }

        transaction.recentBlockhash = latestBlockhash
      }
    }
  }

  connect = async ({
    onlyIfTrusted = false,
    silent,
  }: ConnectOptions = {}): Promise<{
    publicKey: PublicKey
    publicKeys: NonEmptyArray<PublicKey>
  }> => {
    assert(
      !silent || onlyIfTrusted,
      'connect: silent can only be used together with onlyIfTrusted',
    )

    const addresses = await this._callRpcMethod<
      RpcConnectParams,
      RpcConnectResult
    >('sol_connect', { onlyIfTrusted, silent })

    const publicKeys = addresses.map(({ address }) =>
      deserializePublicKey(address),
    )

    assertNonEmpty(publicKeys)
    this.#publicKeys = publicKeys
    const [publicKey] = publicKeys

    this.emitAndIgnoreErrors('connect', publicKey)

    // public key is returned separately for phantom compatibility
    return { publicKey, publicKeys }
  }

  disconnect = (): void => {
    if (!this.isConnected) {
      return
    }

    this.#publicKeys = []

    this.emitAndIgnoreErrors('disconnect')
  }

  signIn = async (
    input: SolanaSignInInput = {},
  ): Promise<SolanaSignInOutput> => {
    const { accounts, signature, signatureType, signedMessage } =
      await this._callRpcMethod<RpcSignInParams, RpcSignInResult>(
        'sol_signIn',
        input,
      )

    assertNonEmpty(accounts)

    this.#publicKeys = accounts.map((account) =>
      deserializePublicKey(account.address),
    )

    this.emitAndIgnoreErrors('accountChanged', this.#publicKeys[0])

    return {
      signedMessage: toUint8Array(signedMessage),
      signature: toUint8Array(signature),
      signatureType,
      account: ExodusSolanaWalletAccount.fromJSON(accounts[0]),
    }
  }

  signTransaction = async <T extends TransactionOrRawTransaction>(
    transactionOrBytes: T,
  ): Promise<TransactionReturnValue<T>> => {
    this.#assertConnected()

    const isBytesSignature = transactionOrBytes instanceof Uint8Array

    const transaction = isBytesSignature
      ? deserializeTransactionBytes(transactionOrBytes)
      : (transactionOrBytes as LegacyOrVersionedTransaction)

    await this.#prepareTransaction([transaction])

    const wireTransaction = serializeTransaction(transaction)
    const wireSignedTransaction: Base64 = await this._callRpcMethod(
      'sol_signTransaction',
      [wireTransaction],
    )

    const signedTransaction = deserializeTransaction(wireSignedTransaction)

    applySignatures(transaction, signedTransaction)

    return (
      isBytesSignature ? serializeTransactionAsBytes(transaction) : transaction
    ) as TransactionReturnValue<T>
  }

  signAllTransactions = async <T extends TransactionOrRawTransaction>(
    transactionsOrBytes: TransactionOrRawTransaction[],
  ): Promise<TransactionReturnValue<T>[]> => {
    this.#assertConnected()

    const isBytesSignature = transactionsOrBytes[0] instanceof Uint8Array

    const transactions = isBytesSignature
      ? transactionsOrBytes.map((serializedTransaction) =>
          deserializeTransactionBytes(serializedTransaction as Bytes),
        )
      : (transactionsOrBytes as LegacyOrVersionedTransaction[])

    await this.#prepareTransaction(transactions)

    const wireTransactions = transactions.map((transaction) =>
      serializeTransaction(transaction),
    )
    const wireSignedTransactions: Base64[] = await this._callRpcMethod(
      'sol_signAllTransactions',
      [wireTransactions],
    )

    const signedTransactions = wireSignedTransactions.map((transaction) =>
      deserializeTransaction(transaction),
    )
    transactions.forEach((transaction, index) => {
      const signedTransaction = signedTransactions[index]
      applySignatures(transaction, signedTransaction)
    })

    return (
      isBytesSignature
        ? transactions.map((transaction) =>
            serializeTransactionAsBytes(transaction),
          )
        : transactions
    ) as TransactionReturnValue<T>[]
  }

  signAndSendAllTransactions = async <
    O extends SendAllOptions = { parallel: true; atomic: true },
  >(
    inputs: SignAndSendAllTransactionsInput[],
    { parallel = true, atomic = true, ...sendOptions }: O = {} as O,
  ): Promise<SignAndSendAllReturnValue<O>> => {
    this.#assertConnected()

    const transactionsWithSendOptions =
      normalizeSignAndSendAllTransactionInputs(inputs, sendOptions)

    const serialized = transactionsWithSendOptions.map(
      ({ transaction: transactionOrBytes, options }) => {
        const transaction = isRawTransaction(transactionOrBytes)
          ? deserializeTransactionBytes(transactionOrBytes)
          : transactionOrBytes

        return {
          transaction: serializeTransaction(transaction),
          options,
        }
      },
    )

    const results = await this._callRpcMethod<
      RpcSignAndSendAllParams,
      RpcSignAndSendAllResult
    >('sol_signAndSendAllTransactions', [serialized, { parallel }])

    assert(
      results.length === transactionsWithSendOptions.length,
      `Unexpected number of signatures returned. Got ${results.length}, expected ${transactionsWithSendOptions.length}.`,
    )

    const normalizeSignature = (signature: Base64, index: number) => {
      const isBytesSignature =
        transactionsWithSendOptions[index].transaction instanceof Uint8Array

      return isBytesSignature
        ? deserializeTransactionSignature(signature)
        : signature
    }

    if (atomic) {
      assert(areFulfilled(results), 'Some transactions failed to send.')

      return {
        signatures: results.map(({ value: signature }, index) =>
          normalizeSignature(signature, index),
        ),
      } as SignAndSendAllReturnValue<O>
    }

    return {
      signatures: results.map((result, index) => {
        if (result.status === 'rejected') {
          return result
        }

        return {
          status: 'fulfilled',
          value: normalizeSignature(result.value, index),
        }
      }),
    } as SignAndSendAllReturnValue<O>
  }

  signAndSendTransaction = async (
    transactionOrBytes: LegacyOrVersionedTransaction | Bytes,
    options: SendOptions = {},
  ): Promise<{ signature: TransactionSignature | Bytes }> => {
    this.#assertConnected()

    const isBytesSignature = transactionOrBytes instanceof Uint8Array

    const transaction = isBytesSignature
      ? deserializeTransactionBytes(transactionOrBytes)
      : (transactionOrBytes as LegacyOrVersionedTransaction)

    await this.#prepareTransaction([transaction], true)

    const wireTransaction = serializeTransaction(transaction)
    const wireSignature: Base58 = await this._callRpcMethod(
      'sol_signAndSendTransaction',
      [wireTransaction, options],
    )

    const encodedSignature = wireSignature

    const signature = isBytesSignature
      ? deserializeTransactionSignature(encodedSignature)
      : encodedSignature
    return { signature }
  }

  signMessage = async (
    encodedMessage: Bytes,
    options?: SignMessageOptions,
  ): Promise<{ signature: Bytes; publicKey: PublicKey }> => {
    const { display = 'utf8', publicKey: fromPublicKey } =
      normalizeSignMessageOptions(options)

    this.#assertConnected()

    const isDisplayValid = ['hex', 'utf8'].includes(display)
    if (!isDisplayValid) {
      throw new InvalidInputError()
    }

    const wireEncodedMessage = serializeEncodedMessage(encodedMessage)
    const wireSignature = await this._callRpcMethod<
      RpcSignMessageParams,
      Base64
    >('sol_signMessage', [
      wireEncodedMessage,
      {
        display,
        ...(fromPublicKey && { address: fromPublicKey.toBase58() }),
      },
    ])

    const signature = deserializeMessageSignature(wireSignature)

    return { signature, publicKey: fromPublicKey ?? this.publicKey! } // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  postMessage = () => {
    // TODO: Implement.
    throw new UnsupportedMethodError()
  }

  request = (args: {
    method:
      | 'connect'
      | 'isConnected'
      | 'disconnect'
      | 'signIn'
      | 'signTransaction'
      | 'signAllTransactions'
      | 'signAndSendTransaction'
      | 'signMessage'
      | 'postMessage'
    params: unknown[]
  }): Promise<unknown> => {
    const { method, params = [] } = args

    // Intercepting internal non-documented method.
    if (method === 'isConnected') {
      return this._callRpcMethod<[], boolean>('sol_isConnected', [])
    }

    const hasMethod = [
      'connect',
      'disconnect',
      'signIn',
      'signTransaction',
      'signAllTransactions',
      'signAndSendTransaction',
      'signMessage',
      'postMessage',
    ].includes(method)
    if (!hasMethod) {
      throw new MethodNotFoundError()
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this[method](...params)
  }
}
