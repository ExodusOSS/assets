import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const INVALID_ADDRESS = {
  id: 'INVALID_ADDRESS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: async ({ asset, destinationAddress }) => asset.address.validate(destinationAddress),

  priority: PRIORITY_LEVELS.BASE,
}

export default INVALID_ADDRESS
