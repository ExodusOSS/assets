/* eslint-disable @exodus/import/no-deprecated */
import { InMemoryAssetClientInterface, logger, PlainAddressResolver } from '@exodus/assets-testing'
import assetList from '@exodus/solana-meta'

import assets from '../../__tests__/assets.js'
import { createAccountState } from '../../account-state.js'
import { SolanaMonitor } from '../solana-monitor.js'
import solanaMonitorApiMock from './solana-monitor-api-mock.js'

const { solana: asset } = assets

const SolanaAccountState = createAccountState({ assetList })

asset.api = {
  createAccountState: () => SolanaAccountState,
}

// Fernando's dev wallet. Profile 1
const walletAddresses = {
  solana: ['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'],
}

describe('solana monitor', () => {
  test('can start monitor, update txs and balances', async () => {
    const assetClientInterface = new InMemoryAssetClientInterface({
      assets,
      logger,
      addressResolver: new PlainAddressResolver({ walletAddresses }),
    })

    const monitor = new SolanaMonitor({
      api: solanaMonitorApiMock,
      interval: 1000,
      asset,
      assetClientInterface,
      logger,
      includeUnparsed: true,
    })

    const unknownTokensHandler = jest.fn()
    monitor.on('unknown-tokens', unknownTokensHandler)

    try {
      await monitor.start()
      expect(logger.error).not.toBeCalled()
      expect(logger.warn).not.toBeCalled()

      // Sintax sugar
      const txs = (walletAccount, assetName) => {
        return assetClientInterface.getTxLog({ walletAccount, assetName })
      }

      const accountState = await assetClientInterface.getAccountState({
        walletAccount: 'exodus0',
        assetName: 'solana',
      })

      expect(accountState).toBeDefined()

      const expectSameValue = (actual, expected) => {
        expect(actual.equals(expected)).toEqual(true)
      }

      expectSameValue(accountState.balance, asset.currency.defaultUnit('0.144571133'))
      expect(accountState.cursor).toEqual(
        '3fiGCohizfVEeSSq4mrfGHve2tZA439toP9RwS1hFX1ViM4VEWX3Dw172ynsrJQ8evcCphohf7r7VTYg1KmvhnUC'
      )
      expect(accountState.rentExemptAmount.toBaseNumber()).toEqual(300_000)
      expect(accountState.accountSize).toEqual(5)

      // Some token balances my account has.
      expectSameValue(
        accountState.tokenBalances.mean_solana_c5cba5c4,
        assets.mean_solana_c5cba5c4.currency.defaultUnit('0.54')
      )
      expectSameValue(
        accountState.tokenBalances.raydium,
        assets.raydium.currency.defaultUnit('2.386293')
      )

      expectSameValue(
        accountState.tokenBalances['8hgy_solana_43b58185'],
        assets['8hgy_solana_43b58185'].currency.defaultUnit('9')
      )

      const solanaTxs = await txs('exodus0', 'solana')
      expect(solanaTxs.size).toEqual(10)
      const raydiumTxs = await txs('exodus0', 'raydium')
      expect(raydiumTxs.size).toEqual(3)
      const customTokenTxs = await txs('exodus0', '8hgy_solana_43b58185')
      expect(customTokenTxs.size).toEqual(3)

      // A regular solana transaction.
      const regularTransaction = solanaTxs.get(
        '2GtBQDGgWYA3Sziht49yiFTk4BBoxk2pp8Bx5kLJzqf8PrZofmniKRUKt5ZSi1RjpJpYkwdDBP8PeVLAyiiTuA1c'
      )
      expectSameValue(regularTransaction.coinAmount, asset.currency.defaultUnit('0.16277292'))

      // A transaction for another token has been added to Solana to reflect the paid fees.
      const feeTransaction = solanaTxs.get(
        '4LsihvxHQwq58iQRJk3vuAxyvNaj4dxZ87i7BJqjh2UTsFEDouWscoKqu6orVV6zyywpmdNJGQxm3kKvxobg6UD6'
      )
      expectSameValue(feeTransaction.feeAmount, asset.currency.defaultUnit('0.000005'))
      expect(feeTransaction.tokens).toEqual(['raydium'])
      expectSameValue(
        asset.currency.defaultUnit(feeTransaction.coinAmount.toNumber()),
        asset.currency.defaultUnit(0)
      )

      // Stake info
      expect(accountState.stakingInfo.loaded).toEqual(true)
      expect(accountState.stakingInfo.staking).toStrictEqual({
        enabled: true,
        pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
      })
      expect(accountState.stakingInfo.isDelegating).toEqual(true)
      expectSameValue(accountState.stakingInfo.locked, asset.currency.defaultUnit('0.1345708'))
      expectSameValue(
        accountState.stakingInfo.withdrawable,
        asset.currency.defaultUnit('0.000000111')
      )
      expectSameValue(accountState.stakingInfo.pending, asset.currency.defaultUnit('0.000000222'))
      expectSameValue(accountState.stakingInfo.earned, asset.currency.defaultUnit('0.000003333'))

      const expectedAddresses = [
        'UNKNOWN1AAAAyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNL',
        'UNKNOWN2BBBByjzvzp8eMZWUXbBCjEvwSkkk59S5iCNL',
      ]

      expect(unknownTokensHandler.mock.calls.length).toBe(2)
      expect(unknownTokensHandler.mock.calls[0][0].sort()).toEqual(expectedAddresses.sort())
      expect(unknownTokensHandler.mock.calls[1][0].sort()).toEqual(expectedAddresses.sort())

      expect(logger.error).not.toBeCalled()
      expect(logger.warn).not.toBeCalled()
    } finally {
      await monitor.stop()
    }

    expect(logger.error).not.toBeCalled()
    expect(logger.warn).not.toBeCalled()
    expect(monitor.timer.isRunning).toEqual(false)
  })
})
