import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendEvmTest } from '@exodus/ethereum-api/src/__tests__/send-test-helper.js'
import path from 'path'

import assetPlugin from '../index.js'

const importSafeReportFile = path.join(import.meta.dirname, 'basemainnet-safe-report.json')

describe(`basemainnet send transfer integration test`, () => {
  walletTester({
    assetPlugin,
    assetName: 'basemainnet',
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 2,
    beforeEach: ({ asset }) => {
      const estimateL1DataFee = jest.spyOn(asset, 'estimateL1DataFee')
      estimateL1DataFee.mockImplementation(() => {
        return Promise.resolve(11_152_103_231)
      })
    },
    tests: {
      'Send some eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          amount: '200000000000000 wei',
        }),

      'Send all eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          isSendAll: true,
        }),
    },
  })
})
