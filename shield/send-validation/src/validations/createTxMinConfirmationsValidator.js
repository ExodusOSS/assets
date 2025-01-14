import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../constants.js'

const createTxMinConfirmationsValidator = ({ assetNames, getMinConfirmations, ...rest }) => ({
  id: 'UNCONFIRMED_TX',
  type: VALIDATION_TYPES.ERROR,

  shouldValidate: ({ asset }) => assetNames.includes(asset.name),

  isValid: ({ lastSentTx, asset }) =>
    !lastSentTx || lastSentTx.confirmations >= getMinConfirmations({ asset }),

  priority: PRIORITY_LEVELS.TOP,

  ...rest,
})

export default createTxMinConfirmationsValidator
