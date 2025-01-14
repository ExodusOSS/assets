import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const INSUFFICIENT_FUNDS = {
  id: 'INSUFFICIENT_FUNDS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: ({ availableBalance, sendAmount }) =>
    !sendAmount || (!availableBalance.isZero && availableBalance.gte(sendAmount)),

  priority: PRIORITY_LEVELS.BASE,
}

export default INSUFFICIENT_FUNDS
