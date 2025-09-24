import { collectBalances, getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import path from 'path'

import assetPlugin from '../index.js'

const safeReportFile = path.join(import.meta.dirname, 'basemainnet-safe-report.json')
describe(`basemainnet monitor integration test`, () => {
  monitorIntegrationTester({
    override: false,
    assetPlugin,
    assetName: 'basemainnet',
    replay: false, // record with clarity + socket not working yet.
    seed: getPrivateSeed(),
    availableAssetNames: ['basemainnet'], // this allows reducing testing to just some assets.
    walletAccountCount: 2,
    safeReportFile,
    asserter: async ({ wallet, asset }) => {
      // 0xbce047fb7444b66e7d8e370834144bad1191b8bd3ea4aab32f5cd340241ff506
      // 1000000000000000 - 200000000000000 - 4200000000000 ETH l2 fee (implicit) - 19355436461 ETH l1 fee (explicit)
      await wallet.assetClientInterface.updateAccountState({
        assetName: asset.baseAsset.name,
        walletAccount: `exodus_0`,
        newData: { clarityCursor: '' },
      })
      await wallet.assetClientInterface.updateAccountState({
        assetName: asset.baseAsset.name,
        walletAccount: `exodus_1`,
        newData: { clarityCursor: '' },
      })

      const balances = await collectBalances(wallet)
      return { balances }
    },
  })
})
