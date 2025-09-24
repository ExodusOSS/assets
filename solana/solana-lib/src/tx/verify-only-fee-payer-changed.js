import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID } from '../helpers/spl-token.js'
import { SYSVAR_RENT_PUBKEY } from '../vendor/index.js'

export function verifyOnlyFeePayerChanged(beforeTx, afterTx) {
  assert(
    beforeTx.signatures.length + 1 === afterTx.signatures.length &&
      beforeTx.message.header.numRequiredSignatures + 1 ===
        afterTx.message.header.numRequiredSignatures,
    'A signature was not added for the new signer'
  )
  beforeTx.signatures.forEach((signature, index) => {
    assert(
      lodash.isEqual(signature, afterTx.signatures[index + 1]),
      'Existing signatures do not match'
    )
  })
  assert(
    beforeTx.message.accountKeys.length + 1 === afterTx.message.accountKeys.length,
    'Fee payer account key was not added'
  )
  assert(
    beforeTx.message.accountKeys.every(
      (beforeAccountKey) => !lodash.isEqual(beforeAccountKey, afterTx.message.accountKeys[0])
    ),
    'Fee payer account key was not added'
  )
  beforeTx.message.accountKeys.forEach((accountKey, index) => {
    assert(
      afterTx.message.accountKeys.some((afterAccountKey) =>
        lodash.isEqual(accountKey, afterAccountKey)
      ),
      'Existing account keys do not match'
    )
  })

  assert(
    beforeTx.message.instructions.length === afterTx.message.instructions.length,
    'No new instructions are allowed'
  )

  beforeTx.message.instructions.forEach(({ programIdIndex }, index) => {
    assert(
      lodash.isEqual(
        beforeTx.message.accountKeys[beforeTx.message.instructions[index].programIdIndex],
        afterTx.message.accountKeys[afterTx.message.instructions[index]?.programIdIndex]
      ),
      'Instructions program ids were not updated'
    )
  })

  beforeTx.message.instructions.forEach(({ accounts }, index) => {
    const programId =
      beforeTx.message.accountKeys[beforeTx.message.instructions[index].programIdIndex].toString()
    const isATAProgram =
      programId === TOKEN_PROGRAM_ID.toString() ||
      programId === TOKEN_2022_PROGRAM_ID.toString() ||
      programId === ASSOCIATED_TOKEN_PROGRAM_ID.toString()
    const accountsPublicKeys = accounts.map((id) => beforeTx.message.accountKeys[id])
    const containsRentSysvar = accountsPublicKeys.some(
      (publicKey) => publicKey.toString() === SYSVAR_RENT_PUBKEY.toString()
    )

    const afterAccountsPublicKeys = afterTx.message.instructions[index].accounts.map(
      (id) => afterTx.message.accountKeys[id]
    )

    if (containsRentSysvar && isATAProgram) {
      const adjustedAccountsPublicKeys = [...accountsPublicKeys]
      adjustedAccountsPublicKeys[0] = afterTx.message.accountKeys[0] // replace with the new fee payer
      assert(
        lodash.isEqual(adjustedAccountsPublicKeys, afterAccountsPublicKeys),
        'Instructions account key indexes were not updated'
      )
    } else {
      assert(
        lodash.isEqual(accountsPublicKeys, afterAccountsPublicKeys),
        'Instructions account key indexes were not updated'
      )
    }
  })

  beforeTx.message.instructions.forEach((instruction, index) => {
    assert(
      lodash.isEqual(
        { ...instruction, accounts: null, programIdIndex: null },
        {
          ...afterTx.message.instructions[index],
          accounts: null,
          programIdIndex: null,
        }
      ),
      'Instructions do not match in some attributes'
    )
  })

  afterTx.message.indexToProgramIds.forEach((value, key) => {
    assert(afterTx.message.accountKeys[key] === value, 'IndexToProgramIds do not match accountKeys')
  })

  assert(
    lodash.isEqual(
      {
        ...beforeTx,
        signatures: null,
        message: null,
      },
      {
        ...afterTx,

        signatures: null,
        message: null,
      }
    ),
    'Transactions do not match in some attributes'
  )

  assert(
    lodash.isEqual(
      {
        ...beforeTx.message,
        header: { ...beforeTx.message.header, numRequiredSignatures: null },
        accountKeys: null,
        instructions: null,
        indexToProgramIds: null,
      },
      {
        ...afterTx.message,
        header: { ...afterTx.message.header, numRequiredSignatures: null },
        accountKeys: null,
        instructions: null,
        indexToProgramIds: null,
      }
    ),
    'Transactions do not match in some attributes'
  )
}
