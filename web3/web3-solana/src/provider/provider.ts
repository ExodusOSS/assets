import { PublicKey } from '@exodus/solana-web3.js'
import {
  DisconnectedError,
  InvalidInputError,
  MethodNotFoundError,
  UnsupportedMethodError,
} from '@exodus/web3-errors'
import { BaseProvider } from '@exodus/web3-provider'

import {
  deserializeMessageSignature,
  deserializePublicKey,
  deserializeTransaction,
  deserializeTransactionSignature,
  applySignatures,
  isLegacyTransaction,
  serializeEncodedMessage,
  serializeTransaction,
  deserializeTransactionBytes,
  serializeTransactionAsBytes,
  SUPPORTED_TRANSACTION_VERSIONS,
} from './utils/index.js'

import type { ConnectOptions, Deps } from './types.js'
import type {
  LegacyOrVersionedTransaction,
  SolDisplayEncoding as DisplayEncoding,
} from './utils/index.js'
import type {
  Blockhash,
  TransactionSignature,
  TransactionVersion,
} from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import type { Base58, Base64, Bytes } from '@exodus/web3-types'

interface SolanaProviderEvents {
  accountChanged(publicKey: PublicKey): void
  connect(publicKey: PublicKey): void
  disconnect(): void
}

export class SolanaProvider extends BaseProvider<SolanaProviderEvents> {
  #publicKey: PublicKey | null = null

  constructor({ transport, accountsObservable }: Deps) {
    super({ transport })

    // Observe account changes.
    this.on('connect', () => {
      const unobserve = accountsObservable.observe((accounts: string[]) => {
        this._handleAccountsChanged(accounts)
      })
      this.on('disconnect', unobserve)
    })
  }

  get supportedTransactionVersions(): ReadonlySet<TransactionVersion> {
    return SUPPORTED_TRANSACTION_VERSIONS
  }

  get publicKey(): PublicKey | null {
    return this.#publicKey
  }

  get isConnected(): boolean {
    return !!this.publicKey
  }

  #assertConnected = (): void => {
    if (!this.isConnected) {
      throw new DisconnectedError()
    }
  }

  _handleAccountsChanged = (accounts: string[]) => {
    // `accounts` is always going to have a single account (or none) for the time being.
    const publicKey = new PublicKey(accounts[0])
    if (!this.#publicKey?.equals(publicKey)) {
      this.#publicKey = publicKey

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
        transaction.feePayer = this.publicKey!
      }

      if (
        !transaction.signatures.length &&
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

  connect = async ({ onlyIfTrusted = false }: ConnectOptions = {}): Promise<{
    publicKey: PublicKey
  }> => {
    const wirePublicKey = await this._callRpcMethod<[boolean], Base58>(
      'sol_connect',
      [onlyIfTrusted],
    )

    const publicKey = deserializePublicKey(wirePublicKey)

    this.#publicKey = publicKey

    this.emitAndIgnoreErrors('connect', publicKey)

    return { publicKey }
  }

  disconnect = (): void => {
    if (!this.isConnected) {
      return
    }

    this.#publicKey = null

    this.emitAndIgnoreErrors('disconnect')
  }

  signTransaction = async (
    transactionOrBytes: LegacyOrVersionedTransaction | Bytes,
  ): Promise<LegacyOrVersionedTransaction | Bytes> => {
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

    return isBytesSignature
      ? serializeTransactionAsBytes(transaction)
      : transaction
  }

  signAllTransactions = async (
    transactionsOrBytes: (LegacyOrVersionedTransaction | Bytes)[],
  ): Promise<(LegacyOrVersionedTransaction | Bytes)[]> => {
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

    return isBytesSignature
      ? transactions.map((transaction) =>
          serializeTransactionAsBytes(transaction),
        )
      : transactions
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
    display: DisplayEncoding = 'utf8',
  ): Promise<{ signature: Bytes; publicKey: PublicKey }> => {
    this.#assertConnected()

    const isDisplayValid = ['hex', 'utf8'].includes(display)
    if (!isDisplayValid) {
      throw new InvalidInputError()
    }

    const wireEncodedMessage = serializeEncodedMessage(encodedMessage)
    const wireSignature = await this._callRpcMethod<
      [Base64, DisplayEncoding],
      Base64
    >('sol_signMessage', [wireEncodedMessage, display])

    const signature = deserializeMessageSignature(wireSignature)

    return { signature, publicKey: this.publicKey! }
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
