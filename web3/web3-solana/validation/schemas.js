import {
  definitions as solanaMobileDefinitions,
  methods as solanaMobileMethods,
} from './solana-mobile.js'
// Maximum over-the-wire size of a Solana Transaction.
// See: https://solana-labs.github.io/solana-web3.js/modules.html#PACKET_DATA_SIZE.
const SOLANA_PACKET_DATA_SIZE = 1280
const ENCODED_TRANSACTION_MAX_LENGTH =
  Math.ceil(SOLANA_PACKET_DATA_SIZE / 3) * 4 // Each 3 bytes are encoded as 4 chars in base64.
const ENCODED_TRANSACTION_MAX_SAFE_LENGTH = ENCODED_TRANSACTION_MAX_LENGTH * 10 // To accommodate for changes in the protocol.

export const definitions = {
  sol: {
    commitment: {
      enum: [
        'processed',
        'confirmed',
        'finalized',
        'recent',
        'single',
        'singleGossip',
        'root',
        'max',
      ],
    },
    displayEncoding: {
      enum: ['hex', 'utf8'],
    },
    encodedMessage: {
      $ref: '#/$defs/encodedData',
      // maxLength: ENCODED_MESSAGE_MAX_SAFE_LENGTH, // TODO: Add max length check.
    },
    encodedTransaction: {
      $ref: '#/$defs/encodedData',
      maxLength: ENCODED_TRANSACTION_MAX_SAFE_LENGTH,
    },
    sendOptions: {
      type: 'object',
      required: [],
      additionalProperties: false,
      removeAdditional: true,
      properties: {
        maxRetries: { type: 'integer', minimum: 0 },
        minContextSlot: { type: 'integer', minimum: 0 },
        preflightCommitment: { $ref: '#/$defs/sol/commitment' },
        skipPreflight: { type: 'boolean' },
      },
    },
    solConnectParams: {
      type: 'array',
      items: false,
      minItems: 1,
      prefixItems: [{ type: 'boolean' }],
    },
    solSignTransactionParams: {
      type: 'array',
      items: false,
      minItems: 1,
      prefixItems: [{ $ref: '#/$defs/sol/encodedTransaction' }],
    },
    solSignAllTransactionsParams: {
      type: 'array',
      items: false,
      minItems: 1,
      prefixItems: [
        {
          type: 'array',
          items: { $ref: '#/$defs/sol/encodedTransaction' },
          minItems: 1,
        },
      ],
    },
    solSignAndSendTransactionParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        { $ref: '#/$defs/sol/encodedTransaction' },
        { oneOf: [{ type: 'null' }, { $ref: '#/$defs/sol/sendOptions' }] },
      ],
    },
    solSignMessageParams: {
      type: 'array',
      items: false,
      minItems: 2,
      prefixItems: [
        { $ref: '#/$defs/sol/encodedMessage' },
        { $ref: '#/$defs/sol/displayEncoding' },
      ],
    },
    solGetLatestBlockhashParams: {
      type: 'array',
      maxItems: 1,
      items: false,
      prefixItems: [{ $ref: '#/$defs/sol/commitment' }],
    },
  },
  ...solanaMobileDefinitions,
}

export const methods = [
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_isConnected' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_connect' },
      params: { $ref: '#/$defs/sol/solConnectParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_signTransaction' },
      params: { $ref: '#/$defs/sol/solSignTransactionParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_signAllTransactions' },
      params: { $ref: '#/$defs/sol/solSignAllTransactionsParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_signAndSendTransaction' },
      params: { $ref: '#/$defs/sol/solSignAndSendTransactionParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_signMessage' },
      params: { $ref: '#/$defs/sol/solSignMessageParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'sol_getLatestBlockhash' },
      params: { $ref: '#/$defs/sol/solGetLatestBlockhashParams' },
    },
  },
  ...solanaMobileMethods,
]
