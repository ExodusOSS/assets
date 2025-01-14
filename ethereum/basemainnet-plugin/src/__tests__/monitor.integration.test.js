import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe(`basemainnet monitor integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    assetName: 'basemainnet',
    seed: getPrivateSeed(),
    availableAssetNames: ['basemainnet'], // this allow reducing testing to just some accets. If not the list is massive
    walletAccountCount: 2,
    safeReportMatcher: {},
    asserter: async ({ wallet, asset }) => {
      // 0xbce047fb7444b66e7d8e370834144bad1191b8bd3ea4aab32f5cd340241ff506
      // 1000000000000000 - 200000000000000 - 4200000000000 ETH l2 fee (implicit) - 19355436461 ETH l1 fee (explicit)
      const results = await collectBalances(wallet)
      expect(results).toEqual({
        exodus_0: {
          basemainnet: {
            balance: '795780644563539 wei',
            spendable: '795780644563539 wei',
            spendableBalance: '795780644563539 wei',
            staked: '0 wei',
            total: '795780644563539 wei',
            unconfirmedReceived: '0 wei',
            unconfirmedSent: '0 wei',
            unstaked: '0 wei',
            unstaking: '0 wei',
          },
        },
        exodus_1: {
          basemainnet: {
            balance: '200000000000000 wei',
            spendable: '200000000000000 wei',
            spendableBalance: '200000000000000 wei',
            staked: '0 wei',
            total: '200000000000000 wei',
            unconfirmedReceived: '0 wei',
            unconfirmedSent: '0 wei',
            unstaked: '0 wei',
            unstaking: '0 wei',
          },
        },
      })
    },
  })
})
