import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendEvmTest } from '@exodus/ethereum-api/src/__tests__/send-test-helper.js'
import path from 'path'

import assetPlugin from '../index.js'

const importSafeReportFile = path.join(import.meta.dirname, 'ethereum-safe-report.json')

describe(`ethereum send transfer integration test`, () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 2,
    tests: {
      'Send some eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          amount: '140891449 wei',
        }),

      'Send all eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          isSendAll: true,
        }),

      'Send some bat token to second portfolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          assetName: 'bat',
          amount: '22771120000000000 base',
          options: { gasLimit: 35_497 },
        }),

      'Send all bat token to second portfolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          assetName: 'bat',
          isSendAll: true,
          options: { gasLimit: 35_497 },
        }),
    },
  })
})
