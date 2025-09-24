import { t } from '@exodus/i18n-dummy'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const FUEL_THRESHOLD = {
  id: 'FUEL_THRESHOLD',
  type: VALIDATION_TYPES.WARN,

  shouldValidate: ({ asset, requiresFuelThreshold, fuelThreshold }) =>
    Boolean(asset.name === asset.feeAsset.name && requiresFuelThreshold && fuelThreshold),

  isValid: ({ availableBalance, sendAmount, fuelThreshold }) => {
    const remainingBalance = (
      sendAmount ? availableBalance.sub(sendAmount) : availableBalance
    ).clampLowerZero()
    return remainingBalance.gte(fuelThreshold)
  },

  priority: PRIORITY_LEVELS.BASE,
  getMessage: ({ asset, fuelThreshold }) =>
    t(
      `You have tokens that require ${
        asset.displayName
      } to send or swap. Less than ${fuelThreshold.toDefaultString({ unit: true })} will remain.`
    ),
  field: FIELDS.AMOUNT,
}

export default FUEL_THRESHOLD
