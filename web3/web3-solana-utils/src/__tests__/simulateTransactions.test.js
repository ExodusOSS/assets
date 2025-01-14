import { Transaction, PublicKey, VersionedTransaction } from '@exodus/solana-web3.js'
import * as web3UtilActual from '@exodus/web3-utils'

const mockGetFeeForMessage = jest.fn()
jest.mock('@exodus/solana-api', () => ({ __esModule: true, ...{ getFeeForMessage: mockGetFeeForMessage } }))
jest.mock('@exodus/web3-utils', () => ({ ...web3UtilActual, __esModule: true, makeSimulationAPICall: jest.fn(() => Promise.resolve()) }))

const {
  createCurrency,
  createEmptySimulationResult,
  makeSimulationAPICall,
} = (await import('@exodus/web3-utils'))

const mockMakeSimulationAPICall = makeSimulationAPICall

const { getTransactionFee, simulateTransactions } = (await import('../simulation/simulateTransactions.ts'))
const { deserializeTransaction } = (await import('../transactions.js'))

const apiEndpoint = 'simulation-service.xyz'
const origin = 'test.xyz'

// Not able to direclty compare objects with BigNumber (currency) values
const fixObjectForComparison = (object) => {
  return JSON.parse(JSON.stringify(object))
}

const encodedTransactions = [
  'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQAIF+CuAwYV6y20dIOZfz9b2A6CwChv7xwqERWo7ic8Bz8kCgUkQaFYTleMcAX2p74eBXQZd1dwDyQZAPJfSv2KGc5EbpmE+8f0oGn0/NrUsfxm0OTJmQpeNTbl4Hh3gVFWEEzEJ27+yCPTLxiX3g8oBEiMjUePuXMgO0cgLSIPsKfQZ7KebfdHLzVcPqovay+Vlz27QoEHRRm1xE4VqGopZu16Fv7Yc6b0K2IpLG+eRUersk7/DD6K2KWLMO47J56tT3qXxKITYNYZzxYlxPFzbRfxLm9tmkikm8DG8at+UsM4jaNyRbU2sLMNu/0mf9FZxPRwAxgqbxThJ8b8XzvzBXSfy4ZlYgmmfiw1KM8UCEl1K90asGYQn+LneHiApK5Jb6/EfBpwlfNsSDni6f/xfiAXFnORpisV0XlymYUMOzO1t/o7of11CaMxVt95A6xBISv1L4E2ufYqBw2wQyQ8PJ3i+HfoPa7GiI9Dq7WuezEbt4w0lgiX/OWnuCwW4g/xl+YqX+8UUh76h8HsflPRPRAiCqHs9Gw4V+zFylYGa2xz8PpPcTDG+/30KW7dKihhxz36e3xWCl5Gopjc5xDu73b8ecBhU3BupczVF0GqHyV2XDqzjceM6n0inZ6f12Od7wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwZGb+UhFzL/7K26csOb57yM5bvF9xJrLEObOkAAAAAEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTjwbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpC2K6B09yLJ1BFPLY9woAxmACM3ub+QyHNlem0gHbTICMlyWPTiSJ8bs9ECkUjg2DC1oTmdr/EIQEjnvY2+n4WbQ/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXo4eD4qab8X/JC5PNRe/Ae1rLdGVGgurbZQ1clkoYE93CTMVQ1D5ItDt6npBXw33y9uhmrbvCVWp/J3GPrppgq5gYQAAUCwFwVABQGAAQAJw8SAQEPAgAEDAIAAAD0nWEEAAAAABIBBAEREUoSCwAEAQgDJxMRERURLxI0NQsBJAglDi8SMzILASIMIwUrCwwGAgoZGywaHC0XGCkSKA8mHR4WLg0HHykqEigRLxIwMQsGIQggCTTBIJszQdacgQAEAAAAAB0ABABHAAIhfC8RkmQCAwBkAwT0nWEEAAAAAFP93wMAAAAAMgAAEgMEAAABCQRmJUKroDNZuiXrt/C9s1qJxN/qbWrXPZ+ymayUByoapQmzd2ZxZXJoaWwJBgUADC8BcHRquM6L2ibVdOlfetVExIjHPa+TkbvSm6EeIEqCxLsFiygCQkMDN0BBoU1glM4jpNVIQiddowgcFgwOsRXtBW5FGV5ccg73PyECm5oCmZgJtywXjnzalK+ydbej85J8c/5xwvKXL3JOCmPI7wRiVgI3NgI0NQ==',
]
const transactions = encodedTransactions.map((encodedTransaction) =>
  deserializeTransaction(encodedTransaction),
)
const senderAddress = 'G84DqD1dsjNq3UCGpnyYmSKwHpz1ZwyzBXGwarE9CNh9'
const asset = {
  name: 'solana',
  baseAssetName: 'solana',
  displayTicker: 'SOL',
  currency: {
    defaultUnit: {
      power: 0,
    },
    baseUnit: (amount) =>
      createCurrency({
        amount,
        symbol: 'SOL',
        denominator: 9,
      }),
    ZERO: createCurrency({
      amount: 0,
      symbol: 'SOL',
      denominator: 9,
    }),
  },
}
asset.baseAsset = asset

describe('simulateTransaction', () => {
  beforeEach(() => {
    // Silence console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('calls "makeSimulationAPICall" with the proper parameters', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: { expectedStateChanges: [] },
      perTransaction: [],
    })
    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      senderAddress,
      simulationResult,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalledWith({
      url: apiEndpoint,
      network: 'solana',
      chain: 'mainnet',
      headers: undefined,
      payload: {
        transactions: encodedTransactions,
        metadata: {
          origin,
        },
        userAccount: senderAddress,
      },
    })
  })

  it('should return the simulation result from blowfish endpoint', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: {
        action: 'NONE',
        warnings: [],
        error: null,
        expectedStateChanges: {
          G84DqD1dsjNq3UCGpnyYmSKwHpz1ZwyzBXGwarE9CNh9: [
            {
              humanReadableDiff: 'Send 0.07350 SOL',
              suggestedColor: 'DEBIT',
              rawInfo: {
                kind: 'SOL_TRANSFER',
                data: {
                  asset: {
                    symbol: 'SOL',
                    name: 'Solana Native Token',
                    decimals: 9,
                    price: {
                      source: 'Coingecko',
                      updatedAt: 1693314075,
                      dollarValuePerToken: 20.25,
                    },
                  },
                  diff: {
                    sign: 'MINUS',
                    digits: 73506292,
                  },
                },
              },
            },
            {
              humanReadableDiff: 'Receive 0.06501 mSOL',
              suggestedColor: 'CREDIT',
              rawInfo: {
                kind: 'SPL_TRANSFER',
                data: {
                  asset: {
                    symbol: 'mSOL',
                    name: 'Marinade staked SOL (mSOL)',
                    mint: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
                    decimals: 9,
                    supply: 4663845070207266,
                    metaplexTokenStandard: 'unknown',
                    price: {
                      source: 'Coingecko',
                      updatedAt: 1693314145,
                      dollarValuePerToken: 22.84,
                    },
                    imageUrl:
                      'https://d1ts37qlq4uz4s.cloudfront.net/solana__solana%3A%3Asolana__solana%3A%3Asolana%3A%3Amainnet__mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png',
                  },
                  diff: {
                    sign: 'PLUS',
                    digits: 65010992,
                  },
                },
              },
            },
          ],
        },
      },
      perTransaction: [
        {
          isNonceValid: true,
          error: null,
          raw: {
            err: null,
            logs: [
              'Program ComputeBudget111111111111111111111111111111 invoke [1]',
              'Program ComputeBudget111111111111111111111111111111 success',
              'Program ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL invoke [1]',
              'Program log: CreateIdempotent',
              'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [2]',
              'Program log: Instruction: GetAccountDataSize',
              'Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 1569 of 1393095 compute units',
              'Log truncated',
            ],
            unitsConsumed: 497283,
            returnData: null,
          },
          protocols: [
            {
              trustLevel: 'NATIVE',
              name: 'Token Program',
              description: 'Manage your tokens and NFTs',
              imageUrl:
                'https://d2xobe0ejktb0m.cloudfront.net/attwHpLGzRgxmWdXz.png',
              websiteUrl: 'https://solana.com/',
            },
          ],
          instructions: [
            {
              protocolIndex: 0,
            },
          ],
        },
      ],
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
    }

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(fixObjectForComparison(simulationResult)).toEqual(
      fixObjectForComparison({
        balanceChanges: {
          willApprove: [],
          willSend: [
            {
              asset: {
                address: '11111111111111111111111111111111',
                name: 'Solana Native Token',
                symbol: 'SOL',
              },
              balance: createCurrency({
                amount: '73506292',
                symbol: 'SOL',
                denominator: 9,
              }),
            },
          ],
          willReceive: [
            {
              asset: {
                address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
                imageUrl:
                  'https://d1ts37qlq4uz4s.cloudfront.net/solana__solana%3A%3Asolana__solana%3A%3Asolana%3A%3Amainnet__mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So.png',
                name: 'Marinade staked SOL (mSOL)',
                symbol: 'mSOL',
              },
              balance: createCurrency({
                amount: '65010992',
                symbol: 'mSOL',
                denominator: 9,
              }),
            },
          ],
        },
        metadata: {
          simulatedLocally: false,
        },
        warnings: [],
      }),
    )
  })

  it('should return a critical warning if Blowfish guides to block a transaction', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: {
        action: 'BLOCK',
        warnings: [],
        error: null,
        expectedStateChanges: {},
      },
      perTransaction: [],
    })

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(simulationResult.warnings[0].severity).toEqual('CRITICAL')
  })

  it('should return insufficient_funds warning', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: { expectedStateChanges: [] },
      perTransaction: [
        {
          error: {
            kind: `PROGRAM_ERROR`,
            solanaProgramAddress: '11111111111111111111111111111111',
            humanReadableError:
              'account does not have enough SOL to perform the operation',
            idlErrorKind: null,
          },
        },
      ],
    })

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(simulationResult.warnings).toEqual([
      {
        kind: 'INSUFFICIENT_FUNDS',
        severity: 'WARNING',
        message: 'Insufficient funds to perform the operation.',
      },
    ])
  })

  it('should return insufficient_funds warning (SPL case)', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: { expectedStateChanges: [] },
      perTransaction: [
        {
          error: {
            kind: `PROGRAM_ERROR`,
            solanaProgramAddress: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            humanReadableError: 'Insufficient funds',
            idlErrorKind: null,
          },
        },
      ],
    })

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(simulationResult.warnings).toEqual([
      {
        kind: 'INSUFFICIENT_FUNDS',
        severity: 'WARNING',
        message: 'Insufficient funds to perform the operation.',
      },
    ])
  })

  it('should raise a "HIGH" severity if a simulation error happened', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce({
      aggregated: { expectedStateChanges: [], error: { kind: 'FAILED' } },
      perTransaction: [],
    })

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(simulationResult.warnings).toEqual([
      {
        kind: 'INTERNAL_ERROR',
        severity: 'HIGH',
        message: 'Balance changes cannot be estimated.',
      },
    ])
  })

  it('should raise a "HIGH" severity if a simulation API call failed', async () => {
    mockMakeSimulationAPICall.mockResolvedValueOnce(null)

    const simulationResult = createEmptySimulationResult({ asset })

    await simulateTransactions({
      asset,
      transactions,
      apiEndpoint,
      origin,
      simulationResult,
      senderAddress,
    })

    expect(mockMakeSimulationAPICall).toHaveBeenCalled()

    expect(simulationResult.warnings).toEqual([
      {
        kind: 'INTERNAL_ERROR',
        severity: 'HIGH',
        message: 'Balance changes cannot be estimated.',
      },
    ])
  })
})

describe('getTransactionFee', () => {
  const mockGetFeeData = jest.fn()
  // Just a random Solana address, which is not involved in any transactions in the tests.
  const randomSolanaAddress = 'BTkLkyDTR8PQqDirPfFiVuNMSKTgoBncM2pRVVdGy9Jr'
  const baseUnits = 5000
  const fee = asset.currency.baseUnit(baseUnits)

  beforeEach(() => {
    mockGetFeeData.mockResolvedValueOnce({ fee })
    mockGetFeeForMessage.mockResolvedValueOnce(baseUnits)
  })

  it('returns a non-zero fee for a Versioned transaction when sender is paying for fees', async () => {
    const result = await getTransactionFee({
      asset,
      getFeeData: mockGetFeeData,
      transactionsMessages: transactions,
      senderAddress,
    })

    expect(result).toEqual(fee)
  })

  it('returns a non-zero fee for a VersionedTransaction class instance that wraps a legacy transaction', async () => {
    const legacyTransaction = new Transaction()
    legacyTransaction.feePayer = new PublicKey(senderAddress)
    // Recent blockhash is required to compile a message.
    legacyTransaction.recentBlockhash = 'GakhnvaSYbe47YkoDDbgY3tDZrAgTzoB2YRFjahidS21'
    const versionedTransaction = VersionedTransaction.deserialize(
      legacyTransaction.serialize({ requireAllSignatures: false, verifySignatures: false })
    )

    const result = await getTransactionFee({
      asset,
      getFeeData: mockGetFeeData,
      transactionsMessages: [versionedTransaction],
      senderAddress,
    })

    expect(result).toEqual(fee)
  })

  it('returns a zero fee for a "sponsored" Versioned transaction', async () => {
    const result = await getTransactionFee({
      asset,
      getFeeData: mockGetFeeData,
      transactionsMessages: transactions,
      senderAddress: randomSolanaAddress,
    })

    expect(result).toEqual(asset.currency.ZERO)
  })

  it('returns a zero fee for a "sponsored" Legacy transaction', async () => {
    const legacyTransaction = new Transaction()
    legacyTransaction.feePayer = new PublicKey(senderAddress)
    // Recent blockhash is required to compile a message.
    legacyTransaction.recentBlockhash = 'GakhnvaSYbe47YkoDDbgY3tDZrAgTzoB2YRFjahidS21'

    const result = await getTransactionFee({
      asset,
      getFeeData: mockGetFeeData,
      transactionsMessages: [legacyTransaction],
      senderAddress: randomSolanaAddress,
    })

    expect(result).toEqual(asset.currency.ZERO)
  })
})
