const MAX_ARBITRARY_STRING_LENGTH = 10000

const definitions = {
  requestedPermissions: {
    type: 'object',
    required: [],
    properties: {
      eth_accounts: { $ref: '#/$defs/emptyObject' },
    },
    additionalProperties: false,
  },
  assetOptions: {
    type: 'object',
    required: ['address'],
    properties: {
      address: { type: 'string', format: 'ethereum-address' },
      symbol: {
        type: 'string',
        format: 'mixed-case-string',
        maxLength: 5,
      },
      decimals: { type: 'number' },
      image: {
        oneOf: [
          {
            type: 'string',
            format: 'uri',
          },
          {
            $ref: '#/$defs/encodedData',
          },
        ],
      },
      chainId: { type: 'number' },
    },
    additionalProperties: false,
  },
  transaction: {
    type: 'object',
    required: ['from'],
    additionalProperties: false,
    removeAdditional: true,
    properties: {
      chainId: {
        oneOf: [
          { type: 'string', format: 'hex-digits-prefixed' },
          { type: 'number' },
        ],
      },
      from: { type: 'string', format: 'ethereum-address' },
      to: { type: 'string', format: 'ethereum-address' },
      gas: { type: 'string', format: 'hex-digits-prefixed' },
      gasPrice: {
        oneOf: [
          { type: 'string', format: 'hex-digits-prefixed' },
          { type: 'null' },
        ],
      },
      value: { type: 'string', format: 'hex-digits-prefixed-extended' },
      data: { type: 'string', format: 'hex-digits-prefixed-extended' },
      maxPriorityFeePerGas: {
        oneOf: [
          {
            type: 'string',
            format: 'hex-digits-prefixed-extended',
          },
          {
            type: 'null',
          },
        ],
      },
      maxFeePerGas: {
        oneOf: [
          {
            type: 'string',
            format: 'hex-digits-prefixed-extended',
          },
          {
            type: 'null',
          },
        ],
      },
    },
  },
  typedDataV1Payload: {
    type: 'array',
    items: {
      type: 'object',
      required: ['name', 'type', 'value'],
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
        value: {
          type: 'string',
          format: 'any-string',
          maxLength: MAX_ARBITRARY_STRING_LENGTH,
        },
      },
      additionalProperties: false,
    },
  },
  proxiedParams: {
    type: 'array',
    minItems: 1,
    maxItems: 3,
    uniqueItems: true,
    items: {
      anyOf: [
        { type: 'boolean' },
        {
          type: 'object',
          propertyNames: {
            pattern: '^[a-z]+([A-Z][a-z]+)*[A-Z]?$',
            maxLength: 20,
          },
          additionalProperties: {
            anyOf: [
              {
                type: 'string',
                format: 'hex-digits-prefixed-extended',
              },
              {
                const: [],
              },
              {
                $ref: '#/$defs/proxiedParams',
              },
              { type: 'string', format: 'ethereum-address' },
            ],
          },
        },
        { type: 'string', format: 'hex-digits-prefixed-extended' },
        { type: 'string', pattern: '^[a-z]+$' },
        { type: 'null' },
        {
          type: 'array',
          minItems: 1,
          items: {
            anyOf: [
              {
                type: 'number',
              },
              { type: 'string', format: 'any-string', maxLength: 100 },
            ],
          },
        },
        {
          const: [],
        },
      ],
    },
  },
  ethSendRawTransactionParams: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [{ type: 'string', format: 'hex-digits-prefixed' }],
  },
  ethSendTransactionParams: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [{ $ref: '#/$defs/transaction' }],
  },
  ethSignParams: {
    type: 'array',
    items: false,
    minItems: 2,
    prefixItems: [
      { type: 'string', format: 'ethereum-address' },
      { type: 'string', format: 'hex-digits-prefixed' },
    ],
  },
  ethSignTransactionParams: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [{ $ref: '#/$defs/transaction' }],
  },
  ethSignTypedDataV1Params: {
    type: 'array',
    items: false,
    minItems: 2,
    prefixItems: [
      { $ref: '#/$defs/typedDataV1Payload' },
      { type: 'string', format: 'ethereum-address' },
    ],
  },
  ethSignTypedDataV4Params: {
    type: 'array',
    items: false,
    minItems: 2,
    prefixItems: [
      { type: 'string', format: 'ethereum-address' },
      {
        type: 'string',
        format: 'any-string',
        maxLength: MAX_ARBITRARY_STRING_LENGTH,
      },
    ],
  },
  personalSignParams: {
    type: 'array',
    items: false,
    minItems: 2,
    prefixItems: [
      {
        type: 'string',
        format: 'any-string',
        maxLength: MAX_ARBITRARY_STRING_LENGTH,
      },
      { type: 'string', format: 'ethereum-address' },
    ],
  },
  walletPermissionsParams: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [{ $ref: '#/$defs/requestedPermissions' }],
  },
  walletSwitchEthereumChainParams: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [
      {
        type: 'object',
        required: ['chainId'],
        properties: {
          chainId: { type: 'string', format: 'hex-digits-prefixed' },
        },
        additionalProperties: false,
      },
    ],
  },
  walletAddEthereumChainParameter: {
    type: 'array',
    items: false,
    minItems: 1,
    prefixItems: [
      {
        type: 'object',
        required: ['chainId', 'chainName'],
        properties: {
          chainId: { type: 'string', format: 'hex-digits-prefixed' },
          chainName: {
            type: 'string',
            format: 'mixed-case-string',
            maxLength: 50,
          },
          blockExplorerUrls: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', format: 'uri', maxLength: 100 },
          },
          iconUrls: {
            type: 'array',
            minItems: 0,
            items: { type: 'string', format: 'uri', maxLength: 100 },
          },
          rpcUrls: {
            type: 'array',
            minItems: 1,
            items: { type: 'string', format: 'uri', maxLength: 100 },
          },

          nativeCurrency: {
            type: 'object',
            required: ['decimals', 'symbol'],
            additionalProperties: false,
            properties: {
              decimals: { type: 'number' },
              name: {
                type: 'string',
                format: 'mixed-case-string',
                maxLength: 50,
              },
              symbol: {
                type: 'string',
                format: 'mixed-case-string',
                maxLength: 50,
              },
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  walletWatchAssetParams: {
    type: 'object',
    required: ['type', 'options'],
    properties: {
      type: {
        type: 'string',
        format: 'mixed-case-string',
        maxLength: 20,
      },
      options: {
        $ref: '#/$defs/assetOptions',
      },
    },
    additionalProperties: false,
  },
}

const methods = [
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_isConnected' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_accounts' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_blockNumber' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_chainId' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_call' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_coinbase' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_createAccessList' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_estimateGas' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_feeHistory' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_gasPrice' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getBalance' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getBlockByHash' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getBlockByNumber' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getBlockTransactionCountByHash' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getBlockTransactionCountByNumber' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getCode' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getCompilers' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getLogs' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getProof' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getStorageAt' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getTransactionByBlockHashAndIndex' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getTransactionByBlockNumberAndIndex' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getTransactionByHash' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getTransactionCount' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getTransactionReceipt' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getUncleCountByBlockHash' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getUncleByBlockHashAndIndex' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getUncleByBlockNumberAndIndex' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_getWork' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_maxPriorityFeePerGas' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_hashrate' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_pendingTransactions' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_requestAccounts' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_sendRawTransaction' },
      params: { $ref: '#/$defs/ethSendRawTransactionParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_sendTransaction' },
      params: { $ref: '#/$defs/ethSendTransactionParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_sign' },
      params: { $ref: '#/$defs/ethSignParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_signTransaction' },
      params: { $ref: '#/$defs/ethSignTransactionParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_signTypedData' },
      params: { $ref: '#/$defs/ethSignTypedDataV4Params' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_signTypedData_v1' },
      params: { $ref: '#/$defs/ethSignTypedDataV1Params' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_signTypedData_v3' },
      params: { $ref: '#/$defs/ethSignTypedDataV4Params' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_signTypedData_v4' },
      params: { $ref: '#/$defs/ethSignTypedDataV4Params' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'eth_submitWork' },
      params: { $ref: '#/$defs/proxiedParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'personal_sign' },
      params: { $ref: '#/$defs/personalSignParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'net_version' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_getPermissions' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_requestPermissions' },
      params: { $ref: '#/$defs/walletPermissionsParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_revokePermissions' },
      params: { $ref: '#/$defs/walletPermissionsParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_switchEthereumChain' },
      params: { $ref: '#/$defs/walletSwitchEthereumChainParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_addEthereumChain' },
      params: { $ref: '#/$defs/walletAddEthereumChainParameter' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_watchAsset' },
      params: { $ref: '#/$defs/walletWatchAssetParams' },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'web3_clientVersion' },
      params: { const: [] },
    },
  },
  {
    required: ['params'],
    properties: {
      method: { const: 'wallet_getSnaps' },
      params: { const: [] },
    },
  },
]

export { definitions, methods }
