import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const createLowRemainingBalanceValidator = ({ shouldValidate, getMinAmount, ...rest }) => ({
  id: 'LOW_REMAINING_BALANCE',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate,

  isValid: ({ availableBalance, sendAmount, asset }) =>
    !sendAmount ||
    availableBalance.sub(sendAmount).isZero ||
    availableBalance.sub(sendAmount).gte(getMinAmount({ asset })),

  priority: PRIORITY_LEVELS.BASE,

  ...rest,
})

export default createLowRemainingBalanceValidator
