import { t } from '@exodus/i18n-dummy'
import sendValidationModel from '@exodus/send-validation-model'

import { getSendDustValue as getDustValue } from './dust.js'

const { createValidator, FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } = sendValidationModel

const bip70Validator = createValidator({
  id: 'BIP70',
  type: VALIDATION_TYPES.ERROR,
  priority: PRIORITY_LEVELS.MIDDLE,
  field: FIELDS.ADDRESS,
  shouldValidate: ({ bip70 }) => !!bip70,
  isValid: async ({ bip70 }) => !bip70.isInvalid(),
  getMessage: () => t(`The payment request is invalid.`),
})

const bcnLegacyAddressValidator = createValidator({
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
    t(
      'Are you sure you want to send Bitcoin Cash (BCH) using an old address format? Did you check to make sure you are not sending to a Bitcoin (BTC) address?\n\nMixing BCH and BTC addresses can result in a loss of funds.'
    ),
})

const notEnoughOutputValidator = createValidator({
  id: 'NOT_ENOUGH_OUTPUT',
  type: VALIDATION_TYPES.ERROR,
  priority: PRIORITY_LEVELS.MIDDLE,
  field: FIELDS.AMOUNT,
  shouldValidate: ({ asset }) => !!getDustValue(asset),
  isValid: ({ sendAmount, asset }) =>
    !sendAmount || sendAmount.isZero || sendAmount.gte(getDustValue(asset)),
  getMessage: ({ asset, getFiatValue, formatPrice }) => {
    const dust = getDustValue(asset)
    const dustValue =
      formatPrice(getFiatValue(dust)) + ' (' + dust.toBaseString({ unit: true }) + ')'

    return t(`Sending ${dustValue} or less isn't supported on the ${asset.displayName} network`)
  },
})

const bitcoinCpfpWarning = createValidator({
  id: 'BITCOIN_CPFP_WARNING',
  type: VALIDATION_TYPES.WARN,
  shouldValidate: ({ fees, getFiatValue, formatPrice, fiatCurrencies }) =>
    fees && getFiatValue && formatPrice && fiatCurrencies,
  isValid: ({ fees, getFiatValue, fiatCurrencies }) => {
    const type = fees?.extraFeeData?.type
    const extraFee = fees?.extraFeeData?.extraFee

    if (!extraFee || extraFee?.isZero) {
      return true
    }

    const usdValue = getFiatValue(extraFee, fiatCurrencies.USD)
    if (usdValue.toBaseNumber() < 1) {
      return true
    }

    return type !== 'cpfp' && type !== 'cpfpdust'
  },
  getMessage: ({ formatPrice, getFiatValue, fees }) => {
    const extraFee = fees.extraFeeData.extraFee
    const extraFeeDisplayValue = formatPrice(getFiatValue(extraFee))
    return t(
      `You're paying ${extraFeeDisplayValue} in extra fees for spending unconfirmed transactions (CPFP).`
    )
  },
})

export default [
  bitcoinCpfpWarning,
  bip70Validator,
  bcnLegacyAddressValidator,
  notEnoughOutputValidator,
]
