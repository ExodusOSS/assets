import { getTestingSeed, walletTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe(`ethereum get async fees`, () => {
  walletTester({
    assetPlugin,
    availableAssetNames: ['bat', 'ethereum', 'polygon', 'tetherusd'], // this allow reducing testing to just some accets. If not the list is massive
    assetName: 'ethereum',
    seed: getTestingSeed(),
    tests: {
      'ethereum without arguments': async ({ asset }) => {
        const fees = await asset.api.getFeeAsync({ asset })
        expect(fees).toEqual({
          extraFeeData: {},
          fee: asset.currency.parse('1575000 Gwei'),
          gasLimit: 21_000,
          gasPrice: asset.currency.parse('75 Gwei'),
        })
      },

      'ethereum with arguments': async ({ asset }) => {
        const amount = asset.currency.parse('123 Gwei')
        const fromAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const toAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const txInput = '0x'
        const fees = await asset.api.getFeeAsync({
          asset,
          amount,
          fromAddress,
          toAddress,
          txInput,
        })
        expect(fees).toEqual({
          extraFeeData: {},
          fee: asset.currency.parse('1575000 Gwei'),
          gasLimit: 21_000,
          gasPrice: asset.currency.parse('75 Gwei'),
        })
      },

      'polygon without arguments': async ({ asset, assetsModule }) => {
        const polygon = assetsModule.getAsset('polygon')
        const fees = await asset.api.getFeeAsync({ asset: polygon })
        expect(fees).toEqual({
          extraFeeData: {},
          fee: asset.currency.parse('2662275 Gwei'),
          gasLimit: 35_497,
          gasPrice: asset.currency.parse('75 Gwei'),
        })
      },

      'polygon with arguments': async ({ asset, assetsModule }) => {
        const polygon = assetsModule.getAsset('polygon')
        const amount = polygon.currency.parse('0 base') // no amount
        const fromAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const toAddress = '0x111fffffffffffffffffffffffffffffffffffff'
        const fees = await asset.api.getFeeAsync({ asset: polygon, amount, fromAddress, toAddress })
        expect(fees).toEqual({
          extraFeeData: {},
          fee: asset.currency.parse('2662275 Gwei'),
          gasLimit: 35_497,
          gasPrice: asset.currency.parse('75 Gwei'),
        })
      },
    },
  })
})
