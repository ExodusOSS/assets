import lodash from 'lodash'

import { verifyOnlyFeePayerChanged } from '../tx/verify-only-fee-payer-changed.js'
import {
  VERSIONED_TRANSACTION_LEGACY,
  VERSIONED_TRANSACTION_LEGACY_ATA,
  VERSIONED_TRANSACTION_LEGACY_ATA_NEW_FEE_PAYER,
  VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER,
} from './fixtures.js'

describe('.verifyOnlyFeePayerChanged()', () => {
  it('should not throw if only fee payer changed', async () => {
    expect(() =>
      verifyOnlyFeePayerChanged(
        VERSIONED_TRANSACTION_LEGACY,
        VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER
      )
    ).not.toThrow()

    expect(() =>
      verifyOnlyFeePayerChanged(
        VERSIONED_TRANSACTION_LEGACY_ATA,
        VERSIONED_TRANSACTION_LEGACY_ATA_NEW_FEE_PAYER
      )
    ).not.toThrow()
  })

  it('should throw if number of signatures is incorrect', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.signatures = [tx1.signatures[0]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'A signature was not added for the new signer'
    )

    const tx2 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx2.signatures = [tx2.signatures[1]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx2)).toThrow(
      'A signature was not added for the new signer'
    )

    const tx3 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx3.message.header.numRequiredSignatures = tx3.message.header.numRequiredSignatures - 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx3)).toThrow(
      'A signature was not added for the new signer'
    )
  })

  it('should throw if existing signatures do not match', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.signatures = [tx1.signatures[0], tx1.signatures[0]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Existing signatures do not match'
    )
  })

  it('should throw if number of account keys is incorrect', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.message.accountKeys = [tx1.message.accountKeys[0]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Fee payer account key was not added'
    )
  })

  it('should throw if existing account keys do not match', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.message.accountKeys = [...tx1.message.accountKeys.slice(0, -1), tx1.message.accountKeys[0]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Existing account keys do not match'
    )
  })

  it('should throw if instruction program ids are not updated', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.message.instructions[0].programIdIndex = tx1.message.instructions[0].programIdIndex - 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Instructions program ids were not updated'
    )
  })

  it('should throw if instruction account indexes are not updated', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.message.instructions[2].accounts = tx1.message.instructions[2].accounts.map((id) => id - 1)

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Instructions account key indexes were not updated'
    )
  })

  it('should throw if instructions do not match in other ways', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.message.instructions[2].test = 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Instructions do not match in some attributes'
    )

    const tx2 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx2.message.instructions = [tx2.message.instructions[0]]

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx2)).toThrow(
      'No new instructions are allowed'
    )
  })

  it('should throw if transactions do not match in other ways', async () => {
    const tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1.test = 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx1)).toThrow(
      'Transactions do not match in some attributes'
    )

    const tx2 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx2.message.test = 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx2)).toThrow(
      'Transactions do not match in some attributes'
    )

    const tx3 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx3.message.recentBlockhash = 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx3)).toThrow(
      'Transactions do not match in some attributes'
    )

    const tx4 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx4.message.header.test = 1

    expect(() => verifyOnlyFeePayerChanged(VERSIONED_TRANSACTION_LEGACY, tx4)).toThrow(
      'Transactions do not match in some attributes'
    )
  })
})
