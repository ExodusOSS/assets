import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { asset as baseAsset } from '@exodus/bitcoin-meta'
import lodash from 'lodash'
import path from 'path'

import assetPlugin from '../index.js'

const { mapValues } = lodash

const importSafeReportFile = path.join(import.meta.dirname, 'reports/unit-test-safe-report.json')

describe(`bitcoin fees test`, () => {
  async function resolveAmounts({ assetClientInterface, walletAccount, amount, isSendAll, asset }) {
    const assetName = asset.name

    const feeData = await assetClientInterface.getFeeConfig({ assetName })
    const accountState = await assetClientInterface.getAccountState({
      assetName,
      walletAccount,
    })
    const txSet = await assetClientInterface.getTxLog({ assetName, walletAccount })
    const { fee, extraFeeData } = asset.api.getFee({
      asset: baseAsset,
      accountState,
      txSet,
      feeData,
      amount,
      isSendAll,
    })

    const { spendable: spendableBalance } = asset.api.getBalances({
      asset: baseAsset,
      accountState,
      txLog: txSet,
      feeData,
    })
    const { balance } = asset.api.getBalances({ asset, accountState, txLog: txSet })
    const amounts = {
      balance,
      fee,
      spendableBalance,
      availableBalance: spendableBalance.sub(fee),
      extraFee: extraFeeData?.extraFee || asset.currency.ZERO,
    }
    return {
      all: mapValues(amounts, (balance) => balance.toBaseString({ unit: true })),
    }
  }

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    walletAccountCount: 4,
    importSafeReportFile,
    expectedAddresses: {
      bitcoin_44_exodus_0_0_0: '1Azpg7QEdQ8FHhNLzEpbpo1Uowh3t7B3Ex',
      bitcoin_44_exodus_1_0_0: '1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3',
      bitcoin_44_exodus_2_0_0: '14Gmj5bDcdwq9kCeYboSfNBECfrZ59podu',
      bitcoin_44_exodus_3_0_0: '1cYFm3evxxqJ1r2Fz3mtLWd8XVzTJwd6E',
      bitcoin_84_exodus_0_0_0: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
      bitcoin_84_exodus_1_0_0: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
      bitcoin_84_exodus_2_0_0: 'bc1q80wm35xel29d2xd79e4uveudejwmh3jnecvnl4',
      bitcoin_84_exodus_3_0_0: 'bc1q3yt56war2meuc0jkp85y9ty58flkwf9nxmt2rk',
      bitcoin_86_exodus_0_0_0: 'bc1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkq8dqhrt',
      bitcoin_86_exodus_1_0_0: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
      bitcoin_86_exodus_2_0_0: 'bc1p22zuaxepunt587sfjjahmlr844qa99p4xsjgtfxzlhk2x2xjcu7sh9ljqu',
      bitcoin_86_exodus_3_0_0: 'bc1p9zm5z3wqfqkdrtkjg9uhxk3cp00ws4duxver0x74c6crq8adzqxs7hs8lt',
    },
    tests: {
      'resolve fee of sending 10 satoshis from exodus_0': async ({
        assetClientInterface,
        asset,
      }) => {
        const walletAccount = `exodus_0`
        const amount = asset.currency.parse('10 satoshis')
        const { all } = await resolveAmounts({
          assetClientInterface,
          asset,
          walletAccount,
          amount,
        })
        expect(all).toEqual({
          availableBalance: '94972 satoshis',
          balance: '110000 satoshis',
          fee: '15028 satoshis',
          extraFee: '0 satoshis',
          spendableBalance: '110000 satoshis',
        })
      },

      'resolve fee of sending 10 satoshis from exodus_1': async ({
        assetClientInterface,
        asset,
      }) => {
        const walletAccount = `exodus_1`
        const amount = asset.currency.parse('10 satoshis')
        const { all } = await resolveAmounts({
          assetClientInterface,
          asset,
          walletAccount,
          amount,
        })
        expect(all).toEqual({
          availableBalance: '1306719 satoshis',
          balance: '1321067 satoshis',
          fee: '14348 satoshis',
          extraFee: '0 satoshis',
          spendableBalance: '1321067 satoshis',
        })
      },

      'resolve fee of sending all from exodus_0': async ({ assetClientInterface, asset }) => {
        const walletAccount = `exodus_0`
        const { all } = await resolveAmounts({
          assetClientInterface,
          asset,
          walletAccount,
          isSendAll: true,
        })
        expect(all).toEqual({
          availableBalance: '97080 satoshis',
          balance: '110000 satoshis',
          fee: '12920 satoshis',
          extraFee: '0 satoshis',
          spendableBalance: '110000 satoshis',
        })
      },

      'resolve fee of sending all from exodus_1': async ({ assetClientInterface, asset }) => {
        const walletAccount = `exodus_1`
        const { all } = await resolveAmounts({
          assetClientInterface,
          asset,
          walletAccount,
          isSendAll: true,
        })
        expect(all).toEqual({
          availableBalance: '1271631 satoshis',
          balance: '1321067 satoshis',
          fee: '49436 satoshis',
          extraFee: '0 satoshis',
          spendableBalance: '1321067 satoshis',
        })
      },
    },
  })
})
