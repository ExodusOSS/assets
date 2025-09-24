/* eslint-disable @exodus/import/no-deprecated */
import { InMemoryAssetClientInterface, logger, PlainAddressResolver } from '@exodus/assets-testing'
import assetList from '@exodus/solana-meta'
import lodash from 'lodash'

import assets from '../../__tests__/assets.js'
import { createAccountState } from '../../account-state.js'
import { Api } from '../../api.js'
import { SolanaMonitor } from '../solana-monitor.js'

const { intersection } = lodash

const { solana: asset } = assets

const SolanaAccountState = createAccountState({ assetList })

jest.setTimeout(60_000)

asset.api = {
  createAccountState: () => SolanaAccountState,
}

// Fernando's dev wallet. Profile 1
const walletAddresses = {
  solana: ['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'],
}

const api = new Api({ assets })

describe('solana monitor', () => {
  test('can start monitor, update txs and balances', async () => {
    const unknownAddress = '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh'
    const assetsWithoutUnknown = Object.fromEntries(
      Object.values(assets)
        .filter((asset) => {
          const isUnknown =
            asset.assetType === api.tokenAssetType && asset.mintAddress === unknownAddress
          return !isUnknown
        })
        .map((asset) => {
          return [asset.name, asset]
        })
    )
    const assetClientInterface = new InMemoryAssetClientInterface({
      assets: assetsWithoutUnknown,
      logger,
      addressResolver: new PlainAddressResolver({ walletAddresses }),
    })
    const monitor = new SolanaMonitor({
      api,
      interval: 1000,
      asset,
      assetClientInterface,
      logger,
    })
    try {
      const unknownTokensHandler = jest.fn()
      monitor.on('unknown-tokens', unknownTokensHandler)

      await monitor.start()

      expect(logger.error).not.toBeCalled()

      // Syntax sugar
      const txs = (walletAccount, assetName) => {
        return assetClientInterface.getTxLog({ walletAccount, assetName })
      }

      const accountState = await assetClientInterface.getAccountState({
        walletAccount: 'exodus0',
        assetName: 'solana',
      })

      expect(accountState).toBeDefined()

      expect(accountState.balance.gt(asset.currency.defaultUnit(0))).toEqual(true)
      expect(accountState.cursor).toBeDefined()

      // Some token balances my account has.
      expect(
        accountState.tokenBalances.mean_solana_c5cba5c4.gt(
          assets.mean_solana_c5cba5c4.currency.defaultUnit(0)
        )
      ).toEqual(true)

      expect(accountState.tokenBalances['8hgy_solana_43b58185']).toEqual(undefined)

      const solanaTx = await txs('exodus0', 'solana')
      expect(solanaTx.size).toBeGreaterThanOrEqual(10)

      const raydiumTx = await txs('exodus0', 'raydium')
      expect(raydiumTx.size).toBeGreaterThanOrEqual(3)

      const customTokenTx = await txs('exodus0', '8hgy_solana_43b58185')
      expect(customTokenTx.size).toEqual(0)

      expect(accountState.stakingInfo.loaded).toEqual(true)
      expect(accountState.stakingInfo.staking).toStrictEqual({
        enabled: true,
        pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
      })

      // expect(accountState.stakingInfo.isDelegating).toEqual(true)
      // expect(accountState.stakingInfo.locked.gt(asset.currency.defaultUnit(0))).toEqual(true)
      expect(accountState.stakingInfo.withdrawable).toBeDefined()
      expect(accountState.stakingInfo.pending).toBeDefined()
      expect(accountState.stakingInfo.earned).toBeDefined()
      expect(accountState.accountSize).toEqual(0)
      expect(accountState.rentExemptAmount.toBaseNumber()).toBeGreaterThan(0)

      expect(logger.error).not.toBeCalled()
      expect(logger.warn).not.toBeCalled()

      expect(unknownTokensHandler.mock.calls.length).toBe(2)

      const expectedAddresses = [unknownAddress]
      expect(intersection(unknownTokensHandler.mock.calls[0][0], expectedAddresses).sort()).toEqual(
        expectedAddresses.sort()
      )
      expect(intersection(unknownTokensHandler.mock.calls[1][0], expectedAddresses).sort()).toEqual(
        expectedAddresses.sort()
      )
    } finally {
      await monitor.stop()
    }

    expect(logger.error).not.toBeCalled()
    expect(monitor.timer.isRunning).toEqual(false)
  })
})
