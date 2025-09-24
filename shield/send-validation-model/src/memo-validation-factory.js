import { t } from '@exodus/i18n-dummy'
import assert from 'minimalistic-assert'

import { FIELDS, VALIDATION_TYPES } from './constants.js'
import createValidator from './create-validator.js'

const memoPublicWarning = createValidator({
  id: 'MEMO_IS_PUBLIC_WARNING',
  type: VALIDATION_TYPES.WARN,
  field: FIELDS.MEMO,
  validateAndGetMessage: async ({ destinationAddress, memo }) => {
    if (destinationAddress && memo) {
      return t('Your public memo can be seen on the blockchain by anyone.')
    }
  },
})

export const createMemoValidations = ({
  isPublicMemo,
  validateAndGetMessage,
  isValidMemo,
  errorMessage,
}) => {
  assert(validateAndGetMessage || isValidMemo, `validateAndGetMessage or isValidMemo is required!`)
  const defaultValidateAndGetMessage = async ({ destinationAddress, memo }) => {
    if (destinationAddress && memo && !isValidMemo(memo)) {
      return errorMessage ?? t('The memo you entered is too long.')
    }
  }

  const memoIsValid = createValidator({
    id: 'MEMO_IS_VALID',
    field: FIELDS.MEMO,
    validateAndGetMessage: validateAndGetMessage ?? defaultValidateAndGetMessage,
  })

  return [memoIsValid, isPublicMemo ? memoPublicWarning : undefined].filter(Boolean)
}
