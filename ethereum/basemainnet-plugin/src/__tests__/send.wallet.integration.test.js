import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendEvmTest } from '@exodus/ethereum-api/src/__tests__/send-test-helper.js'
import path from 'path'

import assetPlugin from '../index.js'

const importSafeReportFile = path.join(import.meta.dirname, 'basemainnet-safe-report.json')

let l1Simulation

describe(`basemainnet send transfer integration test`, () => {
  walletTester({
    assetPlugin,
    assetName: 'basemainnet',
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 2,
    beforeEach: ({ asset }) => {
      jest.spyOn(asset.server, 'ethCall').mockImplementation(({ to, data }) => {
        if (to === '0x420000000000000000000000000000000000000F' && l1Simulation[data])
          return l1Simulation[data]
        throw new Error('Should not go here! ' + data)
      })
    },
    afterEach: ({ asset }) => {
      asset.server.stop()
    },
    tests: {
      'Send some eth from first to second portfolio': async (deps) => {
        l1Simulation = {
          '0x49948e0e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003402f2822105138401312d00840d1cef0082520894f6c138c36341138ddfc314a11038da8264b7ef0986b5e620f4800080c0808080000000000000000000000000':
            '0x00000000000000000000000000000000000000000000000000000001921f8f2b',
        }
        return sendEvmTest({
          //
          ...deps,
          amount: '200000000000000 wei',
        })
      },

      'Send all eth from first to second portfolio': async (deps) => {
        l1Simulation = {
          '0x49948e0e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003502f3822105138401312d00840d1cef0082520894f6c138c36341138ddfc314a11038da8264b7ef098702d3c21ea36a5380c08080800000000000000000000000':
            '0x00000000000000000000000000000000000000000000000000000001921f8f2c',
        }
        return sendEvmTest({
          //
          ...deps,
          isSendAll: true,
        })
      },

      'Send some eth from first to second portfolio with provided feeAmount': async (deps) => {
        l1Simulation = {
          '0x49948e0e0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003402f2822105138401312d00840d1cef0082520894f6c138c36341138ddfc314a11038da8264b7ef0986b5e620f4800080c0808080000000000000000000000000':
            '0x00000000000000000000000000000000000000000000000000000001921f8f2b',
        }
        return sendEvmTest({
          //
          ...deps,
          amount: '200000000000000 wei',
          options: { feeAmount: deps.asset.currency.baseUnit(1_234_433_136_375) },
        })
      },
    },
  })
})
