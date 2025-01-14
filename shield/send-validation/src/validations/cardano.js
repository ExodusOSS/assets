import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createNotEnoughtOutputValidator from './createNotEnoughtOutputValidator.js'
import createValidator from './createValidator.js'

export const adaNotEnoughOutputValidator = createNotEnoughtOutputValidator({
  id: 'ADA_NOT_ENOUGH_OUTPUT',
  shouldValidate: ({ asset }) => asset.name === 'cardano',
  getMinAmount: ({ asset }) => asset.MIN_OUTPUT_AMOUNT,
})

export const adaRemainingBalanceValidator = createValidator({
  id: 'ADA_REMAINING_BALANCE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset }) => asset.assetType === 'CARDANO_TOKEN' || asset.name === 'cardano',
  isValid: async ({ asset, sendAmount, baseAssetBalance, feeAmount, remainingBalance }) => {
    const remainingAdaBalance =
      asset.name === 'cardano' ? remainingBalance : baseAssetBalance.sub(feeAmount)

    const notEnoughAdaRemainingBalance =
      !sendAmount.isZero &&
      remainingAdaBalance.isPositive &&
      remainingAdaBalance.lt(asset.baseAsset.MIN_OUTPUT_AMOUNT)

    return !notEnoughAdaRemainingBalance
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset: { baseAsset } }) =>
    `Your ${
      baseAsset.displayTicker
    } remaining balance will be less than ${baseAsset.MIN_OUTPUT_AMOUNT.toDefaultString()} ${
      baseAsset.displayTicker
    }. The Cardano network doesn't allow sending amounts less than ${baseAsset.MIN_OUTPUT_AMOUNT.toDefaultString()} ${
      baseAsset.displayTicker
    }.`,
  field: FIELDS.AMOUNT,
})

export const adaNotEnoughFeeValidator = createValidator({
  id: 'ADA_NOT_ENOUGH_FEE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset }) => asset.assetType === 'CARDANO_TOKEN',
  isValid: async ({ confirmedBalance, baseAssetBalance, feeAmount }) => {
    return feeAmount.lt(confirmedBalance.cardano) && feeAmount.lt(baseAssetBalance)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ feeAmount, asset: { feeAsset } }) =>
    `To make a transaction, you need at least ${feeAmount.toDefaultString()} ${
      feeAsset.displayTicker
    } confirmed utxo amount.`,
  field: FIELDS.ADDRESS,
})

export const adaUnconfirmedBalanceValidator = createValidator({
  id: 'ADA_UNCONFIRMED_BALANCE',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset }) => asset.assetType === 'CARDANO_TOKEN' || asset.name === 'cardano',
  isValid: async ({ assetHasUnconfirmedBalance }) => {
    return !assetHasUnconfirmedBalance
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) =>
    `Please wait for the latest ${asset.displayName} transaction to confirm.`,
  field: FIELDS.ADDRESS,
})
