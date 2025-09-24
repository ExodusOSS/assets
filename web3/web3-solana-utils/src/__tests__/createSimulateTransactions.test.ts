import { prepareForSigning } from '@exodus/solana-lib'
import plugin from '@exodus/solana-plugin' // eslint-disable-line @exodus/import/no-extraneous-dependencies -- not declaring this as a dependency to avoid circular dependencies
import { mock } from 'node:test'

import {
  SOLANA_LEGACY_TX,
  SOLANA_MULTI_TRANSFER_TX,
  SOLANA_TOKEN_TRANSFER,
  SOLANA_TX,
  SOLANA_VERSIONED_LEGACY_TX,
} from './fixture.js'

mock.module('./../simulation/simulateTransactions.js', {
  namedExports: {
    getTransactionFee: jest.fn(),
    simulateTransactions: jest.fn().mockReturnValue(async () => ({})),
  },
})

const { createSimulateTransactions } = await import(
  './../createSimulateTransactions.js'
)

const assetClientInterface = {}
const solana = plugin.createAsset({ assetClientInterface })

describe('createSimulateTransactions', () => {
  let simulateTransactions

  beforeEach(() => {
    simulateTransactions = createSimulateTransactions({
      assetClientInterface,
      prepareForSigning,
    })
  })

  test('returns recipient addresses for transactions', async () => {
    const result = await simulateTransactions({
      asset: solana,
      transactions: [SOLANA_TX, SOLANA_TOKEN_TRANSFER],
    })

    expect(result.recipientAddresses).toEqual([
      ['5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk'],
      ['HepCfJ2Y7aftckvDFzN5PHTLd3NVr28We2ir729szDAa'],
    ])
  })

  test('returns recipient addresses for legacy transaction', async () => {
    const result = await simulateTransactions({
      asset: solana,
      transactions: [SOLANA_LEGACY_TX],
    })

    expect(result.recipientAddresses).toEqual([
      ['5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk'],
    ])
  })

  test('returns recipient addresses for versioned transaction with legacy message', async () => {
    const result = await simulateTransactions({
      asset: solana,
      transactions: [SOLANA_VERSIONED_LEGACY_TX],
    })

    expect(result.recipientAddresses).toEqual([
      ['5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk'],
    ])
  })

  test('returns all addresses for multi-instruction tx', async () => {
    const result = await simulateTransactions({
      asset: solana,
      transactions: [SOLANA_MULTI_TRANSFER_TX],
    })

    expect(result.recipientAddresses).toEqual([
      [
        '5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk',
        'HepCfJ2Y7aftckvDFzN5PHTLd3NVr28We2ir729szDAa',
      ],
    ])
  })
})
