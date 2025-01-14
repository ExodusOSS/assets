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
describe(`ethereum monitor integration test`, () => {
  const txMatcher = {
    date: expect.any(String),
  }

  const safeReportMatcher = {
    txLog: {
      exodus_0: {
        data: {
          bat: Array.from({ length: 4 }).fill(txMatcher),
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
    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      seed: getPrivateSeed(),
      availableAssetNames: ['bat', 'ethereum', 'polygon', 'tetherusd'], // this allow reducing testing to just some assets. If not the list is massive
      walletAccountCount,
      safeReportMatcher,
      asserter: async ({ wallet, asset }) => {
        const results = await collectBalances(wallet)
        expect(results).toEqual({
          exodus_0: {
            bat: {
              balance: '4422771120000000000 base',
              spendable: '4422771120000000000 base',
              spendableBalance: '4422771120000000000 base',
              staked: '0 base',
              total: '4422771120000000000 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
            ethereum: {
              balance: '4228230740891449 wei',
              spendable: '4228230740891449 wei',
              spendableBalance: '4228230740891449 wei',
              staked: '0 wei',
              total: '4228230740891449 wei',
              unconfirmedReceived: '0 wei',
              unconfirmedSent: '0 wei',
              unstaked: '0 wei',
              unstaking: '0 wei',
            },
            polygon: {
              balance: '0 base',
              spendable: '0 base',
              spendableBalance: '0 base',
              staked: '0 base',
              total: '0 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
            tetherusd: {
              balance: '6414404 base',
              spendable: '6414404 base',
              spendableBalance: '6414404 base',
              staked: '0 base',
              total: '6414404 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
          },
          exodus_1: {
            bat: {
              balance: '0 base',
              spendable: '0 base',
              spendableBalance: '0 base',
              staked: '0 base',
              total: '0 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
            ethereum: {
              balance: '0 wei',
              spendable: '0 wei',
              spendableBalance: '0 wei',
              staked: '0 wei',
              total: '0 wei',
              unconfirmedReceived: '0 wei',
              unconfirmedSent: '0 wei',
              unstaked: '0 wei',
              unstaking: '0 wei',
            },
            polygon: {
              balance: '0 base',
              spendable: '0 base',
              spendableBalance: '0 base',
              staked: '0 base',
              total: '0 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
            tetherusd: {
              balance: '0 base',
              spendable: '0 base',
              spendableBalance: '0 base',
              staked: '0 base',
              total: '0 base',
              unconfirmedReceived: '0 base',
              unconfirmedSent: '0 base',
              unstaked: '0 base',
              unstaking: '0 base',
            },
          },
        })
      },
    })
  })

  describe(`stale confirmed txs in txLog`, () => {
    // SetUp
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://geth.a.exodus.io/wallet/v1/',
      monitorType: 'magnifier',
    })
    // return nothing from server
    jest.spyOn(server, 'getHistoryV2').mockResolvedValue([])

    // Unit under test
    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      testName: 'should remove non-existent on-chain txs',
      seed: getTestingSeed(),
      availableAssetNames: ['ethereum', 'tetherusd'],
      walletAccountCount: 1,
      refresh: true,
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
        const { tetherusd: token } = await wallet.assetClientInterface.getAssetsForNetwork({
          baseAssetName: asset.name,
        })

        // Verify results
        expect(server.getHistoryV2).toHaveBeenCalled()
        // tx is removed from txLog
        await expect(
          wallet.assetClientInterface.getTxLog({ assetName: token.name, walletAccount: 'exodus_0' })
        ).resolves.toEqual(TxSet.EMPTY)
      },
    })
  })

  describe(`false dropped txs confirmed in txLog`, () => {
    // SetUp
    // return nothing from server
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://geth.a.exodus.io/wallet/v1/',
      monitorType: 'magnifier',
    })
    jest.spyOn(server, 'getHistoryV2').mockResolvedValue([])
    jest.spyOn(server, 'getTransactionByHash').mockResolvedValue({
      blockNumber: 1,
    })

    // Unit under test
    monitorIntegrationTester({
      assetPlugin,
      assetName: 'ethereum',
      testName: 'should include missing confirmed on-chain txs',
      seed: getTestingSeed(),
      availableAssetNames: ['ethereum'],
      walletAccountCount: 1,
      refresh: false,
      monitorArguments: { server },
      preparer: async ({ wallet, asset }) => {
        // SetUp
        const txLogData = {
          txId: '0xa65498655675d58f5867e4dc909b6dfc4b6c1fcc71c0bb63ee2730a5a5b57a9e',
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
        // Verify results
        expect(server.getHistoryV2).toHaveBeenCalled()
        expect(server.getTransactionByHash).toHaveBeenNthCalledWith(
          1,
          '0xa65498655675d58f5867e4dc909b6dfc4b6c1fcc71c0bb63ee2730a5a5b57a9e'
        )
        // tx is removed from txLog

        const actualTxLog = await wallet.assetClientInterface.getTxLog({
          assetName: asset.name,
          walletAccount: 'exodus_0',
        })
        const expectedTxLog = TxSet.fromArray([
          {
            txId: '0xa65498655675d58f5867e4dc909b6dfc4b6c1fcc71c0bb63ee2730a5a5b57a9e',
            to: '0xdf80f8a81341b8611d5ce40c642c5c7132203e05', // pending tx that was confirmed on-chain but still pending in the txLog
            coinAmount: asset.currency.defaultUnit(1),
            coinName: asset.name,
            feeAmount: asset.currency.defaultUnit(0),
            feeCoinName: asset.feeAsset.name,
            date: new Date(190_000_000),
            data: {},
            confirmations: 1,
            currencies: { ethereum: asset.currency },
          },
        ])
        expect(actualTxLog.deepEquals(expectedTxLog)).toBe(true)
      },
    })
  })

  describe(`dropped txs removed from txLog`, () => {
    // SetUp
    const server = createEvmServer({
      assetName: 'ethereum',
      serverUrl: 'https://geth.a.exodus.io/wallet/v1/',
      monitorType: 'magnifier',
    })
    // return pending tx from server
    jest.spyOn(server, 'getHistoryV2').mockResolvedValue([])
    jest.spyOn(server, 'getTransactionByHash').mockResolvedValue(null)

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
        // Verify results
        expect(server.getHistoryV2).toHaveBeenCalled()
        expect(server.getTransactionByHash).toHaveBeenNthCalledWith(
          1,
          '0xf0910597bca70adffb4d3b83a9bee9c4e48d294a99f0857e00e7a481cb3d2096'
        )
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
