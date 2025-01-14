import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

// if fee is paid with a different asset
const BASE_ASSET_INSUFFICIENT_FUNDS = {
  id: 'BASE_ASSET_INSUFFICIENT_FUNDS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: ({ asset }) => asset.name !== asset.feeAsset.name,

  isValid: ({ isFeeAssetEnough }) => isFeeAssetEnough,

  priority: PRIORITY_LEVELS.BASE,
}

export default BASE_ASSET_INSUFFICIENT_FUNDS
