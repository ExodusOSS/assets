import { PublicKey } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import type { Deps as BaseProviderDeps } from '@exodus/web3-provider'
import type { Bytes, Observable } from '@exodus/web3-types'

import type {
  LegacyOrVersionedTransaction,
  SolDisplayEncoding as DisplayEncoding,
} from './utils/index.js'

export type ConnectOptions = {
  onlyIfTrusted?: boolean
  silent?: boolean
}

export type Deps = BaseProviderDeps & {
  accountsObservable: Observable
}

export type NonEmptyArray<T> = [T, ...T[]]

export type TransactionOrRawTransaction = LegacyOrVersionedTransaction | Bytes

export type TransactionWithSendOptions = {
  transaction: TransactionOrRawTransaction
  options: SendOptions
}

export type SendAllOptions = SendOptions & {
  parallel?: boolean
  atomic?: boolean
}

export type SignAndSendAllTransactionsInput =
  | TransactionWithSendOptions
  | TransactionOrRawTransaction

export type SignAndSendAllReturnValue<O extends SendAllOptions> = {
  signatures: true extends O['atomic']
    ? Bytes[] | string[]
    : PromiseSettledResult<Bytes | string>[]
}

export type TransactionReturnValue<T extends TransactionOrRawTransaction> =
  Bytes extends T ? Uint8Array : LegacyOrVersionedTransaction

export type SignMessageOptions =
  | DisplayEncoding
  | { display?: DisplayEncoding; publicKey?: PublicKey }
