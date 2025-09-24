jest.doMock('@exodus/web3-utils', () => {
  const originalModule = jest.requireActual('@exodus/web3-utils')

  return { __esModule: true, ...originalModule, makeSimulationAPICall: jest.fn() }
})

const {
  createCurrency,
  createEmptySimulationResult,
  makeSimulationAPICall: mockMakeSimulationAPICall,
} = await import('@exodus/web3-utils')

const { BLOWFISH_EVM_CHAINS } = await import('../common.js')
const { simulateTransactions } = await import('../simulateTransactions.js')

const apiEndpoint = 'simulation-service.xyz'
const origin = 'test.xyz'

// Not able to direclty compare objects with BigNumber (currency) values
const fixObjectForComparison = (object) => {
  return JSON.parse(JSON.stringify(object))
}

describe('simulateTransactions', () => {
  const transaction = {
    from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
    to: '0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6',
    value: '0xFFF',
    data: '0x',
    nonce: 0,
    gas: '0x' + Number(21000).toString(16),
    gasPrice: '0x' + Number(20000000000).toString(16), // 20 Gwei
    maxPriorityFeePerGas: '0x' + Number(12000000000).toString(16), // 12 Gwei
    maxFeePerGas: '0x' + Number(5000000000).toString(16), // 1.5 Gwei
  }
  const assetName = 'ethereum'
  const asset = {
    baseAssetName: assetName,
    name: assetName,
    currency: { defaultUnit: { power: 18 } },
  }

  it('calls "makeSimulationAPICall" with the proper parameters', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      simulationResults: {
        aggregated: { expectedStateChanges: [] },
        perTransaction: [],
      },
    })

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      transactions: [transaction],
      apiEndpoint,
      origin,
      asset,
      simulationResult,
    })

    const { network, chain } = BLOWFISH_EVM_CHAINS[assetName]

    expect(mockMakeSimulationAPICall).toHaveBeenCalledWith({
      url: apiEndpoint,
      network,
      chain,
      headers: undefined,
      payload: {
        txObjects: [
          {
            from: transaction.from,
            to: transaction.to,
            value: transaction.value,
            data: transaction.data,
            gas: transaction.gas,
            gas_price: transaction.gasPrice,
          },
        ],
        metadata: {
          origin,
        },
        userAccount: transaction.from,
      },
    })
  })

  it('returns the simulation result', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      action: 'WARN',
      warnings: [
        {
          kind: 'TRANSFERRING_ERC20_TO_OWN_CONTRACT',
          message:
            'You are transferring ER20 tokens directly to their own token contract. In most cases this will lead to you losing them forever.',
          severity: 'WARNING',
        },
      ],
      simulationResults: {
        aggregated: {
          expectedStateChanges: {
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': [
              {
                humanReadableDiff: 'Send 1 WETH',
                rawInfo: {
                  kind: 'ERC20_TRANSFER',
                  data: {
                    amount: {
                      before: '73226553153926107704',
                      after: '72226553153926107704',
                    },
                    counterparty: {
                      kind: 'ACCOUNT',
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    },
                    asset: {
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                      symbol: 'WETH',
                      name: 'Wrapped Ether',
                      decimals: 18,
                      verified: true,
                      lists: [
                        'COINGECKO',
                        'ZERION',
                        'ONE_INCH',
                        'UNISWAP',
                        'MY_CRYPTO_API',
                        'KLEROS_TOKENS',
                      ],
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1690390523,
                        dollarValuePerToken: 1860.14,
                      },
                    },
                  },
                },
              },
            ],
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': [
              {
                humanReadableDiff: 'Receive 1 WETH',
                rawInfo: {
                  kind: 'ERC20_TRANSFER',
                  data: {
                    amount: {
                      before: '743004895062091899256',
                      after: '744004895062091899256',
                    },
                    asset: {
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                      symbol: 'WETH',
                      name: 'Wrapped Ether',
                      decimals: 18,
                      verified: true,
                      lists: [
                        'COINGECKO',
                        'ZERION',
                        'ONE_INCH',
                        'UNISWAP',
                        'MY_CRYPTO_API',
                        'KLEROS_TOKENS',
                      ],
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1690390523,
                        dollarValuePerToken: 1860.14,
                      },
                    },
                  },
                },
              },
            ],
          },
          error: null,
          userAccount: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        },
        perTransaction: [],
      },
    })

    const simulationResult = {
      balanceChanges: {
        willApprove: [],
        willSend: [],
        willReceive: [],
      },
      metadata: {
        simulatedLocally: false,
      },
      warnings: [],
    }

    await simulateTransactions({
      transactions: [transaction],
      apiEndpoint,
      origin,
      simulationResult,
      asset,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(fixObjectForComparison(simulationResult)).toEqual(
      fixObjectForComparison({
        balanceChanges: {
          willApprove: [],
          willSend: [
            {
              asset: {
                address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                imageUrl:
                  'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                name: 'Wrapped Ether',
                symbol: 'WETH',
                verified: true,
              },
              balance: createCurrency({
                amount: '1000000000000000000',
                symbol: 'WETH',
                denominator: 18,
              }),
            },
          ],
          willReceive: [],
        },
        metadata: {
          simulatedLocally: false,
        },
        warnings: [],
      }),
    )
  })
})
