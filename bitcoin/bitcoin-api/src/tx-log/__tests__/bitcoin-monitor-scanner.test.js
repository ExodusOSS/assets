import { asset as baseAsset } from '@exodus/bitcoin-meta'
import { Address, TxSet, UtxoCollection } from '@exodus/models'
import { when } from 'jest-when'

import { createAccountState } from '../../account-state.js'
import { BitcoinMonitorScanner } from '../bitcoin-monitor-scanner.js'

const purposes = [44, 84, 86]

const toAddress = async ({ assetName, walletAccount, purpose, chainIndex, addressIndex }) => {
  expect(assetName).toBeDefined()
  expect(walletAccount).toBeDefined()
  expect(purposes).toContain(purpose)
  expect(chainIndex).toBeDefined()
  expect(addressIndex).toBeDefined()

  const path = `m/${chainIndex}/${addressIndex}`
  const address = [assetName, walletAccount, purpose, chainIndex, addressIndex]
    .filter((s) => s !== undefined)
    .join('_')
  return Address.create(address, { path })
}

function createInsightClient({ confirmations = 0 } = {}) {
  const insightClient = {
    fetchAllTxData: jest.fn(),
    fetchTx: jest.fn(),
  }
  insightClient.fetchAllTxData
    .mockResolvedValueOnce([
      {
        txid: 'tx1',
        date: '2022-10-17T15:50:34.867Z',
        confirmations,
        inscriptionsIndexed: true,
        vout: [
          {
            value: 0.1,
            n: 0,
            scriptPubKey: {
              addresses: ['bitcoin_exodus0_44_0_3'],
            },
          },
          {
            value: 0.5,
            n: 1,
            scriptPubKey: {
              addresses: ['bitcoin_exodus0_44_0_6'],
            },
          },
          {
            value: 0.2,
            n: 2,
            scriptPubKey: {
              addresses: ['bitcoin_exodus0_44_1_2'],
            },
          },
          {
            value: 0.2,
            n: 3,
            scriptPubKey: {
              addresses: ['bitcoin_exodus0_84_1_1'],
            },
          },
        ],
        vin: [
          {
            tx: 'oldtx1',
            vout: 0,
            addr: 'bitcoin_exodus0_84_1_3',
            value: 0.3,
          },
          {
            value: 0.4,
            tx: 'oldtx2',
            vout: 1,
            addr: 'bitcoin_exodus0_44_0_4',
          },
        ],
      },
    ])
    .mockResolvedValue([])
  return insightClient
}

const asset = { ...baseAsset, address: { toScriptPubKey: (i) => i } }
const currency = asset.currency

const createRescanTest = (gapLimit) => () => {
  test('should get new changedChains values when refresh: true', async () => {
    const walletAccount = 'exodus0'
    const assetName = asset.name
    const refresh = true
    const chain = [0, 0]
    const assetClientInterface = {
      getAssetConfig: jest.fn(() => ({
        gapLimit,
      })),
      getSupportedPurposes: jest.fn(async () => purposes),
      getUnusedAddressIndexes: jest.fn(async (params) => {
        expect(params.assetName).toEqual(assetName)
        expect(params.walletAccount).toEqual(walletAccount)
        // let's return an incomplete array so code can complete the missing purposes.
        return purposes
          .map((purpose) => ({ purpose, chain: [...chain] }))
          .slice(1, purposes.length - 2)
      }),
      getAddress: jest.fn(toAddress),
      getReceiveAddressObject: jest.fn(() =>
        Address.create('bitcoin_exodus0_84_0_0', { path: 'm/0/0' })
      ),
      getAccountState: jest.fn(async () => createAccountState({ asset }).create()),
      getTxLog: jest.fn(async () => TxSet.EMPTY),
    }

    const insightClient = createInsightClient()

    const { txsToAdd, txsToUpdate, utxos, changedUnusedAddressIndexes } =
      await new BitcoinMonitorScanner({
        asset,
        assetClientInterface,
        insightClient,
      }).rescanBlockchainInsight({
        walletAccount,
        refresh,
      })

    expect(changedUnusedAddressIndexes).toEqual([
      {
        chain: [7, 3],
        purpose: 44,
      },
      {
        chain: [0, 2],
        purpose: 84,
      },
    ])
    expect(txsToAdd.length).toEqual(1)
    const expectedTxsToAdd = [
      {
        addresses: [
          {
            address: 'bitcoin_exodus0_44_0_3',
            meta: {
              path: 'm/0/3',
            },
          },
          {
            address: 'bitcoin_exodus0_44_0_6',
            meta: {
              path: 'm/0/6',
            },
          },
        ],
        coinAmount: '0 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          blocksSeen: 0,
          changeAddress: Address.create('bitcoin_exodus0_84_1_1', {
            path: 'm/1/1',
          }),
          feePerKB: null,
          rbfEnabled: undefined,
          inputs: {
            bitcoin_exodus0_44_0_4: {
              address: 'bitcoin_exodus0_44_0_4',
              path: 'm/0/4',
              utxos: [
                {
                  script: 'bitcoin_exodus0_44_0_4',
                  value: '0.4 BTC',
                  vout: 1,
                },
              ],
            },
            bitcoin_exodus0_84_1_3: {
              address: 'bitcoin_exodus0_84_1_3',
              path: 'm/1/3',
              utxos: [
                {
                  script: 'bitcoin_exodus0_84_1_3',
                  value: '0.3 BTC',
                  vout: 0,
                },
              ],
            },
          },
          sent: [],
        },
        dropped: false,
        feeAmount: '0 BTC',
        feeCoinName: 'bitcoin',
        selfSend: true,
        to: 'bitcoin_exodus0_44_0_3',
        txId: 'tx1',
        version: 1,
      },
    ]
    expect(
      TxSet.fromArray(txsToAdd)
        .toJSON()
        .map(({ date, ...tx }) => tx)
    ).toEqual(expectedTxsToAdd)

    expect(txsToUpdate.length).toEqual(0)

    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_3: {
        address: 'bitcoin_exodus0_44_0_3',
        path: 'm/0/3',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.1 BTC',
            vout: 0,
          },
        ],
      },
      bitcoin_exodus0_44_0_6: {
        address: 'bitcoin_exodus0_44_0_6',
        path: 'm/0/6',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.5 BTC',
            vout: 1,
          },
        ],
      },
      bitcoin_exodus0_44_1_2: {
        address: 'bitcoin_exodus0_44_1_2',
        path: 'm/1/2',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 2,
          },
        ],
      },
      bitcoin_exodus0_84_1_1: {
        address: 'bitcoin_exodus0_84_1_1',
        path: 'm/1/1',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 3,
          },
        ],
      },
    })
  })

  test('should remove spent utxos', async () => {
    const walletAccount = 'exodus0'
    const assetName = asset.name
    const refresh = true
    const chain = [0, 0]
    const storedUtxos = UtxoCollection.fromJSON(
      {
        bitcoin_exodus0_84_1_3: {
          address: 'bitcoin_exodus0_84_1_3',
          path: 'm/1/3',
          utxos: [
            {
              confirmations: 1,
              tx: 'oldtx1',
              vout: 0,
              value: '0.3 BTC',
            },
            {
              confirmations: 1,
              tx: 'anotherOne',
              vout: 0,
              value: '0.5 BTC',
            },
          ],
        },
      },
      { currency }
    )
    const assetClientInterface = {
      getAssetConfig: jest.fn(() => ({
        gapLimit,
      })),
      getSupportedPurposes: jest.fn(async () => purposes),
      getUnusedAddressIndexes: jest.fn(async (params) => {
        expect(params.assetName).toEqual(assetName)
        expect(params.walletAccount).toEqual(walletAccount)
        // let's return an incomplete array so code can complete the missing purposes.
        return purposes
          .map((purpose) => ({ purpose, chain: [...chain] }))
          .slice(1, purposes.length - 2)
      }),
      getAddress: jest.fn(toAddress),
      getAccountState: jest.fn(async () =>
        createAccountState({ asset }).create().merge({ utxos: storedUtxos })
      ),
      getReceiveAddressObject: jest.fn(() =>
        Address.create('bitcoin_exodus0_84_0_0', { path: 'm/0/0' })
      ),
      getTxLog: jest.fn(async () => TxSet.EMPTY),
    }

    const insightClient = createInsightClient()

    const { txsToAdd, txsToUpdate, utxos, changedUnusedAddressIndexes } =
      await new BitcoinMonitorScanner({
        asset,
        assetClientInterface,
        insightClient,
      }).rescanBlockchainInsight({
        walletAccount,
        refresh,
      })

    expect(changedUnusedAddressIndexes).toEqual([
      {
        chain: [7, 3],
        purpose: 44,
      },
      {
        chain: [0, 2],
        purpose: 84,
      },
    ])
    expect(txsToAdd.length).toEqual(1)
    const expectedTxsToAdd = [
      {
        addresses: [
          {
            address: 'bitcoin_exodus0_44_0_3',
            meta: {
              path: 'm/0/3',
            },
          },
          {
            address: 'bitcoin_exodus0_44_0_6',
            meta: {
              path: 'm/0/6',
            },
          },
        ],
        coinAmount: '0 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          blocksSeen: 0,
          changeAddress: Address.create('bitcoin_exodus0_84_1_1', {
            path: 'm/1/1',
          }),
          feePerKB: null,
          rbfEnabled: undefined,
          inputs: {
            bitcoin_exodus0_44_0_4: {
              address: 'bitcoin_exodus0_44_0_4',
              path: 'm/0/4',
              utxos: [
                {
                  script: 'bitcoin_exodus0_44_0_4',
                  value: '0.4 BTC',
                  vout: 1,
                },
              ],
            },
            bitcoin_exodus0_84_1_3: {
              address: 'bitcoin_exodus0_84_1_3',
              path: 'm/1/3',
              utxos: [
                {
                  script: 'bitcoin_exodus0_84_1_3',
                  value: '0.3 BTC',
                  vout: 0,
                },
              ],
            },
          },
          sent: [],
        },
        dropped: false,
        feeAmount: '0 BTC',
        feeCoinName: 'bitcoin',
        selfSend: true,
        to: 'bitcoin_exodus0_44_0_3',
        txId: 'tx1',
        version: 1,
      },
    ]
    expect(
      TxSet.fromArray(txsToAdd)
        .toJSON()
        .map(({ date, ...tx }) => tx)
    ).toEqual(expectedTxsToAdd)

    expect(txsToUpdate.length).toEqual(0)

    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_3: {
        address: 'bitcoin_exodus0_44_0_3',
        path: 'm/0/3',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.1 BTC',
            vout: 0,
          },
        ],
      },
      bitcoin_exodus0_44_0_6: {
        address: 'bitcoin_exodus0_44_0_6',
        path: 'm/0/6',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.5 BTC',
            vout: 1,
          },
        ],
      },
      bitcoin_exodus0_44_1_2: {
        address: 'bitcoin_exodus0_44_1_2',
        path: 'm/1/2',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 2,
          },
        ],
      },
      bitcoin_exodus0_84_1_1: {
        address: 'bitcoin_exodus0_84_1_1',
        path: 'm/1/1',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 3,
          },
        ],
      },
    })
  })

  test('should update utxos and ordinals enabled', async () => {
    const walletAccount = 'exodus0'
    const assetName = asset.name
    const refresh = true
    const chain = [0, 0]
    const storedUtxos = UtxoCollection.fromJSON(
      {
        bitcoin_exodus0_44_1_2: {
          address: 'bitcoin_exodus0_44_1_2',
          path: 'm/1/2',
          utxos: [
            {
              confirmations: 0, // overwritten by new tx
              txId: 'tx1',
              value: '0.2 BTC',
              vout: 2,
            },
          ],
        },
      },
      { currency }
    )
    expect(storedUtxos.toJSON()).toEqual({
      bitcoin_exodus0_44_1_2: {
        address: 'bitcoin_exodus0_44_1_2',
        path: 'm/1/2',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 2,
          },
        ],
      },
    })

    const assetClientInterface = {
      getAssetConfig: jest.fn(() => ({
        gapLimit,
      })),
      getSupportedPurposes: jest.fn(async () => purposes),
      getUnusedAddressIndexes: jest.fn(async (params) => {
        expect(params.assetName).toEqual(assetName)
        expect(params.walletAccount).toEqual(walletAccount)
        // let's return an incomplete array so code can complete the missing purposes.
        return purposes
          .map((purpose) => ({ purpose, chain: [...chain] }))
          .slice(1, purposes.length - 2)
      }),
      getAddress: jest.fn(toAddress),
      getAccountState: jest.fn(async () =>
        createAccountState({ asset, ordinalsEnabled: true }).create().merge({ utxos: storedUtxos })
      ),
      getReceiveAddressObject: jest.fn(() =>
        Address.create('bitcoin_exodus0_84_0_0', { path: 'm/0/0' })
      ),
      getTxLog: jest.fn(async () => TxSet.EMPTY),
    }

    const insightClient = createInsightClient({ confirmations: 1 })

    const { txsToAdd, txsToUpdate, utxos, changedUnusedAddressIndexes } =
      await new BitcoinMonitorScanner({
        asset,
        assetClientInterface,
        insightClient,
        ordinalChainIndex: 0,
        ordinalsEnabled: true,
      }).rescanBlockchainInsight({
        walletAccount,
        refresh,
      })

    expect(changedUnusedAddressIndexes).toEqual([
      {
        chain: [7, 3],
        purpose: 44,
      },
      {
        chain: [0, 2],
        purpose: 84,
      },
    ])
    expect(txsToAdd.length).toEqual(1)
    const expectedTxsToAdd = [
      {
        addresses: [
          {
            address: 'bitcoin_exodus0_44_0_3',
            meta: {
              path: 'm/0/3',
            },
          },
          {
            address: 'bitcoin_exodus0_44_0_6',
            meta: {
              path: 'm/0/6',
            },
          },
        ],
        coinAmount: '0 BTC',
        coinName: 'bitcoin',
        confirmations: 1,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          blocksSeen: 0,
          changeAddress: Address.create('bitcoin_exodus0_84_1_1', {
            path: 'm/1/1',
          }),
          feePerKB: null,
          inputs: {
            bitcoin_exodus0_44_0_4: {
              address: 'bitcoin_exodus0_44_0_4',
              path: 'm/0/4',
              utxos: [
                {
                  script: 'bitcoin_exodus0_44_0_4',
                  value: '0.4 BTC',
                  vout: 1,
                },
              ],
            },
            bitcoin_exodus0_84_1_3: {
              address: 'bitcoin_exodus0_84_1_3',
              path: 'm/1/3',
              utxos: [
                {
                  script: 'bitcoin_exodus0_84_1_3',
                  value: '0.3 BTC',
                  vout: 0,
                },
              ],
            },
          },
          rbfEnabled: undefined,
          sent: [],
          inscriptionsIndexed: true,
          receivedInscriptions: [],
          sentInscriptions: [],
        },
        dropped: false,
        feeAmount: '0 BTC',
        feeCoinName: 'bitcoin',
        selfSend: true,
        to: 'bitcoin_exodus0_44_0_3',
        txId: 'tx1',
        version: 1,
      },
    ]
    expect(
      TxSet.fromArray(txsToAdd)
        .toJSON()
        .map(({ date, ...tx }) => tx)
    ).toEqual(expectedTxsToAdd)

    expect(txsToUpdate.length).toEqual(0)

    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_3: {
        address: 'bitcoin_exodus0_44_0_3',
        path: 'm/0/3',
        utxos: [
          {
            confirmations: 1,
            txId: 'tx1',
            value: '0.1 BTC',
            vout: 0,
            inscriptions: [],
            inscriptionsIndexed: true,
          },
        ],
      },
      bitcoin_exodus0_44_0_6: {
        address: 'bitcoin_exodus0_44_0_6',
        path: 'm/0/6',
        utxos: [
          {
            confirmations: 1,
            txId: 'tx1',
            value: '0.5 BTC',
            vout: 1,
            inscriptions: [],
            inscriptionsIndexed: true,
          },
        ],
      },
      bitcoin_exodus0_44_1_2: {
        address: 'bitcoin_exodus0_44_1_2',
        path: 'm/1/2',
        utxos: [
          {
            confirmations: 1,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 2,
            inscriptions: [],
            inscriptionsIndexed: true,
          },
        ],
      },
      bitcoin_exodus0_84_1_1: {
        address: 'bitcoin_exodus0_84_1_1',
        path: 'm/1/1',
        utxos: [
          {
            confirmations: 1,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 3,
            inscriptions: [],
            inscriptionsIndexed: true,
          },
        ],
      },
    })
  })

  test('should exclude utxos when custom shouldExcludeVoutUtxo ', async () => {
    const walletAccount = 'exodus0'
    const assetName = asset.name
    const refresh = true
    const chain = [0, 0]
    const assetClientInterface = {
      getAssetConfig: jest.fn(() => ({
        gapLimit,
      })),
      getSupportedPurposes: jest.fn(async () => purposes),
      getUnusedAddressIndexes: jest.fn(async (params) => {
        expect(params.assetName).toEqual(assetName)
        expect(params.walletAccount).toEqual(walletAccount)
        // let's return an incomplete array so code can complete the missing purposes.
        return purposes
          .map((purpose) => ({ purpose, chain: [...chain] }))
          .slice(1, purposes.length - 2)
      }),
      getAddress: jest.fn(toAddress),
      getAccountState: jest.fn(async () => createAccountState({ asset }).create()),
      getReceiveAddressObject: jest.fn(() =>
        Address.create('bitcoin_exodus0_84_0_0', { path: 'm/0/0' })
      ),
      getTxLog: jest.fn(async () => TxSet.EMPTY),
    }

    const shouldExcludeVoutUtxo = ({ vout }) => {
      return vout.value < 0.11
    }

    const insightClient = createInsightClient()

    const { txsToAdd, txsToUpdate, utxos, changedUnusedAddressIndexes } =
      await new BitcoinMonitorScanner({
        asset,
        assetClientInterface,
        insightClient,
        shouldExcludeVoutUtxo,
      }).rescanBlockchainInsight({
        walletAccount,
        refresh,
      })

    expect(changedUnusedAddressIndexes).toEqual([
      {
        chain: [7, 3],
        purpose: 44,
      },
      {
        chain: [0, 2],
        purpose: 84,
      },
    ])
    expect(txsToAdd.length).toEqual(1)
    const expectedTxsToAdd = [
      {
        addresses: [
          {
            address: 'bitcoin_exodus0_44_0_3',
            meta: {
              path: 'm/0/3',
            },
          },
          {
            address: 'bitcoin_exodus0_44_0_6',
            meta: {
              path: 'm/0/6',
            },
          },
        ],
        coinAmount: '0 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          blocksSeen: 0,
          changeAddress: Address.create('bitcoin_exodus0_84_1_1', {
            path: 'm/1/1',
          }),
          feePerKB: null,
          inputs: {
            bitcoin_exodus0_44_0_4: {
              address: 'bitcoin_exodus0_44_0_4',
              path: 'm/0/4',
              utxos: [
                {
                  script: 'bitcoin_exodus0_44_0_4',
                  value: '0.4 BTC',
                  vout: 1,
                },
              ],
            },
            bitcoin_exodus0_84_1_3: {
              address: 'bitcoin_exodus0_84_1_3',
              path: 'm/1/3',
              utxos: [
                {
                  script: 'bitcoin_exodus0_84_1_3',
                  value: '0.3 BTC',
                  vout: 0,
                },
              ],
            },
          },
          rbfEnabled: undefined,
          sent: [],
        },
        dropped: false,
        feeAmount: '0 BTC',
        feeCoinName: 'bitcoin',
        selfSend: true,
        to: 'bitcoin_exodus0_44_0_3',
        txId: 'tx1',
        version: 1,
      },
    ]
    expect(
      TxSet.fromArray(txsToAdd)
        .toJSON()
        .map(({ date, ...tx }) => tx)
    ).toEqual(expectedTxsToAdd)

    expect(txsToUpdate.length).toEqual(0)

    // first utxo is excluded
    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_6: {
        address: 'bitcoin_exodus0_44_0_6',
        path: 'm/0/6',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.5 BTC',
            vout: 1,
          },
        ],
      },
      bitcoin_exodus0_44_1_2: {
        address: 'bitcoin_exodus0_44_1_2',
        path: 'm/1/2',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 2,
          },
        ],
      },
      bitcoin_exodus0_84_1_1: {
        address: 'bitcoin_exodus0_84_1_1',
        path: 'm/1/1',
        utxos: [
          {
            confirmations: 0,
            txId: 'tx1',
            value: '0.2 BTC',
            vout: 3,
          },
        ],
      },
    })
  })
}

describe('rescanBlockchainInsight tests', createRescanTest())
describe('rescanBlockchainInsight tests with gapLimit config', createRescanTest(20))

test('should get no new changedChains values when refresh: true and gapLimit 0', async () => {
  const walletAccount = 'exodus0'
  const assetName = asset.name
  const refresh = true
  const chain = [0, 0]
  const assetClientInterface = {
    getAssetConfig: jest.fn(() => ({
      gapLimit: 0,
    })),
    getSupportedPurposes: jest.fn(async () => purposes),
    getUnusedAddressIndexes: jest.fn(async (params) => {
      expect(params.assetName).toEqual(assetName)
      expect(params.walletAccount).toEqual(walletAccount)
      // let's return an incomplete array so code can complete the missing purposes.
      return purposes
        .map((purpose) => ({ purpose, chain: [...chain] }))
        .slice(1, purposes.length - 2)
    }),
    getAddress: jest.fn(toAddress),
    getReceiveAddressObject: jest.fn(() =>
      Address.create('bitcoin_exodus0_84_0_0', { path: 'm/0/0' })
    ),
    getAccountState: jest.fn(async () => createAccountState({ asset }).create()),
    getTxLog: jest.fn(async () => TxSet.EMPTY),
  }

  const insightClient = createInsightClient()

  const { txsToAdd, txsToUpdate, changedUnusedAddressIndexes } = await new BitcoinMonitorScanner({
    asset,
    assetClientInterface,
    insightClient,
  }).rescanBlockchainInsight({
    walletAccount,
    refresh,
  })

  expect(changedUnusedAddressIndexes).toEqual([])
  expect(txsToAdd.length).toEqual(1)
  const expectedTxsToAdd = [
    {
      currencies: {
        bitcoin: {
          BTC: 8,
          bits: 2,
          satoshis: 0,
        },
      },
      txId: 'tx1',
      confirmations: 0,
      dropped: false,
      coinAmount: '0 BTC',
      coinName: 'bitcoin',
      from: ['bitcoin_exodus0_84_1_3', 'bitcoin_exodus0_44_0_4'],
      data: { feePerKB: null, rbfEnabled: undefined, blocksSeen: 0 },
      version: 1,
    },
  ]
  expect(
    TxSet.fromArray(txsToAdd)
      .toJSON()
      .map(({ date, ...tx }) => tx)
  ).toEqual(expectedTxsToAdd)

  expect(txsToUpdate.length).toEqual(0)
})

describe('rescanOnNewBlock tests', () => {
  const init = ({ utxosConfirmations, txConfirmations }) => {
    const walletAccount = 'exodus0'
    const assetName = asset.name
    const chain = [0, 0]
    const ordinalUtxos = UtxoCollection.fromArray(
      [
        {
          address: Address.create('bitcoin_exodus0_44_0_3'),
          path: 'm/0/3',
          confirmations: utxosConfirmations,
          txId: 'tx1',
          value: '0.1 BTC',
        },
      ],
      { currency }
    )
    expect(ordinalUtxos.toArray().length).toBe(1)

    const assetClientInterface = {
      getAssetConfig: jest.fn(() => ({})),
      getSupportedPurposes: jest.fn(async () => purposes),
      getUnusedAddressIndexes: jest.fn(async (params) => {
        expect(params.assetName).toEqual(assetName)
        expect(params.walletAccount).toEqual(walletAccount)
        // let's return an incomplete array so code can complete the missing purposes.
        return purposes
          .map((purpose) => ({ purpose, chain: [...chain] }))
          .slice(1, purposes.length - 2)
      }),
      getAddress: jest.fn(toAddress),
      getAccountState: jest.fn(async () =>
        createAccountState({ asset }).create({ utxos: ordinalUtxos })
      ),
      getTxLog: jest.fn(async () =>
        TxSet.fromArray([
          {
            addresses: [
              {
                address: 'bitcoin_exodus0_44_0_3',
                meta: {
                  path: 'm/0/3',
                },
              },
              {
                address: 'bitcoin_exodus0_44_0_6',
                meta: {
                  path: 'm/0/6',
                },
              },
            ],
            coinAmount: '0 BTC',
            coinName: 'bitcoin',
            date: new Date(),
            data: {
              blocksSeen: 0,
              changeAddress: Address.create('bitcoin_exodus0_84_1_1', {
                path: 'm/1/1',
              }),
              feePerKB: null,
              rbfEnabled: undefined,
              sent: [],
            },
            currencies: {
              bitcoin: {
                BTC: 8,
                bits: 2,
                satoshis: 0,
              },
            },
            confirmations: txConfirmations,
            dropped: false,
            feeAmount: '0 BTC',
            feeCoinName: 'bitcoin',
            selfSend: true,
            to: 'bitcoin_exodus0_44_0_3',
            txId: 'tx1',
          },
        ])
      ),
    }

    const insightClient = createInsightClient()

    when(insightClient.fetchTx).calledWith('tx1').mockResolvedValue({ confirmations: 1 })

    return { insightClient, assetClientInterface, walletAccount }
  }

  test('utxosConfirmations: 0, txConfirmations:0', async () => {
    const { assetClientInterface, insightClient, walletAccount } = init({
      utxosConfirmations: 0,
      txConfirmations: 0,
    })
    const { txsToUpdate, utxos } = await new BitcoinMonitorScanner({
      asset,
      assetClientInterface,
      insightClient,
    }).rescanOnNewBlock({
      walletAccount,
    })

    expect(txsToUpdate).toEqual([
      {
        txId: 'tx1',
        confirmations: 1,
      },
    ])

    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_3: {
        address: 'bitcoin_exodus0_44_0_3',
        utxos: [
          {
            confirmations: 1,
            path: 'm/0/3',
            txId: 'tx1',
            value: '0.1 BTC',
          },
        ],
      },
    })
    expect(insightClient.fetchTx).toBeCalled()
  })

  test('utxosConfirmations: 0, txConfirmations: 1', async () => {
    const { assetClientInterface, insightClient, walletAccount } = init({
      utxosConfirmations: 0,
      txConfirmations: 1,
    })

    const { txsToUpdate, utxos } = await new BitcoinMonitorScanner({
      asset,
      assetClientInterface,
      insightClient,
    }).rescanOnNewBlock({
      walletAccount,
    })

    expect(txsToUpdate).toEqual([])

    expect(utxos.toJSON()).toEqual({
      bitcoin_exodus0_44_0_3: {
        address: 'bitcoin_exodus0_44_0_3',
        utxos: [
          {
            confirmations: 1,
            path: 'm/0/3',
            txId: 'tx1',
            value: '0.1 BTC',
          },
        ],
      },
    })
  })

  test('utxosConfirmations: 1, txConfirmations: 0', async () => {
    const { assetClientInterface, insightClient, walletAccount } = init({
      utxosConfirmations: 1,
      txConfirmations: 0,
    })

    const { txsToUpdate, utxos } = await new BitcoinMonitorScanner({
      asset,
      assetClientInterface,
      insightClient,
    }).rescanOnNewBlock({
      walletAccount,
    })

    expect(txsToUpdate).toEqual([
      {
        confirmations: 1,
        txId: 'tx1',
      },
    ])

    expect(utxos).toEqual(null)
    expect(insightClient.fetchTx).toBeCalled()
  })

  test('utxosConfirmations: 1, txConfirmations: 1', async () => {
    const { assetClientInterface, insightClient, walletAccount } = init({
      utxosConfirmations: 1,
      txConfirmations: 1,
    })

    const { txsToUpdate, utxos } = await new BitcoinMonitorScanner({
      asset,
      assetClientInterface,
      insightClient,
    }).rescanOnNewBlock({
      walletAccount,
    })

    expect(txsToUpdate).toEqual([])

    expect(utxos).toEqual(null)
    expect(insightClient.fetchTx).not.toBeCalled()
  })
})
