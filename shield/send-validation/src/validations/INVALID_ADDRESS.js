import { t } from '@exodus/i18n-dummy'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

export const coinCanCreateAccount = ['hedera']
export const noAccountYetForCoin = (asset, address) =>
  coinCanCreateAccount.includes(asset.name) && address === asset.noAccountYet

const isValidSync = ({ asset, destinationAddress }) =>
  asset.address.validate(destinationAddress) || noAccountYetForCoin(asset, destinationAddress)
const INVALID_ADDRESS = {
  id: 'INVALID_ADDRESS',
  type: VALIDATION_TYPES.ERROR,
  shouldValidate: ({ destinationAddress }) => Boolean(destinationAddress),
  getMessage: ({ isTransfer, asset }) => {
    const displayTicker = asset.displayTicker
    const isAccountBased = asset.baseAsset.api.features.abstractAccounts

    if (isAccountBased && isTransfer) {
      return t(
        `There is no ${displayTicker} account on the chosen portfolio. Please create an account before transferring funds.`
      )
    }

    const addressOrAccount = isAccountBased ? 'account' : 'address'
    return t(`Invalid ${displayTicker} ${addressOrAccount}. Please check it and try again.`)
  },
  isValid: async ({ asset, destinationAddress }) => isValidSync({ asset, destinationAddress }),
  isValidSync,
  field: FIELDS.ADDRESS,
  priority: PRIORITY_LEVELS.BASE,
}

export default INVALID_ADDRESS
