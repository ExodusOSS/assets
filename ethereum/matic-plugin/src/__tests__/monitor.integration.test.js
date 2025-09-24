import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import path from 'path'

import assetPlugin from '../index.js'

describe(`matic monitor integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    seed: getPrivateSeed(),
    availableAssetNames: ['matic', 'aave_matic_bfdf3c37'],
    walletAccountCount: 1,
    safeReportFile: path.join(import.meta.dirname, 'monitor-safe-report.json'),
    asserter: async ({ wallet, asset }) => {
      const balances = await collectBalances(wallet)
      return { balances }
    },
  })
})
