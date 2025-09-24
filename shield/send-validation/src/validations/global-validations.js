import { t } from '@exodus/i18n-dummy'

import {
  ASSETS_WITHOUT_SELF_SEND,
  FIELDS,
  PRIORITY_LEVELS,
  VALIDATION_TYPES,
} from '../constants.js'
import BASE_ASSET_INSUFFICIENT_FUNDS from './BASE_ASSET_INSUFFICIENT_FUNDS.js'
import FUEL_THRESHOLD from './FUEL_THRESHOLD.js'
import INSUFFICIENT_FUNDS from './INSUFFICIENT_FUNDS.js'
import INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED from './INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED.js'
import INVALID_ADDRESS from './INVALID_ADDRESS.js'
import ZERO_AMOUNT from './ZERO_AMOUNT.js'

const canSelfSendValidator = {
  id: 'CAN_SELF_SEND',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ isTransfer, isSelfSend, destinationAddress }) =>
    destinationAddress !== '' && !isTransfer && isSelfSend,
  isValid: async ({ asset }) => {
    return !ASSETS_WITHOUT_SELF_SEND.includes(asset.baseAsset.name)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) => t(`You cannot send funds to your own ${asset.displayName} address.`),
  field: FIELDS.ADDRESS,
}

const accountPermissionsValidator = {
  id: 'ACCOUNT_PERMISSIONS',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: () => true,
  isValid: async ({ noPermission }) => !noPermission,
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) =>
    t(
      `Assets in this ${asset.displayName} wallet are locked and cannot be sent or withdrawn. Only import and use wallets you trust.`
    ),
  field: FIELDS.ADDRESS,
}

const notEnoughBalanceValidator = {
  id: 'NOT_ENOUGH_BALANCE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ sendReserveInfo, sendAmount }) =>
    Boolean(sendReserveInfo) && Boolean(sendAmount),
  isValid: async ({ sendReserveInfo, sendAmount, availableBalance }) => {
    if (!sendReserveInfo.canSend) {
      return sendAmount.lte(availableBalance) && sendReserveInfo.error !== 'NOT_ENOUGH_FEE'
    }

    return sendAmount.lte(sendReserveInfo.amount)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) =>
    t(`This amount is over your ${asset.displayName} balance. Lower it and try again.`),
  field: FIELDS.AMOUNT,
}

const readonlyWalletValidation = {
  id: 'READONLY_WALLET',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ isReadOnly }) => Boolean(isReadOnly),
  isValid: async ({ isReadOnly, fromWalletAccount }) => {
    return !isReadOnly(fromWalletAccount)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => t('You cannot send from a view-only portfolio.'),
  field: FIELDS.ADDRESS,
}

const isNetworkOfflineValidation = {
  id: 'NETWORK_OFFLINE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: () => true,
  isValid: async ({ isNetworkOffline }) => {
    return !isNetworkOffline
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => t('You need an active internet connection to start a transfer.'),
  field: FIELDS.ADDRESS,
}

const isSelfSendValidator = {
  id: 'SELF_SEND_WARN',
  type: VALIDATION_TYPES.WARN,
  shouldValidate: ({ destinationAddress }) => !!destinationAddress,
  isValid: async ({ isSelfSend }) => {
    return !isSelfSend
  },
  priority: PRIORITY_LEVELS.BASE,
  getMessage: () => t('Warning: You are sending to your own address.'),
  field: FIELDS.ADDRESS,
}

const sendReserveValidator = {
  id: 'SEND_RESERVE_WARN',
  type: VALIDATION_TYPES.WARN,
  priority: PRIORITY_LEVELS.BASE,
  field: FIELDS.AMOUNT,
  validateAndGetMessage: async ({ sendReserveInfo, destinationAddress, asset }) => {
    if (!sendReserveInfo?.canSend) {
      return
    }

    if (!(await asset.baseAsset.address.validate(destinationAddress))) {
      return
    }

    return t(
      `The ${
        asset.displayName
      } network has built-in rules on minimum balances, to send your remaining balance the ${
        asset.displayName
      } network will charge a ${asset.accountDeleteFee.toDefaultString()} ${
        asset.displayTicker
      } fee.`
    )
  },
}

const taxWarningValidator = {
  id: 'TAX_WARNING',
  type: VALIDATION_TYPES.WARN,
  shouldValidate: ({ fees, getFiatValue, formatPrice, fiatCurrencies }) =>
    fees && getFiatValue && formatPrice && fiatCurrencies,
  isValid: ({ fees, getFiatValue, fiatCurrencies }) => {
    const extraFee = fees?.extraFeeData?.extraFee

    if (!extraFee || extraFee?.isZero) {
      return true
    }

    const usdValue = getFiatValue(extraFee, fiatCurrencies.USD)
    if (usdValue.toBaseNumber() < 1) {
      return true
    }

    return fees?.extraFeeData?.type !== 'tax'
  },

  getMessage: ({ formatPrice, getFiatValue, fees }) => {
    const extraFee = fees.extraFeeData.extraFee
    const extraFeeDisplayValue = formatPrice(getFiatValue(extraFee))
    return t(`You're paying ${extraFeeDisplayValue} extra fees in taxes.`)
  },
}

export default [
  notEnoughBalanceValidator,
  readonlyWalletValidation,
  isNetworkOfflineValidation,
  accountPermissionsValidator,
  canSelfSendValidator,
  isSelfSendValidator,
  sendReserveValidator,
  taxWarningValidator,
  BASE_ASSET_INSUFFICIENT_FUNDS,
  FUEL_THRESHOLD,
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_FUNDS_UNTIL_SWAP_COMPLETED,
  INVALID_ADDRESS,
  ZERO_AMOUNT,
]
