import { getDustValue } from '@exodus/bitcoin-api'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createNotEnoughtOutputValidator from './createNotEnoughtOutputValidator.js'
import createValidator from './createValidator.js'

export const bip70Validator = createValidator({
  id: 'BIP70',
  type: VALIDATION_TYPES.ERROR,
  priority: PRIORITY_LEVELS.MIDDLE,
  field: FIELDS.ADDRESS,
  shouldValidate: ({ bip70 }) => !!bip70,
  isValid: async ({ bip70 }) => !bip70.isInvalid(),
  getMessage: () => 'The payment request is invalid.',
})

export const bitcoinAddressPurposeValidator = createValidator({
  id: 'BTC_ADDRESS_PURPOSE',
  type: VALIDATION_TYPES.WARN,
  priority: PRIORITY_LEVELS.BASE,
  field: FIELDS.ADDRESS,
  shouldValidate: ({ asset }) => asset.assetType === 'BRC20_TOKEN',
  isValid: async ({ asset, destinationAddress }) => {
    const baseAsset = asset.baseAsset

    const isAddressValid = await baseAsset.address.validate(destinationAddress)
    const addressPurpose = await baseAsset.address.resolvePurpose(destinationAddress)
    const isTaprootAddress = addressPurpose === 86

    return isAddressValid && isTaprootAddress
  },
  getMessage: () => 'Use a Bitcoin Taproot address to send BRC-20 tokens.',
})

export const bcnLegacyAddressValidator = createValidator({
  type: VALIDATION_TYPES.WARN,
  priority: PRIORITY_LEVELS.BASE,
  field: FIELDS.ADDRESS,
  id: 'BCN_LEGACY_ADDRESS',
  shouldValidate: ({ asset }) => asset.ticker === 'BCH',
  isValid: async ({ asset, destinationAddress }) => {
    return (
      !destinationAddress ||
      (asset.address.validate(destinationAddress) &&
        !asset.address.isLegacyAddress(destinationAddress))
    )
  },
  getMessage: () =>
    'Are you sure you want to send Bitcoin Cash (BCH) using an old address format? Did you check to make sure you are not sending to a Bitcoin (BTC) address?\\n\\nMixing BCH and BTC addresses can result in a loss of funds.',
})

export const notEnoughOutputValidator = createNotEnoughtOutputValidator({
  getMinAmount: ({ asset }) => getDustValue(asset),
})
