import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'

import { xverse49NotMerged } from '../../compatibility-modes.js'
import assetPlugin from '../../index.js'
import { getSafeReportFile } from './test-utils.js'

const config = {
  ordinalsEnabled: false,
}

describe(`xverse49NotMerged`, () => {
  monitorIntegrationTester({
    refresh: false,
    assetPlugin,
    assetConfig: config,
    seed: getPrivateSeed(),
    walletAccountCount: 1,
    safeReportFile: getSafeReportFile(import.meta.dirname, import.meta.filename),
    compatibilityMode: xverse49NotMerged,
  })
})
