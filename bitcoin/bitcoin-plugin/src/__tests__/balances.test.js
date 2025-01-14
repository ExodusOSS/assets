// mocking insight client just in case
import '@exodus/bitcoin-api/src/insight-api-client/__tests__/mock-insight.js'

import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { collectBalances } from '@exodus/bitcoin-api/src/__tests__/bitcoin-testing-utils.js'
import { join } from 'path'

import assetPlugin from '../index.js'

const importSafeReportFile = join(import.meta.dirname, 'reports/unit-test-safe-report.json')
describe(`bitcoin balance test`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 4,
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
      'assert balances from asset.api.getBalances': async ({ getBalances }) => {
        expect(await collectBalances({ getBalances })).toEqual({
          exodus_0: {
            bitcoin: {
              balance: '110000 satoshis',
              spendableBalance: '110000 satoshis',
              total: '110000 satoshis',
              spendable: '110000 satoshis',
              unconfirmedReceived: '0 satoshis',
              unconfirmedSent: '0 satoshis',
            },
          },
          exodus_1: {
            bitcoin: {
              balance: '1321067 satoshis',
              spendableBalance: '1321067 satoshis',
              total: '1321067 satoshis',
              spendable: '1321067 satoshis',
              unconfirmedReceived: '0 satoshis',
              unconfirmedSent: '0 satoshis',
            },
          },
          exodus_2: {
            bitcoin: {
              balance: '0 satoshis',
              spendableBalance: '0 satoshis',
              total: '0 satoshis',
              spendable: '0 satoshis',
              unconfirmedReceived: '0 satoshis',
              unconfirmedSent: '0 satoshis',
            },
          },
          exodus_3: {
            bitcoin: {
              balance: '0 satoshis',
              spendableBalance: '0 satoshis',
              total: '0 satoshis',
              spendable: '0 satoshis',
              unconfirmedReceived: '0 satoshis',
              unconfirmedSent: '0 satoshis',
            },
          },
        })
      },
    },
  })
})
