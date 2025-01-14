import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

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
}

export default FUEL_THRESHOLD
