import { t } from '@exodus/i18n-dummy'

import { CAN_SEND_ZERO_AMOUNT, FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const ZERO_AMOUNT = {
  id: 'ZERO_AMOUNT',
  type: VALIDATION_TYPES.ERROR,

  isValid: ({ sendAmount }) => Boolean(sendAmount && !sendAmount.isZero),

  shouldValidate: ({ asset, destinationAddress, sendAmount }) =>
    sendAmount && !CAN_SEND_ZERO_AMOUNT.includes(asset.name) && !!destinationAddress,

  getMessage: ({ asset }) => t(`${asset.displayName} doesn't allow sending zero.`),
  field: FIELDS.AMOUNT,
  priority: PRIORITY_LEVELS.BASE,
}

export default ZERO_AMOUNT
