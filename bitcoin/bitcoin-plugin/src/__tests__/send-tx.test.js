// Tell jest to mock this import
import '@exodus/bitcoin-api/src/insight-api-client/__tests__/mock-insight.js'

import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendTxTest } from '@exodus/bitcoin-api/src/__tests__/tx-send-testing-utils.js'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import lodash from 'lodash'
import path from 'path'

import assetPlugin from '../index.js'
import segwitAllUnsignedTx from './fixtures/sign/segwit-all-unsigned-tx.js'
import segwitUnsignedTx from './fixtures/sign/segwit-segwit-change-unsigned-tx.js'
import taproot15000satsUnsignedTx from './fixtures/sign/taproot-15000sats-unsigned-tx.js'
import taproot15000satsUnsignedTxCustomFee from './fixtures/sign/taproot-15000sats-unsigned-tx-custom-fee.js'
import taprootAllUnsignedTx from './fixtures/sign/taproot-all-unsigned-tx.js'
import taprootUnsignedTx from './fixtures/sign/taproot-with-change-unsigned-tx.js'

const importSafeReportFile = path.join(import.meta.dirname, 'reports/unit-test-safe-report.json')

describe(`bitcoin tx-send test`, () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 4,
    beforeEach: ({ asset }) => {
      jest.spyOn(asset.api, 'signTx')
      jest.spyOn(asset.insightClient, 'fetchBlockHeight').mockResolvedValue(768_520)
      // removes the random ouf of the taproot signature
      jest
        .spyOn(defaultEntropy, 'getSchnorrEntropy')
        .mockImplementation(() =>
          Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
        )
      // avoid shuffle so order and tx hash can be asserted
      jest.spyOn(lodash, 'shuffle').mockImplementation((list) => list)
    },
    tests: {
      'can send 10 satoshis exodus_0': async ({ assetClientInterface, asset }) => {
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const amount = asset.currency.parse('10 satoshis')
        const expectedBalance = asset.currency.parse('102520 satoshis')
        const expectedFee = asset.currency.parse('15028 satoshis')

        const params = {
          assetClientInterface,
          asset,
          address,
          amount,
          options: { multipleAddressesEnabled: false, isSendAll: false },
          expectedBalance,
          expectedFee,
          expectedTxData: segwitUnsignedTx,
        }
        await sendTxTest(params)
      },

      'can send all exodus_0': async ({ assetClientInterface, asset }) => {
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const expectedBalance = asset.currency.parse('97080 satoshis')
        const expectedFee = asset.currency.parse('12920 satoshis')

        const params = {
          assetClientInterface,
          asset,
          address,
          options: { multipleAddressesEnabled: false, isSendAll: true },
          expectedBalance,
          expectedFee,
          expectedTxData: segwitAllUnsignedTx,
        }

        await sendTxTest(params)
      },

      'can send 10 satoshis exodus_1 (taproot)': async ({ assetClientInterface, asset }) => {
        // the used utxos - amount - fee is lower that dust. That's why there is no change address!
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const amount = asset.currency.parse('10 satoshis')
        const expectedBalance = asset.currency.parse('1309643 satoshis')
        const expectedFee = asset.currency.parse('14348 satoshis')
        const params = {
          assetClientInterface,
          asset,
          address,
          amount,
          options: { multipleAddressesEnabled: false, isSendAll: false },
          expectedBalance,
          expectedFee,
          expectedTxData: taprootUnsignedTx,
        }
        await sendTxTest(params)
      },

      'can send 15000 sats exodus_1 (taproot)': async ({ assetClientInterface, asset }) => {
        // spends both utxos with change!
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const amount = asset.currency.parse('15000 satoshis')
        const expectedBalance = asset.currency.parse('1309643 satoshis')
        const expectedFee = asset.currency.parse('27540 satoshis')
        const params = {
          assetClientInterface,
          asset,
          address,
          amount,
          options: { multipleAddressesEnabled: false, isSendAll: false },
          expectedBalance,
          expectedFee,
          expectedTxData: taproot15000satsUnsignedTx,
        }
        await sendTxTest(params)
      },

      'can send 15000 sats exodus_1 custom fee (taproot)': async ({
        assetClientInterface,
        asset,
      }) => {
        // spends both utxos with change!
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const amount = asset.currency.parse('15000 satoshis')
        const expectedBalance = asset.currency.parse('1309643 satoshis')
        const expectedFee = asset.currency.parse('32400 satoshis')
        const params = {
          assetClientInterface,
          asset,
          address,
          amount,
          options: {
            multipleAddressesEnabled: false,
            isSendAll: false,
            customFee: asset.currency.parse('0.00080 BTC'),
          },
          expectedBalance,
          expectedFee,
          expectedTxData: taproot15000satsUnsignedTxCustomFee,
        }
        await sendTxTest(params)
      },

      'can send all exodus_1 (taproot)': async ({ assetClientInterface, asset }) => {
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'
        const expectedBalance = asset.currency.parse('1271631 satoshis')
        const expectedFee = asset.currency.parse('49436 satoshis')

        const params = {
          assetClientInterface,
          asset,
          address,
          options: { multipleAddressesEnabled: false, isSendAll: true },
          expectedBalance,
          expectedFee,
          expectedTxData: taprootAllUnsignedTx,
        }
        await sendTxTest(params)
      },
    },
  })
})
