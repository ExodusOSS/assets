import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'
import createValidator from './createValidator.js'
import createWrongAddressTypeValidator from './createWrongAddressTypeValidator.js'

// cannot send SOL to token Address
export const solanaAddressTypeValidator = createWrongAddressTypeValidator({
  shouldValidate: ({ asset }) => ['solana'].includes(asset.name),
  getMessage: () => 'Destination address is for a different token type.',
})

// cannot send token X to a different target account address (token Y)
export const solanaMintAddressValidator = createValidator({
  id: 'ADDRESS_MINT_MISMATCH',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset }) => ['SOLANA_TOKEN'].includes(asset.assetType),

  isValid: async ({ asset, addressDetails }) =>
    !addressDetails.targetMint || asset.mintAddress === addressDetails.targetMint,
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: ({ asset }) =>
    `Destination Wallet is not a ${asset.baseAsset.displayName} ${asset.displayTicker} address.`,
  field: FIELDS.ADDRESS,
})

export const solanaAddressValidator = createValidator({
  id: 'SOLANA_ADDRESS',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ asset }) => asset.name === 'solana',
  isValid: async ({ addressDetails }) => {
    return addressDetails.addressType !== 'token'
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => `The Solana network doesn't allow sending SOL to a Token Account address.`,
  field: FIELDS.ADDRESS,
})

export const solanaPayValidator = createValidator({
  id: 'SOLANA_PAY',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ solanaPayInfo }) => {
    return !!(solanaPayInfo?.recipient || solanaPayInfo?.link)
  },
  isValid: async ({ solanaPayInfo }) => {
    return !(solanaPayInfo.recipient || solanaPayInfo.link)
  },
  priority: PRIORITY_LEVELS.MIDDLE,
  getMessage: () => `Please use Solana Pay feature to scan this QRCode.`,
  field: FIELDS.ADDRESS,
})
