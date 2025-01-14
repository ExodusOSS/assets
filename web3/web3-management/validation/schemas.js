const definitions = {}

const methods = [
  {
    required: ['params'],
    properties: {
      method: { const: 'exodus_selectWallet' },
      params: {
        type: 'array',
        items: false,
        minItems: 2,
        prefixItems: [
          {
            type: 'string',
            format: 'any-string',
            maxLength: 100,
          },
          {
            type: 'array',
            items: {
              type: 'string',
              format: 'any-string',
              maxLength: 100,
            },
          },
        ],
      },
    },
  },
]

export { definitions, methods }
