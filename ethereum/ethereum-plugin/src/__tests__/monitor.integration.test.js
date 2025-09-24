import {
  collectBalances,
  getPrivateSeed,
  getTestingSeed,
  monitorIntegrationTester,
} from '@exodus/assets-testing'
import { createEvmServer } from '@exodus/ethereum-api'
import { TxSet } from '@exodus/models'

import assetPlugin from '../index.js'

const walletAccountCount = 2

async function cleanUp({ wallet, asset }) {
  await asset.server.stop()
  for (let i = 0; i < walletAccountCount; i++) {
    await wallet.assetClientInterface.updateAccountState({
      assetName: asset.baseAsset.name,
      walletAccount: `exodus_${i}`,
      newData: { clarityCursor: '' },
    })
  }
}

describe(`ethereum monitor integration test`, () => {
  const txMatcher = {
    date: expect.any(String),
  }

  const safeReportMatcher = {
    txLog: {
      exodus_0: {
        data: {
          bat: Array.from({ length: 7 }).fill(txMatcher),
          ethereum: Array.from({ length: 24 }).fill(txMatcher),
        },
      },
      exodus_1: {
        data: {
          bat: Array.from({ length: 2 }).fill(txMatcher),
          ethereum: Array.from({ length: 7 }).fill(txMatcher),
        },
      },
    },
  }

  describe('default monitor tests', () => {
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://eth-clarity.a.exodus.io',
      monitorType: 'clarity-v2',
    })

    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      seed: getPrivateSeed(),
      availableAssetNames: ['bat', 'ethereum', 'polygon', 'tetherusd'], // this allow reducing testing to just some assets. If not the list is massive
      walletAccountCount,
      safeReportMatcher,
      monitorArguments: { server },
      asserter: async ({ wallet, asset }) => {
        await cleanUp({ wallet, asset })

        const balances = await collectBalances(wallet)
        return { balances }
      },
    })
  })

  describe(`stale confirmed txs in txLog`, () => {
    // SetUp
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://eth-clarity.a.exodus.io',
      monitorType: 'clarity-v2',
    })
    // return nothing from server
    jest.spyOn(server, 'getAllTransactions').mockResolvedValue({
      transactions: {
        pending: [],
        confirmed: [],
      },
    })

    // Unit under test
    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      testName: 'should remove non-existent on-chain txs',
      seed: getTestingSeed(),
      availableAssetNames: ['ethereum', 'tetherusd'],
      walletAccountCount: 1,
      refresh: true,
      override: true,
      monitorArguments: { server },
      preparer: async ({ wallet, asset }) => {
        // SetUp
        const { tetherusd: token } = await wallet.assetClientInterface.getAssetsForNetwork({
          baseAssetName: asset.name,
        })
        const txLogData = {
          txId: '0xfed1c3667412a378152f83533484bb75c47dfd33f52d0e33505f10209d211a37',
          to: '0x90E481d9A664ebbE4Be180d9501962255463036d', // tx that doens't exists on-chain but in the txLog
          coinAmount: token.currency.defaultUnit(1),
          coinName: token.name,
          feeAmount: asset.currency.defaultUnit(0),
          feeCoinName: asset.feeAsset.name,
          date: new Date(190_000_000),
          data: {},
          confirmations: 1,
          currencies: { ethereum: asset.currency, tetherusd: token.currency },
        }

        // add unconfirmed tx that doesn't exist on-chain
        await wallet.assetClientInterface.updateTxLogAndNotify({
          assetName: token.name,
          walletAccount: 'exodus_0',
          txs: [txLogData],
        })
      },
      asserter: async ({ wallet, asset }) => {
        await cleanUp({ wallet, asset })

        const { tetherusd: token } = await wallet.assetClientInterface.getAssetsForNetwork({
          baseAssetName: asset.name,
        })

        // Verify results
        expect(server.getAllTransactions).toHaveBeenCalled()
        // tx is removed from txLog
        await expect(
          wallet.assetClientInterface.getTxLog({ assetName: token.name, walletAccount: 'exodus_0' })
        ).resolves.toEqual(TxSet.EMPTY)
      },
    })
  })

  describe(`dropped txs removed from txLog`, () => {
    // SetUp
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://eth-clarity.a.exodus.io',
      monitorType: 'clarity-v2',
    })
    // return pending tx from server
    jest.spyOn(server, 'getAllTransactions').mockResolvedValue({
      transactions: {
        pending: [],
        confirmed: [],
      },
    })

    // Unit under test
    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      testName: 'should mark txs as dropped',
      seed: getTestingSeed(),
      availableAssetNames: ['ethereum'],
      walletAccountCount: 1,
      refresh: false,
      monitorArguments: { server },
      preparer: async ({ wallet, asset }) => {
        // SetUp
        const txLogData = {
          txId: '0xf0910597bca70adffb4d3b83a9bee9c4e48d294a99f0857e00e7a481cb3d2096',
          to: '0xdf80f8a81341b8611d5ce40c642c5c7132203e05', // pending tx that was confirmed on-chain but still pending in the txLog
          coinAmount: asset.currency.defaultUnit(1),
          coinName: asset.name,
          feeAmount: asset.currency.defaultUnit(0),
          feeCoinName: asset.feeAsset.name,
          date: new Date(190_000_000),
          data: {},
          confirmations: 0,
          currencies: { ethereum: asset.currency },
        }

        // add unconfirmed tx that doesn't exist on-chain
        await wallet.assetClientInterface.updateTxLogAndNotify({
          assetName: asset.name,
          walletAccount: 'exodus_0',
          txs: [txLogData],
        })
      },
      asserter: async ({ wallet, asset }) => {
        await cleanUp({ wallet, asset })

        // Verify results
        expect(server.getAllTransactions).toHaveBeenCalled()

        // tx is removed from txLog

        const actualTxLog = await wallet.assetClientInterface.getTxLog({
          assetName: asset.name,
          walletAccount: 'exodus_0',
        })
        const expectedTxLog = TxSet.fromArray([
          {
            txId: '0xf0910597bca70adffb4d3b83a9bee9c4e48d294a99f0857e00e7a481cb3d2096',
            to: '0xdf80f8a81341b8611d5ce40c642c5c7132203e05',
            coinAmount: asset.currency.defaultUnit(1),
            coinName: asset.name,
            feeAmount: asset.currency.defaultUnit(0),
            feeCoinName: asset.feeAsset.name,
            date: new Date(190_000_000),
            data: {},
            dropped: true,
            error: 'Dropped',
            confirmations: 0,
            currencies: { ethereum: asset.currency },
          },
        ])
        expect(actualTxLog.deepEquals(expectedTxLog)).toBe(true)
      },
    })
  })
})
