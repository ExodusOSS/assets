import { t } from '@exodus/i18n-dummy'
import assert from 'minimalistic-assert'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from './constants.js'

export const createAccountReserveValidatorFactory = ({ getAddressDetails }) => {
  assert(getAddressDetails, 'getAddressDetails is required')

  return {
    id: 'ACCOUNT_RESERVE',
    type: VALIDATION_TYPES.ERROR,
    priority: PRIORITY_LEVELS.MIDDLE,
    field: FIELDS.AMOUNT,
    validateAndGetMessage: async ({ asset, sendAmount, destinationAddress }) => {
      if (!destinationAddress || !sendAmount) {
        return
      }

      const { isNewAddress, accountReserve } = await getAddressDetails({
        asset,
        destinationAddress,
      })

      if (isNewAddress && accountReserve && !sendAmount.gte(accountReserve)) {
        return t(
          `Sending to a new ${
            asset.displayName
          } account requires at least ${accountReserve.toDefaultString()} ${
            asset.displayTicker
          } to open the account.`
        )
      }
    },
  }
}
