import { t } from '@exodus/i18n-dummy'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const INSUFFICIENT_FUNDS = {
  id: 'INSUFFICIENT_FUNDS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: ({ availableBalance, sendAmount }) =>
    !sendAmount || (!availableBalance.isZero && availableBalance.gte(sendAmount)),

  getMessage: () => t('You have insufficient funds for this action.'),
  priority: PRIORITY_LEVELS.BASE,
  field: FIELDS.AMOUNT,
}

export default INSUFFICIENT_FUNDS
