import { getTestingSeed, walletTester } from '@exodus/assets-testing'
import { convertForSnapshot } from '@exodus/ethereum-api/src/__tests__/eth-test-utils.js'
import { WalletAccount } from '@exodus/models'

import assetPlugin from '../index.js'

const walletAccount = WalletAccount.DEFAULT

describe(`ethereum get async fees`, () => {
  walletTester({
    assetPlugin,
    availableAssetNames: ['bat', 'ethereum', 'polygon', 'tetherusd'], // this allow reducing testing to just some accets. If not the list is massive
    assetName: 'ethereum',
    seed: getTestingSeed(),
    tests: {
      'ethereum without arguments': async ({ asset, fees: feesModule }) => {
        const fees = await feesModule.getFees({ assetName: asset.name, walletAccount })

        asset.server.stop()

        expect(convertForSnapshot(fees)).toMatchSnapshot()
      },

      'ethereum with arguments': async ({ asset, fees: feesModule }) => {
        const amount = asset.currency.parse('123 Gwei')
        const fromAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const toAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const txInput = '0x'
        const fees = await feesModule.getFees({
          assetName: asset.name,
          walletAccount,
          amount,
          fromAddress,
          toAddress,
          txInput,
        })

        asset.server.stop()

        expect(convertForSnapshot(fees)).toMatchSnapshot()
      },

      'polygon without arguments': async ({ asset, assetsModule, fees: feesModule }) => {
        const gasLimit = 38_159
        const fees = await feesModule.getFees({ assetName: 'polygon', walletAccount, gasLimit })

        asset.server.stop()

        expect(convertForSnapshot(fees)).toMatchSnapshot()
      },

      'polygon with arguments': async ({ asset, assetsModule, fees: feesModule }) => {
        const polygon = assetsModule.getAsset('polygon')
        const amount = polygon.currency.parse('0 base') // no amount
        const fromAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const toAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const fees = await feesModule.getFees({
          assetName: polygon.name,
          walletAccount,
          amount,
          fromAddress,
          toAddress,
        })

        asset.server.stop()
        expect(convertForSnapshot(fees)).toMatchSnapshot()
      },
    },
  })
})
