import SolidityContract from '@exodus/solidity-contract'

jest.mock('@exodus/fetch', () => ({
  fetch: jest.fn(),
}))

jest.mock('@exodus/web3-utils', () => {
  const originalModule = jest.requireActual('@exodus/web3-utils')
  return {
    __esModule: true,
    ...originalModule,
    makeSimulationAPICall: jest.fn(),
  }
})

const {
  createCurrency,
  createEmptySimulationResult,
  hexToBN,
  makeSimulationAPICall: mockMakeSimulationAPICall,
} = await import('@exodus/web3-utils')

const { sampleData } = await import('./createSimulateTransactions.fixtures.js')
const { createSimulateTransactions } = await import(
  '../createSimulateTransactions.js'
)
const { estimateFee } = await import('../simulation/estimateFee.js')
const { getDisplayDetails, getTxFeeDetails } = await import('../transactions.js')

// Fixes issues of not being able to direclty compare objects with BigNumber (currency) values
const fixObjectForComparison = (object) => {
  return JSON.parse(JSON.stringify(object))
}

describe('createSimulateService', () => {
  it('should return a function', () => {
    const simulateTransactions = createSimulateTransactions({})

    expect(typeof simulateTransactions).toBe('function')
  })

  describe('simulateTransactions', () => {
    const transaction = {
      from: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
      to: '0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6',
      value: '0xFFF',
      data: '0x',
      nonce: 0,
      gas: '0x' + Number(21000).toString(16),
      maxPriorityFeePerGas: '0x' + Number(12000000000).toString(16), // 12 Gwei
      maxFeePerGas: '0x' + Number(5000000000).toString(16), // 1.5 Gwei
      gasPrice: '0x' + Number(5000000000).toString(16), // 1.5 Gwei
    }
    const createDummyCurrency = ({ symbol = 'ETH' } = {}) => ({
      defaultUnit: {
        power: 0,
      },
      baseUnit: (amount) =>
        createCurrency({
          amount,
          base: 'wei',
          symbol,
          denominator: 16,
        }),
      ZERO: { add: jest.fn() },
    })
    const asset = {
      name: 'ethereum',
      baseAssetName: 'ethereum',
      ticker: 'ETH',
      displayTicker: 'ETH',
      units: {
        ETH: 18,
      },
      currency: createDummyCurrency(),
    }

    let simulateTransactions

    beforeEach(() => {
      simulateTransactions = createSimulateTransactions({})
    })

    it('should return empty simulationResult when "to" is not defined', async () => {
      const result = await simulateTransactions({
        transactions: [{ ...transaction, to: undefined }],
        asset,
      })

      const expectedResult = createEmptySimulationResult({ asset })
      expectedResult.balanceChanges.willPayFee.push({
        balance: estimateFee({ asset, transaction }),
        feeDetails: getTxFeeDetails(transaction),
      })

      expect(fixObjectForComparison(result)).toEqual(
        fixObjectForComparison(expectedResult),
      )
    })

    it('should simulate locally when simulation is not supported for the asset', async () => {
      const symbol = 'WRD'
      const unsupportedAsset = {
        name: 'WeirdChain',
        baseAssetName: 'ethereum',
        ticker: symbol,
        displayTicker: symbol,
        units: {
          [symbol]: 18,
        },
        currency: createDummyCurrency({ symbol }),
      }

      const result = await simulateTransactions({
        transactions: [transaction],
        asset: unsupportedAsset,
      })

      const expectedResult = createEmptySimulationResult({
        asset: unsupportedAsset,
      })
      expectedResult.balanceChanges.willPayFee.push({
        balance: estimateFee({ asset: unsupportedAsset, transaction }),
        feeDetails: getTxFeeDetails(transaction),
      })
      expectedResult.balanceChanges.willSend.push({
        balance: createCurrency({
          amount: hexToBN(transaction.value),
          base: 'wei',
          symbol,
          denominator: 16,
        }),
      })

      expectedResult.recipientAddresses = [['0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6']]

      expect(fixObjectForComparison(result)).toEqual(
        fixObjectForComparison(expectedResult),
      )
    })

    it('should warn if simulation call failed and local simulation is not possible', async () => {
      mockMakeSimulationAPICall.mockResolvedValueOnce(null)

      const result = await simulateTransactions({
        transactions: [{ ...transaction, data: '0xFFFF' }],
        asset,
      })

      expect(result.warnings[0]).toEqual({
        kind: 'INTERNAL_ERROR',
        severity: 'HIGH',
        message: 'Balance changes cannot be estimated.',
      })
    })

    it('should include a human readable error if provided by the simulation server', async () => {
      const humanReadableError =
        'The transaction provided was reverted by the node. Insufficient balances to execute the transaction'
      mockMakeSimulationAPICall.mockResolvedValueOnce({
        simulationResults: {
          aggregated: {
            error: {
              kind: 'SIMULATION_FAILED',
              humanReadableError,
            },
          },
        },
      })

      const result = await simulateTransactions({
        transactions: [{ ...transaction, data: '0xFFFF' }],
        asset,
      })

      expect(result.metadata.humanReadableError).toEqual(humanReadableError)
    })

    test.each(sampleData)('$testName', async (data) => {
      mockMakeSimulationAPICall.mockResolvedValueOnce(data.simulationResult)

      const simulationResult = await simulateTransactions({
        transactions: [transaction],
        asset,
      })

      const expectedResult = createEmptySimulationResult({ asset })
      expectedResult.balanceChanges = {
        ...expectedResult.balanceChanges,
        ...data.expectedState.balanceChanges,
      }

      expectedResult.balanceChanges.willPayFee.push({
        balance: estimateFee({ asset, transaction }),
        feeDetails: getTxFeeDetails(transaction),
      })

      expectedResult.displayDetails = getDisplayDetails(
        expectedResult.balanceChanges.willApprove,
      )

      expectedResult.metadata = {
        simulatedLocally: false,
      }

      expectedResult.recipientAddresses = [['0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6']]

      expect(fixObjectForComparison(simulationResult)).toEqual(
        fixObjectForComparison(expectedResult),
      )
    })

    test('decodes recipient addresses from erc20 transaction', async () => {
      const contractAddress = '0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6'
      const token = SolidityContract.erc20(contractAddress)
      const transferAddress = '0x0000000000000000000000000000000000abc123'
      const transferData = token.transfer.build(transferAddress, 128)

      const erc20Transaction = {
        ...transaction,
        to: contractAddress,
        data: transferData,
      }

      const simulationResult = await simulateTransactions({
        transactions: [erc20Transaction],
        asset,
      })

      expect(simulationResult.recipientAddresses).toEqual([[transferAddress]])
    })
  })
})
