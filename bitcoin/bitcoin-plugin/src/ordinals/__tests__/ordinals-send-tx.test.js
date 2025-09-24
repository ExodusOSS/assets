// Tell jest to mock this import
import '@exodus/bitcoin-api/src/insight-api-client/__tests__/mock-insight.js'

import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendTxTest } from '@exodus/bitcoin-api/src/__tests__/tx-send-testing-utils.js'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import lodash from 'lodash'
import path from 'path'

import assetPlugin from '../../index.js'
import nftSendCustomFeeUnsignedTx from './fixtures/nft-send-custom-fee-unsigned-tx.js'
import nftSendUnsignedTx from './fixtures/nft-send-unsigned-tx.js'

const config = { ordinalChainIndex: 2, ordinalsEnabled: true }

const importSafeReportFile = path.join(
  import.meta.dirname,
  './monitor-ordinals-enabled-safe-report-with-inscriptions.json'
)

describe(`bitcoin inscriptions tx-send test`, () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    assetConfig: config,
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 4,
    beforeEach: ({ asset }) => {
      jest.spyOn(asset.api, 'signTx')
      jest.spyOn(asset.insightClient, 'fetchBlockHeight').mockResolvedValue(768_520)
      jest
        .spyOn(defaultEntropy, 'getSchnorrEntropy')
        .mockImplementation(() =>
          Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
        )
      // avoid shuffle so order and tx hash can be asserted
      jest.spyOn(lodash, 'shuffle').mockImplementation((list) => list)
    },
    tests: {
      'can send 1 nft from wallet 1': async ({ assetClientInterface, asset }) => {
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'

        const expectedBalance = asset.currency.parse('1136644 satoshis')
        const expectedFee = asset.currency.parse('15028 satoshis')

        const nft = {
          tokenId: '11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
        }

        const params = {
          assetClientInterface,
          asset,
          address,
          options: { multipleAddressesEnabled: false, isSendAll: false, nft },
          expectedBalance,
          expectedFee,
          expectedTxData: nftSendUnsignedTx,
        }
        await sendTxTest(params)
      },

      'can send 1 nft from wallet 1 and custom fee': async ({ assetClientInterface, asset }) => {
        const address = 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew'

        const expectedBalance = asset.currency.parse('1136644 satoshis')
        const expectedFee = asset.currency.parse('17680 satoshis')

        const nft = {
          tokenId: '11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
        }

        const params = {
          assetClientInterface,
          asset,
          address,
          options: {
            multipleAddressesEnabled: false,
            isSendAll: false,
            customFee: asset.currency.parse('0.00080 BTC'),
            nft,
          },
          expectedBalance,
          expectedFee,
          expectedTxData: nftSendCustomFeeUnsignedTx,
        }
        await sendTxTest(params)
      },
    },
  })
})
