import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'

import { ordinals86 } from '../../compatibility-modes.js'
import assetPlugin from '../../index.js'
import { getSafeReportFile } from './test-utils.js'

const config = {
  ordinalsEnabled: false,
}

describe.skip(`monitor integration test ordinals86`, () => {
  monitorIntegrationTester({
    assetPlugin,
    assetConfig: config,
    seed: getPrivateSeed(),
    walletAccountCount: 1,
    safeReportFile: getSafeReportFile(import.meta.dirname, import.meta.filename),
    compatibilityMode: ordinals86,
  })
})
