import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import * as path from 'path'

import assetPlugin from '../index.js'

const safeReportFile = path.join(import.meta.dirname, 'steth-safe-report.json')

// TODO: fix test so it does not fail all the time
describe.skip(`ethereum steth monitor integration test`, () => {
  if (!globalThis.MONITOR_TEST_OFFLINE) {
    test.skip('steth monitor integration test online data changes, wallet is alive + staking')
    return
  }

  monitorIntegrationTester({
    assetPlugin,
    customTokens: [
      {
        assetId: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        assetName: 'steth_ethereum_ef1101bb',
        baseAssetName: 'ethereum',
        displayName: 'Lido Staked ETH',
        parameters: {
          decimals: 18,
          units: {
            base: 0,
            STETHethereumEF1101BB: 18,
          },
        },

        ticker: 'STETHethereumEF1101BB',
        displayTicker: 'stETH',
      },
    ],
    assetName: 'ethereum',
    seed: getPrivateSeed(),
    webSocketEnabled: !globalThis.MONITOR_NO_WEBSOCKET,
    mockAddresses: {
      exodus_0: { ethereum: '0xed0eebb4d520a6b0eccc4df8e5214e7a6697c111' },
    },
    availableAssetNames: ['ethereum', 'polygon', 'steth_ethereum_ef1101bb'], // this allow reducing testing to just some accets. If not the list is massive
    walletAccountCount: 1,
    safeReportFile,
    asserter: async ({ wallet, asset }) => {
      const balances = await collectBalances(wallet)
      return { balances }
    },
  })
})
