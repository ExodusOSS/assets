import { t } from '@exodus/i18n-dummy'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED = {
  id: 'INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: ({ availableBalance, hasIncomingOrders }) => {
    const zeroBalanceAndHasIncomingOrders = availableBalance.isZero && hasIncomingOrders
    return !zeroBalanceAndHasIncomingOrders
  },

  getMessage: () => t('Wait for it to complete to send these funds.'),

  field: FIELDS.AMOUNT,
  priority: PRIORITY_LEVELS.MIDDLE,
}

export default INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED
