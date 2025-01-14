import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import * as path from 'path'

import assetPlugin from '../index.js'

const safeReportFile = path.join(import.meta.dirname, 'steth-safe-report.json')

describe(`ethereum steth monitor integration test`, () => {
  if (!globalThis.MONITOR_TEST_OFFLINE) {
    test.skip('steth monitor integration test online data changes, wallet is alive + staking')
    return
  }

  monitorIntegrationTester({
    assetPlugin,
    assetName: 'ethereum',
    seed: getPrivateSeed(),
    webSocketEnabled: !globalThis.MONITOR_NO_WEBSOCKET,
    override: false,
    mockAddresses: {
      exodus_0: { ethereum: '0xed0eebb4d520a6b0eccc4df8e5214e7a6697c111' },
    },
    availableAssetNames: ['ethereum', 'polygon', 'steth'], // this allow reducing testing to just some accets. If not the list is massive
    walletAccountCount: 1,
    safeReportFile,
    asserter: async ({ wallet, asset }) => {
      const results = await collectBalances(wallet)
      expect(results).toEqual({
        exodus_0: {
          ethereum: {
            balance: '7054563945633410215000 wei',
            spendable: '7054563945633410215000 wei',
            spendableBalance: '7054563945633410215000 wei',
            staked: '0 wei',
            total: '7054563945633410215000 wei',
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
          steth: {
            balance: '6593612038989793200781 base',
            spendable: '6593612038989793200781 base',
            spendableBalance: '6593612038989793200781 base',
            staked: '0 base',
            total: '6593612038989793200781 base',
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
