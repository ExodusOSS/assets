import {
  assetId,
  assetName,
  assetType,
  baseAssetName,
  color,
  description,
  displayName,
  displayTicker,
  icon,
  parentAssetName,
  reddit,
  telegram,
  ticker,
  twitter,
  website,
} from './field-definitions.js'

const schema = {
  $schema: 'https://json-schema.org/draft/2019-09/schema#',
  type: 'object',
  additionalProperties: false,
  required: [
    'assetId',
    'assetName',
    'assetType',
    'baseAssetName',
    'lifecycleStatus',
    'parameters',
    'pricingAvailable',
    'properName',
    'properTicker',
    'ticker',
    'version',
  ],
  properties: {
    assetId,
    assetName,
    assetType,
    baseAssetName,
    parents: {
      type: 'array',
      items: parentAssetName,
    },
    lifecycleStatus: {
      enum: ['u', 'v', 'c', 'd'],
    },
    parameters: {
      type: 'object',
      required: ['decimals', 'units'],
      additionalProperties: false,
      properties: {
        decimals: {
          type: 'number',
          minimum: 0,
          maximum: 100,
        },
        units: {
          type: 'object',
          minProperties: 2,
          additionalProperties: false,
          required: ['base'],
          propertyNames: {
            maxLength: ticker.maxLength,
            pattern: '^(base|' + ticker.pattern.slice(1, -1) + '|[A-Z]{0,20}(v1)?)$',
          },
          patternProperties: {
            '^base$': {
              const: 0,
            },
            [ticker.pattern]: {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
            '^[A-Z]{0,20}(v1)?$': {
              type: 'number',
              minimum: 0,
              maximum: 100,
            },
          },
        },
      },
    },
    pricingAvailable: {
      type: 'boolean',
    },
    properName: displayName,
    properTicker: displayTicker,
    displayName,
    displayTicker,
    ticker,
    version: {
      type: 'number',
      minimum: 0,
    },
    info: {
      type: 'object',
      additionalProperties: false,
      required: [],
      properties: {
        description,
        reddit,
        twitter,
        website,
        telegram,
      },
    },
    icon,
    primaryColor: color,
    gradientColors: {
      type: 'array',
      minItems: 2,
      maxItems: 2,
      items: color,
    },
  },
}

export default schema
