import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createValidator from './createValidator.js'

const createWrongAddressTypeValidator = ({ shouldValidate, wrongAddressType = 'token', ...rest }) =>
  createValidator({
    id: 'WRONG_ADDRESS_TYPE',
    type: VALIDATION_TYPES.ERROR,
    field: FIELDS.ADDRESS,

    shouldValidate,

    isValid: ({ addressDetails }) =>
      addressDetails && addressDetails.addressType !== wrongAddressType,

    priority: PRIORITY_LEVELS.BASE,

    ...rest,
  })

export default createWrongAddressTypeValidator
