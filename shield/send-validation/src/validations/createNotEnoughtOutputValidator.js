import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const createNotEnoughtOutputValidator = ({ getMinAmount, ...rest }) => ({
  id: 'NOT_ENOUGH_OUTPUT',
  type: VALIDATION_TYPES.ERROR,
  priority: PRIORITY_LEVELS.MIDDLE,
  field: FIELDS.AMOUNT,
  shouldValidate: ({ asset }) => !!getMinAmount({ asset }),
  isValid: ({ sendAmount, asset }) =>
    !sendAmount || sendAmount.isZero || sendAmount.gte(getMinAmount({ asset })),
  ...rest,
})

export default createNotEnoughtOutputValidator
