import * as xrpLib from '@exodus/ripple-lib'
import { ADDRESSES_NOT_SUPPORT_DELETE } from '@exodus/ripple-lib/src/common/constants'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createValidator from './createValidator.js'

export const xrpTooEarlyToDeleteValidator = createValidator({
  id: 'XRP_TOO_EARLY_TO_DELETE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset, addressDetails }) => asset.name === 'ripple' && !!addressDetails,
  isValid: async ({ addressDetails, xrpAccountCreatedTx }) => {
    const { latestBlockHeight } = addressDetails

    if (!latestBlockHeight || !xrpAccountCreatedTx) {
      return true
    }

    const count = latestBlockHeight - xrpAccountCreatedTx.data.blockHeight
    const adjustment = 1.1
    const remainingCount = xrpLib.DELETE_ACCOUNT_MIN_BLOCKS * adjustment - count

    return remainingCount <= 0
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () =>
    `The XRP network doesn't allow sending your minimum balance early after your first deposit. Please try again in a few minutes.`,
  field: FIELDS.AMOUNT,
})

export const xrpDeleteAccountNotSupportedValidator = createValidator({
  id: 'XRP_DELETE_ACCOUNT_NOT_SUPPORTED',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset, sendReserveInfo, destinationAddress }) =>
    asset.name === 'ripple' && sendReserveInfo.canSend && destinationAddress,
  isValid: async ({ destinationAddress }) => {
    return !ADDRESSES_NOT_SUPPORT_DELETE.includes(destinationAddress)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => `Sending your remaining XRP balance is not supported by this swap.`,
  field: FIELDS.AMOUNT,
})
