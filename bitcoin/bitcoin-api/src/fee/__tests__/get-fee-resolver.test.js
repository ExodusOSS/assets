import { FeeData } from '@exodus/asset-lib'
import { BumpType } from '@exodus/bitcoin-lib'
import { asset } from '@exodus/bitcoin-meta'
import { TxSet } from '@exodus/models'
import lodash from 'lodash'

import { getBalancesFactory } from '../../balances.js'
import { findUnconfirmedSentRbfTxs } from '../../tx-utils.js'
import { resolveUnconfirmedAncestorData } from '../../unconfirmed-ancestor-data.js'
import getFeeEstimatorFactory from '../fee-estimator.js'
import { GetFeeResolver } from '../get-fee-resolver.js'
import {
  confirmedUtxos,
  createCollection,
  noChangeTx,
  rbfChangeConfirmedUtxos,
  rbfTx,
  unconfirmedUtxos,
} from './utxos-tx-set-fixtures.js'

const { mapValues } = lodash

const feeData = new FeeData({
  config: {
    feePerKB: '10000 satoshis',
    fastestFee: '68 satoshis',
    halfHourFee: '60 satoshis',
    hourFee: '50 satoshis',
    nextBlockMinimumFee: '60 satoshis',
    minimumFee: '10 satoshis',
    maxExtraCpfpFee: 100_000,
    rbfBumpFeeBlocks: 3,
    rbfBumpFeeThreshold: 0.8,
    rbfEnabled: true,
  },
  mainKey: 'feePerKB',
  currency: asset.currency,
})

const getFeeEstimator = getFeeEstimatorFactory({
  defaultOutputType: 'P2WSH',
  addressApi: {},
})

describe('get-fee-resolver', () => {
  const allowUnconfirmedRbfEnabledUtxos = false
  const getFeeResolver = new GetFeeResolver({
    getFeeEstimator,
    allowUnconfirmedRbfEnabledUtxos,
    changeAddressType: 'P2WPKH',
  })

  const assertValues = (params, expected) => {
    const balance = params.accountState.utxos.value

    const getBalances = getBalancesFactory({
      feeData: params.feeData,
      allowUnconfirmedRbfEnabledUtxos,
    })

    const balances = getBalances({
      txLog: params.txSet,
      accountState: params.accountState,
      asset: params.asset,
    })
    const { fee, extraFeeData } = getFeeResolver.getFee(params)
    const currentValues = {
      balance,
      spendableBalance: balances.spendable,
      fee,
      extraFee: extraFeeData?.extraFee,
    }

    expect(mapValues(currentValues, (balance) => balance?.toBaseString({ unit: true }))).toEqual(
      expected
    )
  }

  test('without amount or customFee, confirmedUtxos, no tx', () => {
    const accountState = { utxos: confirmedUtxos }
    const txSet = TxSet.fromArray([])
    const params = { asset, accountState, txSet, feeData }
    assertValues(params, {
      balance: '100000000 satoshis',
      fee: '1890 satoshis',
      spendableBalance: '100000000 satoshis',
    })
  })

  test('confirmed + unconfirmed utxos, no tx, isSendAll:true. ', () => {
    const accountState = {
      utxos: confirmedUtxos.union(
        createCollection([
          {
            txId: 'unconfirmed',
            value: '0.5 BTC',
            vout: 0,
          },
        ])
      ),
    }
    const txSet = TxSet.fromArray([])
    const params = { asset, accountState, txSet, feeData }
    assertValues(params, {
      balance: '150000000 satoshis',
      fee: '1890 satoshis',
      spendableBalance: '150000000 satoshis',
    })
  })

  test('confirmed + unconfirmed utxos, no tx, isSendAll:false and undefined amount. ', () => {
    const accountState = {
      utxos: confirmedUtxos.union(
        createCollection([
          {
            txId: 'unconfirmed',
            value: '0.5 BTC',
            vout: 0,
          },
        ])
      ),
    }
    const amount = undefined // like sending Zero
    const txSet = TxSet.fromArray([])
    const params = {
      asset,
      accountState,
      txSet,
      feeData,
      amount,
      isSendAll: false,
    }
    assertValues(params, {
      balance: '150000000 satoshis',
      fee: '1890 satoshis',
      spendableBalance: '150000000 satoshis',
    })
  })

  test('confirmed + unconfirmed utxos, no tx, isSendAll:false and with small amount. ', () => {
    const accountState = {
      utxos: confirmedUtxos.union(
        createCollection([
          {
            txId: 'unconfirmed',
            value: '0.5 BTC',
            vout: 0,
          },
        ])
      ),
    }
    const amount = asset.currency.parse('100000 satoshis')
    const txSet = TxSet.fromArray([])
    const params = {
      asset,
      accountState,
      txSet,
      feeData,
      amount,
      isSendAll: false,
    }
    assertValues(params, {
      balance: '150000000 satoshis',
      fee: '2320 satoshis',
      spendableBalance: '150000000 satoshis',
    })
  })

  test('confirmed + unconfirmed utxos, no tx, isSendAll:all. ', () => {
    const accountState = {
      utxos: confirmedUtxos.union(
        createCollection([
          {
            txId: 'unconfirmed',
            value: '0.5 BTC',
            vout: 0,
          },
        ])
      ),
    }

    const txSet = TxSet.fromArray([])
    const params = {
      asset,
      accountState,
      txSet,
      feeData,
      isSendAll: true,
    }

    assertValues(params, {
      balance: '150000000 satoshis',
      fee: '3490 satoshis',
      spendableBalance: '150000000 satoshis',
    })
  })

  test('confirmed + unconfirmed utxos, no tx, isSendAll:false and with high amount. ', () => {
    const accountState = {
      utxos: confirmedUtxos.union(
        createCollection([
          {
            txId: 'unconfirmed',
            value: '0.5 BTC',
            vout: 0,
          },
        ])
      ),
    }
    const amount = asset.currency.parse('1.3 BTC')
    const txSet = TxSet.fromArray([])
    const params = {
      asset,
      accountState,
      txSet,
      feeData,
      amount,
      isSendAll: false,
    }
    assertValues(params, {
      balance: '150000000 satoshis',
      fee: '3800 satoshis',
      spendableBalance: '150000000 satoshis',
    })
  })

  test('unconfirmed utxos with extra unconfirmed data resolves extraFee ', async () => {
    const accountState = {
      utxos: unconfirmedUtxos,
    }

    const { fees, size } = { size: 100, fees: 100 }
    const insightClient = {
      fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
        expect(paramTxId).toEqual(accountState.utxos.toArray()[0].txId)
        return { fees, size }
      }),
    }

    const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: accountState.utxos,
      insightClient,
    })
    accountState.mem = { unconfirmedTxAncestor }

    const txSet = TxSet.fromArray([])
    const params = {
      asset,
      accountState,
      txSet,
      feeData,
      isSendAll: false,
    }

    assertValues(params, {
      balance: '100000000 satoshis',
      extraFee: '900 satoshis',
      fee: '2790 satoshis',
      spendableBalance: '100000000 satoshis',
    })
  })

  describe('canBumpTx', () => {
    const txSet = TxSet.fromArray([])
    test('cannot bump if not sent', () => {
      const accountState = { utxos: confirmedUtxos }
      const tx = { sent: false, coinName: 'bitcoin', pending: true }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('cannot bump if fee rate is too high', () => {
      const accountState = { utxos: confirmedUtxos }

      const tx = {
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 10_000,
          blocksSeen: 0,
        },
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('cannot bump if fee rate is above nextBlockMinimumFee', () => {
      const accountState = { utxos: confirmedUtxos }

      const tx = {
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 10_000,
          blocksSeen: 0,
        },
        pending: true,
      }

      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData: feeData.update({
          feePerKB: asset.currency.parse('10000 satoshis'),
          nextBlockMinimumFee: asset.currency.parse('9 satoshis'),
        }),
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('can bump if fee rate is below nextBlockMinimumFee', () => {
      const accountState = { utxos: unconfirmedUtxos }

      const tx = {
        txId: '1',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 7999,
          blocksSeen: 0,
        },
        pending: true,
      }

      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData: feeData.update({
          feePerKB: asset.currency.parse('10000 satoshis'),
          nextBlockMinimumFee: asset.currency.parse('9 satoshis'),
        }),
      })

      expect(bumpType).toBe(BumpType.CPFP)
      expect(errorMessage).toBeNull()
    })

    test('can bump if fee rate is too low', () => {
      const accountState = { utxos: unconfirmedUtxos }
      const tx = {
        txId: '1',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 7999,
          blocksSeen: 0,
        },
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.CPFP)
      expect(errorMessage).toBeNull()
    })

    test('can not bump if tx is confirmed', () => {
      const accountState = { utxos: confirmedUtxos }

      const tx = {
        txId: '1',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 20_000,
          blocksSeen: 3,
        },
        pending: false,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('can not bump if no change', () => {
      const accountState = { utxos: unconfirmedUtxos }
      const tx = {
        txId: '2',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 20_000,
          blocksSeen: 3,
        },
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('can not bump if rbf has spent change', () => {
      const accountState = { utxos: confirmedUtxos }
      const txSet = TxSet.fromArray([rbfTx])
      expect([...txSet]).toEqual(findUnconfirmedSentRbfTxs(txSet))
      const tx = {
        txId: 'rbf',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 20_000,
          blocksSeen: 3,
        },
        coinAmount: asset.currency.defaultUnit(100),
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.NONE)
      expect(errorMessage).not.toBeNull()
    })

    test('can bump if rbf', () => {
      const accountState = { utxos: rbfChangeConfirmedUtxos }
      const txSet = TxSet.fromArray([rbfTx])

      const tx = {
        txId: 'rbf',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 20_000,
          blocksSeen: 3,
        },
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.RBF)
      expect(errorMessage).toBeNull()
    })

    test('can bump if rbf with no change', () => {
      const accountState = { utxos: unconfirmedUtxos }
      const txSet = TxSet.fromArray([noChangeTx])
      expect([...txSet]).toEqual(findUnconfirmedSentRbfTxs(txSet))
      const tx = {
        txId: '1',
        sent: true,
        coinName: 'bitcoin',
        data: {
          feePerKB: 20_000,
          blocksSeen: 3,
        },
        pending: true,
      }
      const { bumpType, errorMessage } = getFeeResolver.canBumpTx({
        asset,
        tx,
        txSet,
        accountState,
        feeData,
      })

      expect(bumpType).toBe(BumpType.RBF)
      expect(errorMessage).toBeNull()
    })
  })
})
