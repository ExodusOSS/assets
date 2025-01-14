import { monitorIntegrationTester } from '@exodus/assets-testing'
import path from 'path'

import assetPlugin from '../index.js'

const safeReportFile = path.join(import.meta.dirname, 'passkeys-safe-report.json')

describe(`solana passkeys monitor integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    availableAssetNames: ['solana', 'dezx_solana_3b523050', 'usdcoin_solana'], // tokes we want to monitor
    mockAddresses: {
      exodus_0: {
        solana: '3z7g4CaFebcA9UTtMTDV3QuJF2KEHwix3vFbruw2dQKc',
      },
    },
    override: false,
    walletAccountCount: 1,
    safeReportFile,
  })
})
