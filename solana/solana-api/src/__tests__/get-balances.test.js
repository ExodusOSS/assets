import { TxSet } from '@exodus/models'
import assetList from '@exodus/solana-meta'

import { getBalancesFactory } from '../get-balances.js'
import { createAccountState } from '../index.js'
import assets from './assets.js'

const solana = assets.solana

const getBalances = getBalancesFactory({ stakingFeatureAvailable: true })

const SolanaAccountState = createAccountState({ assetList })

const createTxSet = ({ txs }) => TxSet.fromArray(txs)

describe('get-balances', () => {
  solana.accountReserve = solana.currency.baseUnit(20)

  test('balances is zero when empty tx', () => {
    // Arrange:
    const accountState = new SolanaAccountState()

    // Act:
    const balances = getBalances({
      asset: solana,
      accountState,
    })

    // Assert:
    expect(balances.balance.isZero).toBe(true)
    expect(balances.spendableBalance.isZero).toBe(true)
  })

  test('has balance', () => {
    // Arrange:
    const accountState = new SolanaAccountState({
      balance: solana.currency.baseUnit(100),
      rentExemptAmount: solana.currency.baseUnit(14),
    })

    // Act:
    const balances = getBalances({
      asset: solana,
      accountState,
    })

    // Assert:
    const zero = solana.currency.ZERO
    expect(balances.balance).toEqual(solana.currency.baseUnit(100))
    expect(balances.spendableBalance).toEqual(
      solana.currency.baseUnit(100).sub(accountState.rentExemptAmount)
    )
    expect(balances.total).toEqual(solana.currency.baseUnit(100))
    expect(balances.spendable).toEqual(
      solana.currency.baseUnit(100).sub(accountState.rentExemptAmount)
    )
    expect(balances.networkReserve).toEqual(accountState.rentExemptAmount)
    expect(balances.walletReserve).toEqual(zero)
  })

  test('balance is equal to (spendableBalance + withdrawable + locked + pending + accountReserve)', () => {
    // Arrange:
    const zero = solana.currency.ZERO
    const stakingInfo = {
      locked: solana.currency.baseUnit(10),
      withdrawable: solana.currency.baseUnit(11),
      pending: solana.currency.baseUnit(12),
    }
    const balance = solana.currency.baseUnit(100)
    const accountState = new SolanaAccountState({
      balance,
      stakingInfo,
      rentExemptAmount: solana.currency.baseUnit(14),
    })

    // Act:
    const balances = getBalances({
      asset: solana,
      accountState,
    })

    // Assert:
    const expectedSpendableBalance = balance
      .sub(stakingInfo.locked || zero)
      .sub(stakingInfo.withdrawable || zero)
      .sub(stakingInfo.pending || zero)
      .sub(solana.accountReserve)
      .clampLowerZero()

    expect(balances.balance).toEqual(solana.currency.baseUnit(balance))
    expect(balances.spendableBalance).toEqual(expectedSpendableBalance)
    expect(balances.total).toEqual(solana.currency.baseUnit(balance))
    expect(balances.spendable).toEqual(expectedSpendableBalance)
    expect(balances.staked).toEqual(stakingInfo.locked)
    expect(balances.unstaking).toEqual(stakingInfo.pending)
    expect(balances.networkReserve).toEqual(accountState.rentExemptAmount)
    expect(balances.walletReserve).toEqual(solana.accountReserve.sub(accountState.rentExemptAmount))
  })

  test('balance is fixed when unconfirmed txs', () => {
    // Arrange:
    const balance = solana.currency.defaultUnit(100)
    const accountState = new SolanaAccountState({
      balance,
    })
    const txs = [
      // transfer tx
      {
        confirmations: 0,
        date: '2022-04-06T16:25:22.000Z',
        error: null,
        txId: 'FUJKiDXKJSRZuPP7ordWojhhu5y3bWuUPtin6RkPKuAJx6X8d9ySbwf7oPdaYQ4UDswtAL2LdmJ3zFqwX7n5mvZ',
        dropped: false,
        coinAmount: solana.currency.defaultUnit(1).negate(),
        feeAmount: solana.currency.baseUnit(10_000),
        coinName: 'solana',
        feeCoinName: 'solana',
        from: ['3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH'],
        to: 'ADkH1TdMM4wuRLJenStFmTzHGPNYg3HtZXGcKtSaxJ7s',
        selfSend: false,
        tokens: [],
        currencies: { solana: solana.currency },
      },
      // delegate tx
      {
        confirmations: 0,
        date: '2022-04-07T16:25:22.000Z',
        error: null,
        txId: 'gUbZWuxvZ4oCj1XSMSZjoxw1qJ2fhqpgbhGyrz1ktEES94eetboGwNhVnqE5qGVeNja5EU674khPsvZUKMsBQWF',
        dropped: false,
        coinAmount: solana.currency.defaultUnit(2).negate(),
        feeAmount: solana.currency.baseUnit(20_000),
        coinName: 'solana',
        feeCoinName: 'solana',
        from: ['3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH'],
        selfSend: false,
        tokens: [],
        currencies: { solana: solana.currency },
        data: {
          staking: {
            method: 'delegate',
            stakeAddresses: 'ADkH1TdMM4wuRLJenStFmTzHGPNYg3HtZXGcKtSaxJ7s',
          },
        },
      },
    ]
    const txLog = createTxSet({ txs })

    // Act:
    const balances = getBalances({
      asset: solana,
      accountState,
      txLog,
    })

    const zero = solana.currency.ZERO

    // Assert:
    const expectedBalance = solana.currency.baseUnit(98_999_970_000)
    const expectedSpendableBalance = solana.currency
      .baseUnit(96_999_970_000)
      .sub(solana.accountReserve)

    expect(balances.balance.toDefaultString()).toEqual(expectedBalance.toDefaultString())
    expect(balances.spendableBalance.toDefaultString()).toEqual(
      expectedSpendableBalance.toDefaultString()
    )
    expect(balances.networkReserve.toDefaultString()).toEqual(zero.toDefaultString())
    expect(balances.walletReserve.toDefaultString()).toEqual(
      solana.accountReserve.toDefaultString()
    )
  })
})
