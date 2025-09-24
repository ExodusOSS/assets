import sendValidationModel from '@exodus/send-validation-model'

export const { VALIDATION_TYPES, PRIORITY_LEVELS, FIELDS } = sendValidationModel

// TODO move each custom validation to its plugin
export const CAN_SEND_ZERO_AMOUNT = ['algorand']
export const ASSETS_WITHOUT_SELF_SEND = ['eosio', 'hedera', 'ripple', 'tronmainnet']
