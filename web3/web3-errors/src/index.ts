// Inspired by EIP-1193.
// See: https://eips.ethereum.org/EIPS/eip-1193#provider-errors.

import captureStackTrace from './captureStackTrace.js'

export class UserRejectedRequestError extends Error {
  code: number

  constructor() {
    super('The user rejected the request through the wallet.')
    this.name = 'UserRejectedRequestError'
    this.code = 4001
    captureStackTrace(this, this.constructor)
  }
}

export class UnauthorizedError extends Error {
  code: number

  constructor() {
    super(
      'The requested method and/or account has not been authorized by the user.',
    )
    this.name = 'UnauthorizedError'
    this.code = 4100
    captureStackTrace(this, this.constructor)
  }
}

export class UnsupportedMethodError extends Error {
  code: number

  constructor() {
    super('The Provider does not support the requested method.')
    this.name = 'UnsupportedMethodError'
    this.code = 4200
    captureStackTrace(this, this.constructor)
  }
}

export class DisconnectedError extends Error {
  code: number

  constructor() {
    super('The Provider is disconnected from all chains.')
    this.name = 'DisconnectedError'
    this.code = 4900
    captureStackTrace(this, this.constructor)
  }
}

// Inspired by EIP-1474.
// See: https://eips.ethereum.org/EIPS/eip-1474#error-codes.

export class InternalError extends Error {
  code: number

  constructor() {
    super('Something went wrong within the wallet.')
    this.name = 'InternalError'
    this.code = -32603
    captureStackTrace(this, this.constructor)
  }
}

export class InvalidInputError extends Error {
  code: number

  constructor(message?: string) {
    super('Missing or invalid parameters.')
    this.name = 'InvalidInputError'
    this.code = -32000
    if (message) {
      this.message = message
    }
    captureStackTrace(this, this.constructor)
  }
}

export class MethodNotFoundError extends Error {
  code: number

  constructor() {
    super('The requested method is not recognized by the wallet.')
    this.name = 'MethodNotFoundError'
    this.code = -32601
    captureStackTrace(this, this.constructor)
  }
}

// Inspired by Metamask Docs
// https://docs.metamask.io/guide/rpc-api.html#returns-7
export class UnsupportedChainError extends Error {
  code: number

  constructor() {
    super('The Provider does not support the requested chain.')
    this.name = 'UnsupportedChainError'
    this.code = 4902
    captureStackTrace(this, this.constructor)
  }
}

// Inspired by Cardano Foundation
// https://github.com/cardano-foundation/CIPs/tree/master/CIP-0030#error-types
export class RefusedError extends Error {
  code: number

  constructor() {
    super(
      'The request was refused due to lack of access - e.g. wallet disconnects.',
    )
    this.name = 'RefusedError'
    this.code = -3
    captureStackTrace(this, this.constructor)
  }
}

export class UserDeclinedError extends Error {
  code: number

  constructor() {
    super('User declined to sign the data.')
    this.name = 'UserDeclinedError'
    this.code = 3
    captureStackTrace(this, this.constructor)
  }
}

export class DataSignError extends Error {
  code: number

  constructor() {
    super(
      'Wallet could not sign the data (e.g. does not have the secret key associated with the address).',
    )
    this.name = 'ProofGenerationError'
    this.code = 1
    captureStackTrace(this, this.constructor)
  }
}

export class TransactionSignError extends Error {
  code: number

  constructor() {
    super(
      'User has accepted the transaction sign, but the wallet was unable to sign the transaction (e.g. not having some of the private keys).',
    )
    this.name = 'ProofGenerationError'
    this.code = 1
    captureStackTrace(this, this.constructor)
  }
}

export class AssetNotSupportedError extends Error {
  code: number

  constructor(type: string) {
    super(`Asset of type '${type}' not supported`)
    this.name = 'AssetNotSupportedError'
    this.code = -32603
    captureStackTrace(this, this.constructor)
  }
}

// Follows various ARCs.
// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0001.md#error-standards
export class TooManyTransactionsError extends Error {
  code: number

  constructor() {
    super(
      'The wallet does not support signing that many transactions at a time.',
    )
    this.name = 'TooManyTransactionsError'
    this.code = 4201
    captureStackTrace(this, this.constructor)
  }
}

export class UnintializedWalletError extends Error {
  code: number

  constructor() {
    super('The wallet was not initialized properly beforehand.')
    this.name = 'UnintializedWalletError'
    this.code = 4202
    captureStackTrace(this, this.constructor)
  }
}

export class TransactionBroadcastError extends Error {
  code: number
  successTxnIDs: (string | null)[]

  constructor(successTxnIDs: (string | null)[]) {
    super('Some transactions were not sent properly.')
    this.name = 'TransactionBroadcastError'
    this.code = 4400
    this.successTxnIDs = successTxnIDs
    captureStackTrace(this, this.constructor)
  }
}

export class AlgorandInvalidInputError extends Error {
  code: number

  constructor() {
    super('The input provided is invalid.')
    this.name = 'AlgorandInvalidInputError'
    this.code = 4300
    captureStackTrace(this, this.constructor)
  }
}
