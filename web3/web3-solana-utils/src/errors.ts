export class VersionedTransactionUnsupportedError extends Error {
  constructor() {
    super('Versioned transactions are not supported.')
    this.name = 'VERSIONED_TRANSACTION_UNSUPPORTED'
  }
}
