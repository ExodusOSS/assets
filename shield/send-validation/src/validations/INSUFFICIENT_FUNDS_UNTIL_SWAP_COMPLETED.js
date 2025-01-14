import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED = {
  id: 'INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: ({ availableBalance, hasIncomingOrders }) => {
    const zeroBalanceAndHasIncomingOrders = availableBalance.isZero && hasIncomingOrders
    return !zeroBalanceAndHasIncomingOrders
  },

  priority: PRIORITY_LEVELS.MIDDLE,
}

export default INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED
