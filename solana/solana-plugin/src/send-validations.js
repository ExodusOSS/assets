import { memoizeLruCache } from '@exodus/asset-lib'
import { t } from '@exodus/i18n-dummy'
import sendValidationModel from '@exodus/send-validation-model'
import ms from 'ms'

const { createValidator, FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } = sendValidationModel

const sendValidationsFactory = ({ api, assetName, assetClientInterface }) => {
  const getAccountInfoCached = memoizeLruCache(
    async (destinationAddress) => {
      const [addressType, targetMint] = await Promise.all([
        api.getAddressType(destinationAddress),
        api.getAddressMint(destinationAddress),
      ])
      return {
        addressType, // token, solana, null (never initialized)
        targetMint, // null if it's a SOL address
      }
    },
    (destinationAddress) => destinationAddress,
    { maxAge: ms('60s') }
  )

  // cannot send SOL to token Address
  const solanaAddressTypeValidator = createValidator({
    id: 'WRONG_ADDRESS_TYPE',
    type: VALIDATION_TYPES.ERROR,
    field: FIELDS.ADDRESS,
    priority: PRIORITY_LEVELS.BASE,
    validateAndGetMessage: async ({ asset, destinationAddress }) => {
      if (!destinationAddress) {
        return
      }

      const addressDetails = await getAccountInfoCached(destinationAddress)
      if (addressDetails.addressType === 'token') {
        return t(
          `The Solana network doesn't allow sending ${asset.displayTicker} to a Token Account address.`
        )
      }
    },
  })

  // cannot send token X to a different target account address (token Y)
  const solanaMintAddressValidator = createValidator({
    id: 'ADDRESS_MINT_MISMATCH',
    type: VALIDATION_TYPES.ERROR,
    priority: PRIORITY_LEVELS.MIDDLE,
    field: FIELDS.ADDRESS,
    validateAndGetMessage: async ({ asset, destinationAddress }) => {
      if (asset.assetType !== 'SOLANA_TOKEN' || !destinationAddress) {
        return
      }

      const addressDetails = await getAccountInfoCached(destinationAddress)
      if (!addressDetails) {
        return
      }

      const isMismatch =
        addressDetails.targetMint && asset.mintAddress !== addressDetails.targetMint
      if (isMismatch) {
        return t(
          `Destination Wallet is not a ${asset.baseAsset.displayName} ${asset.displayTicker} address.`
        )
      }
    },
  })

  const solanaRentExemptAmountValidator = createValidator({
    id: 'SOL_RENT_EXEMPT_AMOUNT',
    type: VALIDATION_TYPES.ERROR,
    shouldValidate: ({ asset, sendAmount }) => sendAmount,
    isValid: async ({ asset, destinationAddress, sendAmount, baseAssetBalance, feeAmount }) => {
      if (!destinationAddress || !sendAmount || sendAmount.isZero) {
        return true
      }

      const rentExemptValue = await api.getRentExemptionMinAmount(destinationAddress)
      const rentExemptAmount = asset.baseAsset.currency.baseUnit(rentExemptValue)

      // differentiate between SOL and Solana token
      let isEnoughForRent
      if (asset.name === asset.baseAsset.name) {
        // sending SOL
        isEnoughForRent = sendAmount.gte(rentExemptAmount)
      } else {
        // sending token
        isEnoughForRent = baseAssetBalance
          .sub(feeAmount || asset.feeAsset.currency.ZERO)
          .gte(rentExemptAmount)
      }

      return isEnoughForRent
    },
    priority: PRIORITY_LEVELS.MIDDLE,

    getMessage: () => t(`Amount too low. Send at least 0.002 SOL to cover network fees.`), // hardcoded rent exempt amount, will be refactored once we have a better solution to return async calls

    field: FIELDS.ADDRESS,
  })

  const solanaRentExemptAmountSenderValidator = {
    id: 'SOL_RENT_EXEMPT_AMOUNT_SENDER',
    type: VALIDATION_TYPES.ERROR,
    priority: PRIORITY_LEVELS.MIDDLE,
    field: FIELDS.ADDRESS,
    validateAndGetMessage: async ({
      asset,
      sendAmount,
      fees,
      spendableBalance,
      fromWalletAccount,
    }) => {
      if (
        !sendAmount ||
        asset.name !== assetName ||
        !fees ||
        !spendableBalance ||
        !fromWalletAccount
      ) {
        return
      }

      const accountState = await assetClientInterface.getAccountState({
        assetName,
        walletAccount: fromWalletAccount.toString(),
      })

      if (!accountState?.rentExemptAmount) {
        return
      }

      const rentExemptAmount = accountState.rentExemptAmount
      const remaining = spendableBalance.sub(fees.fee).sub(sendAmount)

      if (!remaining.isZero && remaining.lt(rentExemptAmount)) {
        return t(
          `You can either leave a zero balance, which will close your SOL account, or maintain a minimum balance of ${accountState.rentExemptAmount.toDefaultString()} ${asset.displayTicker} to keep it active.`
        )
      }
    },
  }

  const solanaPayValidator = createValidator({
    id: 'SOLANA_PAY',
    type: VALIDATION_TYPES.ERROR,
    shouldValidate: ({ solanaPayInfo }) => !!(solanaPayInfo?.recipient || solanaPayInfo?.link),
    isValid: async ({ solanaPayInfo }) => !(solanaPayInfo.recipient || solanaPayInfo.link),
    priority: PRIORITY_LEVELS.MIDDLE,
    getMessage: () => t(`Please use Solana Pay feature to scan this QRCode.`),
    field: FIELDS.ADDRESS,
  })
  return [
    solanaAddressTypeValidator,
    solanaMintAddressValidator,
    solanaRentExemptAmountValidator,
    solanaPayValidator,
    solanaRentExemptAmountSenderValidator,
  ]
}

export default sendValidationsFactory
