import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import path from 'path'

import assetPlugin from '../index.js'

const safeReportFile = path.join(
  import.meta.dirname,
  'bitcointestnet-private-seed-safe-report.json'
)

describe(`bitcoin testnet monitor integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    seed: getPrivateSeed(),
    walletAccountCount: 2,
    safeReportFile,
  })
})
