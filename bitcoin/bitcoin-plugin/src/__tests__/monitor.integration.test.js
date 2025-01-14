import { getPrivateSeed, monitorIntegrationTester } from '@exodus/assets-testing'
import {
  collectResults,
  collectUnusedAddressIndexes,
} from '@exodus/bitcoin-api/src/__tests__/bitcoin-testing-utils.js'
import lodash from 'lodash'
import * as path from 'path'

import assetPlugin from '../index.js'

const { mapValues } = lodash

const safeReportFile = path.join(import.meta.dirname, 'bitcoin-private-seed-safe-report.json')
const walletAccountCount = 2
describe(`bitcoin monitor integration test refresh true`, () => {
  monitorIntegrationTester({
    assetPlugin,
    seed: getPrivateSeed(),
    walletAccountCount,
    safeReportFile,
    refresh: true,
    asserter: async ({ wallet, asset }) => {
      // assertion for Fernando's dev wallet.
      // To enable in CI:
      // Extract addresses from seed rather than ofc, shared the seed
      // Create generic enough assertions, no specific numbers

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
