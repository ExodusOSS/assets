jest.mock('@exodus/web3-utils', () => ({
  __esModule: true,
  ...jest.requireActual('@exodus/web3-utils'),
  makeSimulationAPICall: jest.fn(() => Promise.resolve({})),
}))

const { makeSimulationAPICall: mockMakeSimulationAPICall } = await import('@exodus/web3-utils')

const { createSimulateMessage } = await import('../createSimulateMessage.js')

const dummyTypedData = {
  types: {
    EIP712Domain: [],
  },
  primaryType: 'EIP712Domain',
  domain: {},
  message: {},
}
const fixtures = {
  'Unlimited Amount Permit Message': {
    requestId: 'e8cd35ce-f743-4ef2-8e94-f26857744db7',
    action: 'WARN',
    simulationResults: {
      error: null,
      expectedStateChanges: [
        {
          humanReadableDiff: 'Permit to transfer all your UNI within 2 days',
          rawInfo: {
            data: {
              amount:
                '115792089237316195423570985008687907853269984665640564039457584007913129639935',
              asset: {
                address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
                decimals: 18,
                imageUrl:
                  'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png',
                lists: [
                  'COINGECKO',
                  'ZERION',
                  'ONE_INCH',
                  'UNISWAP',
                  'MY_CRYPTO_API',
                  'KLEROS_TOKENS',
                ],
                name: 'Uniswap',
                symbol: 'UNI',
                verified: true,
                price: {
                  source: 'Coingecko',
                  updatedAt: 1679331222,
                  dollarValuePerToken: 34.32,
                },
              },
              contract: {
                address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
                kind: 'ACCOUNT',
              },
              deadline: 1667556263,
              nonce: '0',
              owner: {
                address: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
                kind: 'ACCOUNT',
              },
              spender: {
                address: '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45',
                kind: 'ACCOUNT',
              },
            },
            kind: 'ERC20_PERMIT',
          },
        },
      ],
      protocol: {
        trustLevel: 'TRUSTED',
        name: 'Uniswap',
        description: 'An ERC-20 token contract',
        imageUrl:
          'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png',
        websiteUrl:
          'https://etherscan.io/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      },
    },
    warnings: [
      {
        kind: 'PERMIT_UNLIMITED_ALLOWANCE',
        message:
          'You are allowing this dApp to withdraw funds from your account in the future.',
        severity: 'WARNING',
      },
    ],
  },
}

describe('createSimulateMessage', () => {
  it('should return a function', () => {
    const simulateMessage = createSimulateMessage()

    expect(typeof simulateMessage).toBe('function')
  })

  describe('simulateMessage', () => {
    let simulateMessage
    const asset = {
      baseAssetName: 'ethereum',
    }
    const address = '0x870CfC78C28648FA11aAC6EC7a5654bcD0A8554a'
    const url = new URL('https://exodus.com')
    const options = {
      asset,
      address,
      url,
    }

    beforeEach(() => {
      simulateMessage = createSimulateMessage()
    })

    it('throws if url is missing or not a URL instance', async () => {
      await expect(simulateMessage({
        url: undefined
      })).rejects.toThrow("'url' should be an instance of the URL object.")

      await expect(simulateMessage({
        url: 'https://example.com'
      })).rejects.toThrow("'url' should be an instance of the URL object.")
    })

    it('sets the "WARN" action properly', async () => {
      mockMakeSimulationAPICall.mockResolvedValueOnce(
        fixtures['Unlimited Amount Permit Message'],
      )
      const message = JSON.stringify(dummyTypedData)
      const result = await simulateMessage({ message, ...options })

      expect(result.action).toEqual('WARN')
    })
  })
})
