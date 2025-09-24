const definitions = {
  typedDataV4Type: {
    type: 'object',
    required: ['name', 'type'],
    properties: {
      name: {
        type: 'string',
        format: 'mixed-case-string',
        maxLength: 50,
      },
      type: {
        type: 'string',
        format: 'mixed-case-string',
        maxLength: 50,
      },
    },
    additionalProperties: false,
  },
  typedDataV4Payload: {
    type: 'object',
    required: ['domain', 'message', 'primaryType', 'types'],
    properties: {
      types: {
        type: 'object',
        required: ['EIP712Domain'],
        properties: {
          EIP712Domain: {
            type: 'array',
            items: { type: 'object', $ref: '#/$defs/typedDataV4Type' },
          },
        },
        propertyNames: { format: 'mixed-case-string', maxLength: 50 },
        additionalProperties: {
          type: 'array',
          items: { $ref: '#/$defs/typedDataV4Type' },
        },
      },
      primaryType: {
        type: 'string',
        format: 'mixed-case-string',
        maxLength: 50,
      },
      domain: {
        anyOf: [
          { const: {} },
          {
            type: 'object',
            required: ['name'],
            properties: {
              name: {
                type: 'string',
                format: 'mixed-case-string',
                maxLength: 50,
              },
              version: {
                type: 'string',
                format: 'semver-string',
                maxLength: 255, // Arbitrary.
              },
              chainId: {
                oneOf: [
                  { type: 'integer' },
                  {
                    type: 'string',
                    pattern: '^[0-9]+$',
                  },
                  {
                    type: 'string',
                    format: 'hex-digits-prefixed',
                  },
                ],
              },
              verifyingContract: {
                type: 'string',
                format: 'hex-digits-prefixed',
              },
              salt: {
                type: 'string',
                format: 'hex-digits-prefixed',
              },
            },
            additionalProperties: false,
          },
        ],
      },
      message: {
        type: 'object',
        propertyNames: {
          format: 'mixed-case-string',
          maxLength: 50,
        },
        additionalProperties: {
          anyOf: [
            { const: {} },
            { type: 'boolean' },
            { type: 'integer' },
            { type: 'number' },
            { type: 'string', format: 'hex-digits-prefixed' },
            { type: 'string', format: 'any-string', maxLength: 100 },
            {
              type: 'array',
              items: {
                anyOf: [
                  { type: 'string', format: 'ethereum-address' },
                  { type: 'string', format: 'hex-digits-prefixed' },
                  { type: 'string', format: 'any-string', maxLength: 100 },
                  {
                    $ref: '#/$defs/typedDataV4Payload/properties/message',
                  },
                ],
              },
            },
            {
              $ref: '#/$defs/typedDataV4Payload/properties/message',
            },
          ],
        },
      },
    },
    additionalProperties: false,
  },
}

const typedDataSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $ref: '#/$defs/typedDataV4Payload',
  $defs: definitions,
  unevaluatedProperties: false,
}

export { definitions, typedDataSchema }
