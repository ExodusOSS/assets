import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import * as path from 'path'

import assetPlugin from '../../index.js'

const config = {
  ordinalChainIndex: 2,
  ordinalsEnabled: true,
  apiUrl: 'https://magiceden-bitcoin.a.exodus.io/insight/',
}

const safeReportFile = path.join(import.meta.dirname, 'monitor-ordinals-enabled-safe-report.json')
const walletAccountCount = 2
describe(`bitcoin with ordinals enabled integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    assetConfig: config,
    assetName: 'bitcoin',
    seed: getPrivateSeed(),
    walletAccountCount,
    safeReportFile,
  })
})
