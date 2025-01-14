const ALLOWED_CLUSTERS = ['mainnet-beta', 'testnet', 'devnet']
const MAX_STRING_LENGTH = 10000

const signOptions = {
  type: 'object',
  required: ['authorizedPublicKey'],
  additionalProperties: false,
  properties: {
    authorizedPublicKey: {
      type: 'string',
      pattern: '^[1-9A-Za-z][^OIl]{32,44}$',
      minLength: 32,
      maxLength: 44,
    },
  },
}
const sendOptions = {
  type: 'object',
  required: [],
  additionalProperties: false,
  properties: {
    minContextSlot: { type: 'integer', minimum: 0 },
  },
}
export const definitions = {
  sms: {
    signOptions,
    sendOptions,
    smsConnectParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        {
          type: 'boolean',
        },
        {
          type: 'object',
          required: ['isVerified'],
          properties: {
            name: {
              type: 'string',
              format: 'any-string',
              maxLength: MAX_STRING_LENGTH,
            },
            origin: {
              type: 'string',
              format: 'uri',
            },
            icon: {
              type: 'string',
              // TODO: must be a valid relative url /assets/icon.ico?maybe=happens#wtf
              format: 'any-string',
              maxLength: MAX_STRING_LENGTH,
            },
            cluster: {
              type: 'string',
              enum: ALLOWED_CLUSTERS,
            },
            isVerified: {
              type: 'boolean',
            },
          },
          additionalProperties: false,
        },
      ],
    },
    smsSignTransactionsParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        {
          type: 'array',
          items: { $ref: '#/$defs/sol/encodedTransaction' },
          minItems: 1,
        },
        { $ref: '#/$defs/sms/signOptions' },
      ],
    },
    smsSignAndSendTransactionsParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        {
          type: 'array',
          items: { $ref: '#/$defs/sol/encodedTransaction' },
          minItems: 1,
        },
        { $ref: '#/$defs/sms/signOptions' },
        { $ref: '#/$defs/sms/sendOptions' },
      ],
    },
    smsSignMessagesParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        {
          type: 'array',
          items: { $ref: '#/$defs/sol/encodedMessage' },
          minItems: 1,
        },
        { $ref: '#/$defs/sms/signOptions' },
      ],
    },
  },
}

export const methods = [
  {
    required: ['params'],
    properties: {
      method: { const: 'sms_connect' },
      params: { $ref: '#/$defs/sms/smsConnectParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sms_signTransactions' },
      params: { $ref: '#/$defs/sms/smsSignTransactionsParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sms_signAndSendTransactions' },
      params: { $ref: '#/$defs/sms/smsSignAndSendTransactionsParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sms_signMessages' },
      params: { $ref: '#/$defs/sms/smsSignMessagesParams' },
    },
  },
]
