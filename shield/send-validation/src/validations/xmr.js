import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createValidator from './createValidator.js'

export const newXmrUnconfirmedBalanceValidator = createValidator({
  id: 'UNCONFIRMED_BALANCE_WARN',
  type: VALIDATION_TYPES.WARN,
  shouldValidate: ({ asset }) => asset.name === 'monero',
  isValid: async ({ assetHasUnconfirmedBalance }) => {
    return !assetHasUnconfirmedBalance
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) =>
    `Note: Your total ${asset.displayName} is unavailable to send until it confirms.`,
  field: FIELDS.ADDRESS,
})
