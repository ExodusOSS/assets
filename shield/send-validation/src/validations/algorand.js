import { algorandApi } from '@exodus/algorand-api'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createValidator from './createValidator.js'

export const algoAddressWhiteListed = createValidator({
  id: 'ALGO_ADDRESS_WHITELISTED',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset, destinationAddress, isExodusSharesAsset }) =>
    asset.assetType === 'ALGORAND_TOKEN' &&
    isExodusSharesAsset(asset.name) &&
    destinationAddress.trim(),
  isValid: async ({ asset, destinationAddress, isValidAddress }) => {
    return isValidAddress && algorandApi.isWhitelisted(destinationAddress, asset.name)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => 'EXOD can only be sent to an address that belongs to a Securitize user.',
  field: FIELDS.ADDRESS,
  link: 'https://support.exodus.com/article/1615-enter-the-exit#exit-send',
})

export const algoHasAddressOptedInValidator = createValidator({
  id: 'HAS_ADDRESS_OPT_IN',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset, destinationAddress, fetchingAddressDetails }) =>
    !fetchingAddressDetails && asset.assetType === 'ALGORAND_TOKEN' && destinationAddress.trim(),
  isValid: async ({ addressDetails }) => {
    return !!addressDetails.optedIn
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => 'The receiving wallet must opt-in to receive this asset.',
  field: FIELDS.ADDRESS,
})

export const algoDestEnoughValidator = createValidator({
  id: 'ALGO_DEST_ENOUGH',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset, destinationAddress }) =>
    asset.name === 'algorand' && destinationAddress.trim(),
  isValid: async ({ sendAmount, asset, addressDetails }) => {
    return addressDetails.hasMinBalance || sendAmount.isZero || sendAmount.gte(asset.accountReserve)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => `Destination account doesn't have minimum amount. Increase the sending amount.`,
  field: FIELDS.AMOUNT,
})
