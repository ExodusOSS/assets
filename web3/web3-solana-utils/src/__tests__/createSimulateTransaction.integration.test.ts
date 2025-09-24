import { createCurrency, createEmptySimulationResult } from '@exodus/web3-utils'

import { deserializeTransaction } from './../transactions.js'

// Mock the entire module
jest.mock('../simulation/simulateTransactions.js', () => ({
  __esModule: true,
  simulateTransactions: jest.fn(), // Mock the function
  getTransactionFee: jest.fn(), // If other functions need to be mocked
}))

const { getTransactionFee, simulateTransactions } = await import(
  '../simulation/simulateTransactions.js'
)

const { createSimulateTransactions } = await import(
  '../createSimulateTransactions.js'
)

// Fixes issues of not being able to direclty compare objects with BigNumber (currency) values
const fixObjectForComparison = (object) => {
  return JSON.parse(JSON.stringify(object))
}

describe('createSimulateTransaction', () => {
  it('should return a function', () => {
    expect(typeof createSimulateTransactions({})).toBe('function')
  })

  describe('simulateTransaction', () => {
    const encodedTransactions = [
      'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAIF+CuAwYV6y20dIOZfz9b2A6CwChv7xwqERWo7ic8Bz8kCgUkQaFYTleMcAX2p74eBXQZd1dwDyQZAPJfSv2KGc5EbpmE+8f0oGn0/NrUsfxm0OTJmQpeNTbl4Hh3gVFWEEzEJ27+yCPTLxiX3g8oBEiMjUePuXMgO0cgLSIPsKfQZ7KebfdHLzVcPqovay+Vlz27QoEHRRm1xE4VqGopZu16Fv7Yc6b0K2IpLG+eRUersk7/DD6K2KWLMO47J56tT3qXxKITYNYZzxYlxPFzbRfxLm9tmkikm8DG8at+UsM4jaNyRbU2sLMNu/0mf9FZxPRwAxgqbxThJ8b8XzvzBXSfy4ZlYgmmfiw1KM8UCEl1K90asGYQn+LneHiApK5Jb6/EfBpwlfNsSDni6f/xfiAXFnORpisV0XlymYUMOzO1t/o7of11CaMxVt95A6xBISv1L4E2ufYqBw2wQyQ8PJ3i+HfoPa7GiI9Dq7WuezEbt4w0lgiX/OWnuCwW4g/xl+YqX+8UUh76h8HsflPRPRAiCqHs9Gw4V+zFylYGa2xz8PpPcTDG+/30KW7dKihhxz36e3xWCl5Gopjc5xDu73b8ecBhU3BupczVF0GqHyV2XDqzjceM6n0inZ6f12Od7wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpC2K6B09yLJ1BFPLY9woAxmACM3ub+QyHNlem0gHbTICMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXo4eD4qab8X/JC5PNRe/Ae1rLdGVGgurbZQ1clkoYE93CTMVQ1D5ItDt6npBXw33y9uhmrbvCVWp/J3GPrppgq5gYQAAUCwFwVABQGAAQAJw8SAQEPAgAEDAIAAAD0nWEEAAAAABIBBAEREUoSCwAEAQgDJxMRERURLxI0NQsBJAglDi8SMzILASIMIwUrCwwGAgoZGywaHC0XGCkSKA8mHR4WLg0HHykqEigRLxIwMQsGIQggCTTBIJszQdacgQAEAAAAAB0ABABHAAIhfC8RkmQCAwBkAwT0nWEEAAAAAFP93wMAAAAAMgAAEgMEAAABCQRmJUKroDNZuiXrt/C9s1qJxN/qbWrXPZ+ymayUByoapQmzd2ZxZXJoaWwJBgUADC8BcHRquM6L2ibVdOlfetVExIjHPa+TkbvSm6EeIEqCxLsFiygCQkMDN0BBoU1glM4jpNVIQiddowgcFgwOsRXtBW5FGV5ccg73PyECm5oCmZgJtywXjnzalK+ydbej85J8c/5xwvKXL3JOCmPI7wRiVgI3NgI0NQ==',
    ]
    const transactions = encodedTransactions.map((encodedTransaction) =>
      deserializeTransaction(encodedTransaction),
    )

    expect(transactions.length).toEqual(1)

    const asset = {
      name: 'solana',
      baseAssetName: 'solana',
      currency: {
        defaultUnit: {
          power: 0,
        },
        baseUnit: (amount) =>
          createCurrency({
            amount,
            symbol: 'SOL',
            denominator: 16,
          }),
        ZERO: { add: jest.fn() },
      },
    }

    let simulateTransaction
    const assetClientInterface = {
      getFeeConfig: () => {},
    }

    beforeEach(() => {
      jest.resetAllMocks()
      simulateTransaction = createSimulateTransactions({ assetClientInterface })
    })

    it('should return the simulation result', async () => {
      const willSendBalance = createCurrency({
        amount: '100000000000000',
        symbol: 'SOL',
        denominator: 9,
      })
      const willReceiveBalance = createCurrency({
        amount: '56000000',
        symbol: 'SOL',
        denominator: 9,
      })
      const advancedDetails = [
        {
          title: 'Unknown',
          instructions: [
            {
              name: 'Program Id',
              value: 'ComputeBudget111111111111111111111111111111',
              formattedValue: 'Comp..1111',
            },
            { name: 'Raw Data', value: 'AsBcFQA=', formattedValue: 'AsBcFQA=' },
          ],
        },
        {
          title: 'Create Token Account',
          instructions: [
            {
              name: 'Program Id',
              value: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
              formattedValue: 'ATok..8knL',
            },
          ],
        },
        {
          title: 'Transfer SOL',
          instructions: [
            {
              name: 'From Public Key',
              value: 'G84DqD1dsjNq3UCGpnyYmSKwHpz1ZwyzBXGwarE9CNh9',
              formattedValue: 'G84D..CNh9',
            },
            {
              name: 'To Public Key',
              value: '7ynxvuQQ3jtZee3qguFVMUraBq8EitAJZm7GrUa1PJdJ',
              formattedValue: '7ynx..PJdJ',
            },
            {
              name: 'Amount',
              value: '0.0735 SOL',
              formattedValue: '0.0735 SOL',
            },
          ],
        },
        {
          title: 'Create Sync Native Account',
          instructions: [
            {
              name: 'Public Key',
              value: '7ynxvuQQ3jtZee3qguFVMUraBq8EitAJZm7GrUa1PJdJ',
              formattedValue: '7ynx..PJdJ',
            },
          ],
        },
        {
          title: 'Unknown',
          instructions: [
            {
              name: 'Program Id',
              value: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
              formattedValue: 'JUP6..TaV4',
            },
            {
              name: 'Raw Data',
              value:
                'wSCbM0HWnIEABAAAAAAdAAQARwACIXwvEZJkAgMAZAME9J1hBAAAAABT/d8DAAAAADIAAA==',
              formattedValue: 'wSCb..AA==',
            },
          ],
        },
        {
          title: 'Close Account',
          instructions: [
            {
              name: 'Source Public Key',
              value: '7ynxvuQQ3jtZee3qguFVMUraBq8EitAJZm7GrUa1PJdJ',
              formattedValue: '7ynx..PJdJ',
            },
            {
              name: 'Destination Public Key',
              value: 'G84DqD1dsjNq3UCGpnyYmSKwHpz1ZwyzBXGwarE9CNh9',
              formattedValue: 'G84D..CNh9',
            },
            {
              name: 'Owner Public Key',
              value: 'G84DqD1dsjNq3UCGpnyYmSKwHpz1ZwyzBXGwarE9CNh9',
              formattedValue: 'G84D..CNh9',
            },
          ],
        },
      ]

      simulateTransactions.mockImplementation(({ simulationResult }) => {
        simulationResult.balanceChanges.willSend.push(willSendBalance)
        simulationResult.balanceChanges.willReceive.push(willReceiveBalance)
        simulationResult.advancedDetails = advancedDetails
        simulationResult.recipientAddresses = [[]]
      })

      const simulationResult = await simulateTransaction({
        transactions,
        asset,
      })

      const expectedResult = createEmptySimulationResult({ asset })
      expectedResult.balanceChanges.willPayFee.push({
        balance: getTransactionFee(transactions),
      })
      expectedResult.balanceChanges.willSend.push(willSendBalance)
      expectedResult.balanceChanges.willReceive.push(willReceiveBalance)
      expectedResult.advancedDetails = advancedDetails
      expectedResult.recipientAddresses = [[]]

      expect(fixObjectForComparison(simulationResult)).toEqual(
        fixObjectForComparison(expectedResult),
      )
    })
  })
})
