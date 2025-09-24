import {
  convertChainIdToHex,
  parseAndValidateTypedData,
} from '../../lib/rpc-handlers/parseAndValidateTypedData.js'

const fixtures = [
  ['1', '0x1'],
  ['137', '0x89'],
  ['56', '0x38'],
  ['10', '0xa'],
  ['43114', '0xa86a'],
]

describe('convertChainIdToHex', () => {
  it('returns a hexadecimal representation of a stringified number', () => {
    fixtures.forEach(([decimal, hex]) => {
      expect(convertChainIdToHex(`${decimal}`)).toBe(hex)
    })
  })

  it('returns the same hex string if hex is supplied', () => {
    fixtures.forEach(([, hex]) => {
      expect(convertChainIdToHex(hex)).toBe(hex)
    })
  })

  it('throws if not a string supplied', () => {
    try {
      convertChainIdToHex(1)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.message).toEqual(`'chainId' should be a string, got: number`)
    }
  })
})

describe('parseAndValidateMessage', () => {
  let typedData
  beforeEach(() => {
    typedData = {
      types: {
        EIP712Domain: [],
      },
      primaryType: 'EIP712Domain',
      domain: {
        name: 'name',
        version: '1',
        chainId: '0x89',
      },
      message: {},
    }
  })

  it('returns the parsed typed data object if chain IDs match', () => {
    let parsedTypedData = parseAndValidateTypedData(JSON.stringify(typedData), {
      chainId: '0x89',
    })
    expect(parsedTypedData).toEqual(typedData)

    typedData.domain.chainId = 137
    parsedTypedData = parseAndValidateTypedData(JSON.stringify(typedData), {
      chainId: '0x89',
    })
    expect(parsedTypedData).toEqual(typedData)

    typedData.domain.chainId = '137'
    parsedTypedData = parseAndValidateTypedData(JSON.stringify(typedData), {
      chainId: '0x89',
    })
    expect(parsedTypedData).toEqual(typedData)
  })

  it('throws an error if chain IDs do not match', () => {
    typedData.domain.chainId = 100500
    try {
      expect(
        parseAndValidateTypedData(JSON.stringify(typedData), {
          chainId: '0x1',
        }),
      )
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.code).toBe(-32000)
    }
  })

  it('throws if a field name in "message" prop is invalid', () => {
    typedData.types.EIP712Domain = [
      { name: 'target', type: 'string' },
      { name: 'message', type: 'string' },
    ]
    typedData.message['   '] = {
      target: 'Fake target.',
      message: 'Fake message.',
    }

    expect(() =>
      parseAndValidateTypedData(JSON.stringify(typedData), {
        chainId: '0x89',
      }),
    ).toThrow()
  })

  it('throws if unexpected field exists in "message" prop', () => {
    typedData.types.EIP712Domain = [{ name: 'target', type: 'string' }]
    typedData.message = {
      target: 'Expected field',
      message: 'Unexpected field.',
    }

    expect(() =>
      parseAndValidateTypedData(JSON.stringify(typedData), {
        chainId: '0x89',
      }),
    ).toThrow("field 'message' is not defined in the primary type definition")
  })

  it('validates Seaport `OrderComponents` message', () => {
    typedData.primaryType = 'OrderComponents'

    typedData.types.OrderComponents = [
      {
        name: 'kind',
        type: 'uint256',
      },
      {
        name: 'signature',
        type: 'bytes32',
      },
      {
        name: 'offerer',
        type: 'address',
      },
      {
        name: 'zone',
        type: 'address',
      },
      {
        name: 'offer',
        type: 'OfferItem[]',
      },
      {
        name: 'consideration',
        type: 'ConsiderationItem[]',
      },
      {
        name: 'orderType',
        type: 'uint8',
      },
      {
        name: 'startTime',
        type: 'uint256',
      },
      {
        name: 'endTime',
        type: 'uint256',
      },
      {
        name: 'zoneHash',
        type: 'bytes32',
      },
      {
        name: 'salt',
        type: 'uint256',
      },
      {
        name: 'conduitKey',
        type: 'bytes32',
      },
      {
        name: 'counter',
        type: 'uint256',
      },
    ]

    typedData.types.OfferItem = [
      {
        name: 'itemType',
        type: 'uint8',
      },
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'identifierOrCriteria',
        type: 'uint256',
      },
      {
        name: 'startAmount',
        type: 'uint256',
      },
      {
        name: 'endAmount',
        type: 'uint256',
      },
    ]

    typedData.types.ConsiderationItem = [
      {
        name: 'itemType',
        type: 'uint8',
      },
      {
        name: 'token',
        type: 'address',
      },
      {
        name: 'identifierOrCriteria',
        type: 'uint256',
      },
      {
        name: 'startAmount',
        type: 'uint256',
      },
      {
        name: 'endAmount',
        type: 'uint256',
      },
      {
        name: 'recipient',
        type: 'address',
      },
    ]

    typedData.message = {
      kind: 'single-token',
      offerer: '0xa2b108fe1a951be9a72a002578f67883a8360942',
      zone: '0x2d1a340cd83434243d090931afabf95b7d3078b0',
      offer: [
        {
          itemType: 1,
          token: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
          identifierOrCriteria: '0',
          startAmount: '40000000000000',
          endAmount: '40000000000000',
        },
      ],
      consideration: [
        {
          itemType: 3,
          token: '0x92e0ad6434ed9fa432d1d48b1ffa5c220dda6e30',
          identifierOrCriteria: '1',
          startAmount: '1',
          endAmount: '1',
          recipient: '0xa2b108fe1a951be9a72a002578f67883a8360942',
        },
        {
          itemType: 1,
          token: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
          identifierOrCriteria: '0',
          startAmount: '4000000000000',
          endAmount: '4000000000000',
          recipient: '0x1369375365164ee2d1deae24ef1269a3715ca73e',
        },
        {
          itemType: 1,
          token: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
          identifierOrCriteria: '0',
          startAmount: '800000000000',
          endAmount: '800000000000',
          recipient: '0x6fa303e72bed54f515a513496f922bc331e2f27e',
        },
      ],
      orderType: 3,
      startTime: 1724204304,
      endTime: 1724809140,
      zoneHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      salt: '0x0e1c0c381d4da48b00000000000000006cf837e15485983f13cbe2d4e0b0114f',
      conduitKey:
        '0x87328c9043e7bf343695554eaaf5a8892f7205e3000000000000000000000000',
      counter: '0',
      signature:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
    }

    expect(() =>
      parseAndValidateTypedData(JSON.stringify(typedData), {
        chainId: '0x89',
      }),
    ).not.toThrowError()
  })
})
