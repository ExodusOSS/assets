import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const ZERO_AMOUNT = {
  id: 'ZERO_AMOUNT',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: ({ sendAmount }) => Boolean(sendAmount && !sendAmount.isZero),

  priority: PRIORITY_LEVELS.BASE,
}

export default ZERO_AMOUNT
