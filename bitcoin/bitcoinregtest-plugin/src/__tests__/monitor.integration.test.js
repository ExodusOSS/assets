import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import {
  collectResults,
  collectUnusedAddressIndexes,
} from '@exodus/bitcoin-api/src/__tests__/bitcoin-testing-utils.js'
import lodash from 'lodash'
import path from 'path'

import assetPlugin from '../index.js'

const { mapValues } = lodash

describe(`bitcoinregtest monitor integration test`, () => {
  monitorIntegrationTester({
    assetPlugin,
    assetName: 'bitcoinregtest',
    seed: getPrivateSeed(),
    safeReportFile: path.join(import.meta.dirname, 'bitcoinregtest-private-seed-safe-report.json'),
    asserter: async ({ wallet, asset }) => {
      const aci = wallet.assetClientInterface
      const utxosReport = await collectResults({ asset, aci })

      // BE strategy, resolving unusedAddressIndexes from the TXLOG
      const unusedAddressIndexes = await collectUnusedAddressIndexes({
        asset,
        addressProvider: wallet.addressProvider,
        walletAccounts: wallet.walletAccounts,
      })

      // MOBILE strategy, resolving in monitor and saving unusedAddressIndexes in storage
      const expectedUnusedAddressIndexes = mapValues(utxosReport, (result) => result.chains)
      // Because there is no gap, both are the same.
      expect(unusedAddressIndexes).toEqual(expectedUnusedAddressIndexes)
      return { utxosReport }
    },
  })
})
