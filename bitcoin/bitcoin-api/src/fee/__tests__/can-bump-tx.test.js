import { BumpType } from '@exodus/bitcoin-lib'
import { asset } from '@exodus/bitcoin-meta'
import { TxSet } from '@exodus/models'

import { findUnconfirmedSentRbfTxs } from '../../tx-utils.js'
import { canBumpTx } from '../can-bump-tx.js'
import {
  confirmedUtxos,
  noChangeTx,
  rbfChangeConfirmedUtxos,
  rbfTx,
  unconfirmedUtxos,
} from './utxos-tx-set-fixtures.js'

const coinName = asset.name

const allowUnconfirmedRbfEnabledUtxos = false
const feeData = {
  feePerKB: asset.currency.parse('10000 satoshis'),
  fastestFee: asset.currency.parse('68 satoshis'),
  maxExtraCpfpFee: 100_000, // 100k statoshis, this is not a UnitType because it could be overridden with remote configs
  rbfBumpFeeBlocks: 3,
  rbfBumpFeeThreshold: 0.8,
}

const txSet = TxSet.fromArray([])

const getFeeEstimator =
  (asset, { feePerKB }) =>
  ({ inputs, outputs }) => {
    const outputSize = outputs ? (Array.isArray(outputs) ? outputs.length : outputs.size) : 2
    const size = (inputs ? inputs.size : 1) * 50 + outputSize * 34 + 107
    const rawFee = Math.ceil((feePerKB.toBaseNumber() * size) / 1000)
    return asset.currency.baseUnit(rawFee)
  }

test('cannot bump if not sent', () => {
  const accountState = { utxos: confirmedUtxos }
  const tx = { sent: false, coinName, pending: true }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('cannot bump if fee rate is too high', () => {
  const accountState = { utxos: confirmedUtxos }

  const tx = {
    sent: true,
    coinName,
    data: {
      feePerKB: 10_000,
      blocksSeen: 0,
    },
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('cannot bump if fee rate is above nextBlockMinimumFee', () => {
  const accountState = { utxos: confirmedUtxos }

  const tx = {
    sent: true,
    coinName,
    data: {
      feePerKB: 10_000,
      blocksSeen: 0,
    },
    pending: true,
  }

  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData: {
      ...feeData,
      feePerKB: asset.currency.parse('10000 satoshis'),
      nextBlockMinimumFee: asset.currency.parse('9 satoshis'),
    },
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('can bump if fee rate is below nextBlockMinimumFee', () => {
  const accountState = { utxos: unconfirmedUtxos }

  const tx = {
    txId: '1',
    sent: true,
    coinName,
    data: {
      feePerKB: 7999,
      blocksSeen: 0,
    },
    pending: true,
  }

  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData: {
      ...feeData,
      feePerKB: asset.currency.parse('10000 satoshis'),
      nextBlockMinimumFee: asset.currency.parse('10 satoshis'),
    },
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.CPFP)
  expect(errorMessage).toBeNull()
  expect(bumpFee.toBaseString({ unit: true })).toEqual('1910 satoshis')
})

test('can bump if fee rate is too low', () => {
  const accountState = { utxos: unconfirmedUtxos }
  const tx = {
    txId: '1',
    sent: true,
    coinName,
    data: {
      feePerKB: 7999,
      blocksSeen: 0,
    },
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.CPFP)
  expect(errorMessage).toBeNull()
  expect(bumpFee.toBaseString({ unit: true })).toEqual('1910 satoshis')
})

test('can not bump if tx is confirmed', () => {
  const accountState = { utxos: confirmedUtxos }

  const tx = {
    txId: '1',
    sent: true,
    coinName,
    data: {
      feePerKB: 20_000,
      blocksSeen: 3,
    },
    pending: false,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('can not bump if no change', () => {
  const accountState = { utxos: unconfirmedUtxos }
  const tx = {
    txId: '2',
    sent: true,
    coinName,
    data: {
      feePerKB: 20_000,
      blocksSeen: 3,
    },
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('can not bump if rbf has spent change', () => {
  const accountState = { utxos: confirmedUtxos }
  const txSet = TxSet.fromArray([rbfTx])
  expect([...txSet]).toEqual(findUnconfirmedSentRbfTxs(txSet))
  const tx = {
    txId: 'rbf',
    sent: true,
    coinName,
    data: {
      feePerKB: 20_000,
      blocksSeen: 3,
    },
    coinAmount: asset.currency.defaultUnit(100),
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.NONE)
  expect(errorMessage).not.toBeNull()
  expect(bumpFee).toEqual(undefined)
})

test('can bump if rbf', () => {
  const accountState = { utxos: rbfChangeConfirmedUtxos }
  const txSet = TxSet.fromArray([rbfTx])

  const tx = {
    txId: 'rbf',
    sent: true,
    coinName,
    data: {
      feePerKB: 20_000,
      blocksSeen: 3,
    },
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.RBF)
  expect(errorMessage).toBeNull()
  expect(bumpFee.toBaseString({ unit: true })).toEqual('2018 satoshis')
})

test('can bump if rbf with no change', () => {
  const accountState = { utxos: unconfirmedUtxos }
  const txSet = TxSet.fromArray([noChangeTx])
  expect([...txSet]).toEqual(findUnconfirmedSentRbfTxs(txSet))
  const tx = {
    txId: '1',
    sent: true,
    coinName,
    data: {
      feePerKB: 20_000,
      blocksSeen: 3,
    },
    pending: true,
  }
  const { bumpType, errorMessage, bumpFee } = canBumpTx({
    asset,
    tx,
    txSet,
    getFeeEstimator,
    accountState,
    feeData,
    allowUnconfirmedRbfEnabledUtxos,
  })

  expect(bumpType).toBe(BumpType.RBF)
  expect(errorMessage).toBeNull()
  expect(bumpFee.toBaseString({ unit: true })).toEqual('2018 satoshis')
})
