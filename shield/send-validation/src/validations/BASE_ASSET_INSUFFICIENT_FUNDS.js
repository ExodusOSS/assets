import { t } from '@exodus/i18n-dummy'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

// if fee is paid with a different asset
const BASE_ASSET_INSUFFICIENT_FUNDS = {
  id: 'BASE_ASSET_INSUFFICIENT_FUNDS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: ({ asset, nft }) => asset.name !== asset.feeAsset.name || Boolean(nft),

  isValid: ({ isFeeAssetEnough }) => isFeeAssetEnough,

  priority: PRIORITY_LEVELS.BASE,
  getMessage: ({ asset }) =>
    t(`You have insufficient ${asset.baseAsset.displayTicker} to pay for this transaction’s fee.`),

  field: FIELDS.AMOUNT,
}

export default BASE_ASSET_INSUFFICIENT_FUNDS
