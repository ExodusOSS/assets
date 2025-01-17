import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

export const coinCanCreateAccount = ['hedera']
export const noAccountYetForCoin = (asset, address) =>
  coinCanCreateAccount.includes(asset.name) && address === asset.noAccountYet

const isValidSync = ({ asset, destinationAddress }) =>
  asset.address.validate(destinationAddress) || noAccountYetForCoin(asset, destinationAddress)
const INVALID_ADDRESS = {
  id: 'INVALID_ADDRESS',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: () => true,

  isValid: async ({ asset, destinationAddress }) => isValidSync({ asset, destinationAddress }),
  isValidSync,

  priority: PRIORITY_LEVELS.BASE,
}

export default INVALID_ADDRESS
