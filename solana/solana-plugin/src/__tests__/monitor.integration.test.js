import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import * as path from 'path'

import assetPlugin from '../index.js'

describe(`solana monitor integration test`, () => {
  monitorIntegrationTester({
    override: false,
    assetPlugin,
    walletAccountCount: 2,
    seed: getPrivateSeed(),
    safeReportFile: path.join(import.meta.dirname, 'solana-private-seed-safe-report.json'),
    asserter: async ({ wallet, asset }) => {
      const balances = await collectBalances(wallet)
      return { balances }
    },
  })
})
