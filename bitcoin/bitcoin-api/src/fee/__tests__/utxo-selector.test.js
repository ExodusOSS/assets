import { asset } from '@exodus/bitcoin-meta'
import { Tx, UtxoCollection } from '@exodus/models'
import lodash from 'lodash'

import { resolveUnconfirmedAncestorData } from '../../unconfirmed-ancestor-data.js'
import { getUtxosData } from '../utxo-selector.js'

const { mapValues } = lodash

const coinName = asset.name
const feeCoinName = asset.name
const currency = asset.currency
const allowUnconfirmedRbfEnabledUtxos = false

// we should probably replace it with the real fee bitcoin fee-estimator
const getFeeEstimator =
  (asset, { feePerKB }) =>
  ({ inputs, outputs }) => {
    const outputSize = outputs ? (Array.isArray(outputs) ? outputs.length : outputs.size) : 2
    const size = (inputs ? inputs.size : 1) * 50 + outputSize * 34 + 107
    const rawFee = Math.ceil((feePerKB.toBaseNumber() * size) / 1000)
    return asset.currency.baseUnit(rawFee)
  }

const createCollection = (utxos) =>
  UtxoCollection.fromJSON(
    {
      address: {
        utxos,
      },
    },
    { currency }
  )

const twoConfirmedUtxos = createCollection([
  {
    txId: '1',
    confirmations: 1,
    value: '1 BTC',
    vout: 0,
  },
  {
    txId: '2',
    confirmations: 1,
    value: '1 BTC',
    vout: 0,
  },
])

const smallAndLargeUtxos = createCollection([
  {
    txId: '1',
    confirmations: 1,
    value: '0.5 BTC',
    vout: 0,
  },
  {
    txId: '2',
    confirmations: 1,
    value: '1 BTC',
    vout: 0,
  },
])

const largeUtxo = createCollection([
  {
    txId: '2',
    confirmations: 1,
    value: '1 BTC',
    vout: 0,
  },
])

const oneUnconfirmedUtxos = createCollection([
  {
    txId: '4',
    value: '1 BTC',
    vout: 0,
  },
])

const oneRbfDisabledUnconfirmedUtxos = createCollection([
  {
    txId: 'rbf',
    value: '1 BTC',
    vout: 0,
    rbfEnabled: false,
  },
])

const oneRbfEnabledUnconfirmedUtxos = createCollection([
  {
    txId: 'rbf',
    value: '1 BTC',
    vout: 0,
    rbfEnabled: true,
  },
])

const oneCpfpUnconfirmedUtxos = createCollection([
  {
    txId: 'cpfp',
    value: '1 BTC',
    vout: 0,
  },
])

const feeRate = asset.currency.parse('2000 satoshis')
const economicalFeeRate = asset.currency.parse('1000 satoshis')
const inscriptionIds = ['a', 'b', 'c']

const bigFeeTx = Tx.fromJSON({
  txId: 'rbf',
  coinName,
  feeAmount: '0.00002320 BTC',
  feeCoinName,
  data: {
    sent: [{ address: 'P2WSH' }],
    changeAddress: { address: 'P2WPKH' },
    feePerKB: 10_000,
    inputs: {
      address: {
        utxos: [
          {
            txId: '1',
            confirmations: 1,
            value: '1 BTC',
            vout: 0,
          },
        ],
      },
    },
  },
  currencies: { bitcoin: asset.currency },
})

const smallFeeTx = Tx.fromJSON({
  txId: 'rbf',
  coinName,
  feeAmount: '0.00000232 BTC',
  feeCoinName,
  data: {
    sent: [{ address: 'P2WSH' }],
    changeAddress: { address: 'P2WPKH' },
    feePerKB: 1000,
    inputs: {
      address: {
        utxos: [
          {
            txId: '1',
            confirmations: 1,
            value: '1 BTC',
            vout: 0,
          },
        ],
      },
    },
  },
  currencies: { bitcoin: asset.currency },
})

const noChangeTx = Tx.fromJSON({
  txId: 'rbf',
  coinName,
  feeAmount: '0.00000232 BTC',
  feeCoinName,
  data: {
    sent: [{ address: 'P2WSH' }],
    feePerKB: 1000,
    inputs: {
      address: {
        utxos: [
          {
            txId: '1',
            confirmations: 1,
            value: '1 BTC',
            vout: 0,
          },
        ],
      },
    },
  },
  currencies: { bitcoin: asset.currency },
})

const assertGetUtxosData = (params, expected = {}) => {
  const result = getUtxosData({ ...params, allowUnconfirmedRbfEnabledUtxos })
  const {
    availableBalance,
    spendableBalance,
    fee,
    unspendableFee,
    extraFeeData,
    selectedUtxos,
    replaceTx,
  } = result
  // expect(availableBalance.add(resolvedFee).toDefaultString()).toEqual(spendableBalance.toDefaultString())
  const balances = mapValues(
    {
      availableBalance,
      spendableBalance,
      unspendableFee,
      fee,
      extraFee: extraFeeData?.extraFee || asset.currency.ZERO,
      balance: params.usableUtxos.value,
    },
    (balance) => balance?.toBaseString({ unit: true }) || null
  )
  expect({
    ...balances,
    extraFeeType: extraFeeData?.type,
    selectedUtxos: selectedUtxos?.size,
    replaceTxId: replaceTx?.txId,
  }).toEqual(expected)

  return result
}

test('select empty utxos returns empty object', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: UtxoCollection.createEmpty({ currency }),
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '0 satoshis',
      availableBalance: '0 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '282 satoshis',
      fee: '282 satoshis',
      spendableBalance: '0 satoshis',
    }
  )

  expect(selectedUtxos).toBe(undefined)
  expect(replaceTx).toBe(undefined)
})

test('select empty utxos returns empty object with inscriptionIds', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: UtxoCollection.createEmpty({ currency }),
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
      inscriptionIds,
    },
    {
      availableBalance: '0 satoshis',
      balance: '0 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '418 satoshis',
      fee: '418 satoshis',
      spendableBalance: '0 satoshis',
    }
  )

  expect(selectedUtxos).toBe(undefined)
  expect(replaceTx).toBe(undefined)
})

test('select replaceable tx and no additional when rbf disabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      selectedUtxos: 0,
      replaceTxId: 'rbf',
    }
  )

  expect(selectedUtxos.size).toBe(0)
  expect(replaceTx).toBe(smallFeeTx)
})

test('select replaceable tx and no additional when rbf disabled and dust', () => {
  const amount = asset.currency.baseUnit('300000000').sub(asset.currency.baseUnit(1000))
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999350 satoshis',
      extraFee: '350 satoshis',
      extraFeeType: 'dust',
      unspendableFee: '650 satoshis',
      fee: '1000 satoshis',
      spendableBalance: '300000000 satoshis',
      selectedUtxos: 3,
      replaceTxId: undefined,
    }
  )

  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
})

test('cannot replace when there are inscriptionIds', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      feeRate,
      getFeeEstimator,
      inscriptionIds,
    },
    {
      availableBalance: '299999414 satoshis',
      balance: '300000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '586 satoshis',
      fee: '586 satoshis',
      selectedUtxos: 1,
      spendableBalance: '300000000 satoshis',
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('select replaceable tx and no additional when rbf enabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      selectedUtxos: 0,
      replaceTxId: 'rbf',
    }
  )

  expect(selectedUtxos.size).toBe(0)
  expect(replaceTx).toBe(smallFeeTx)
})

test('select replaceable tx with no change', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      replaceableTxs: [noChangeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '200000000 satoshis',
      selectedUtxos: 1,
      replaceTxId: 'rbf',
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(noChangeTx)
})

test('select replaceable tx with no change', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      replaceableTxs: [noChangeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '200000000 satoshis',
      selectedUtxos: 1,
      replaceTxId: 'rbf',
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(noChangeTx)
})

test('select replaceable tx with no receiver when rbf disabled', () => {
  const amount = asset.currency.ZERO
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      receiveAddress: null,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999845 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '2475 satoshis',
      fee: '155 satoshis',
      spendableBalance: '300000000 satoshis',
      selectedUtxos: 0,
      replaceTxId: 'rbf',
    }
  )

  expect(selectedUtxos.size).toBe(0)
  expect(replaceTx).toBe(bigFeeTx)
})

test('select replaceable tx with no receiver when rbf enabled', () => {
  const amount = asset.currency.ZERO
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      receiveAddress: null,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999845 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '2475 satoshis',
      fee: '155 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )

  expect(selectedUtxos.size).toBe(0)
  expect(replaceTx).toBe(bigFeeTx)
})

test('No replaceable tx and one additional utxo with rbf fee rate when rbf disabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999775 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '225 satoshis',
      fee: '225 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('No replaceable tx and one additional utxo with rbf fee rate when rbf enabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '199999775 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '225 satoshis',
      fee: '225 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('No replaceable tx with spent change address', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999550 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '450 satoshis',
      fee: '450 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('No replaceable tx and two additional utxo with rbf fee rate when rbf disabled', () => {
  const amount = asset.currency.parse('1 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999725 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '275 satoshis',
      fee: '275 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(0)
  expect(replaceTx).toBe(undefined)
})

test('No replaceable tx and two additional utxo with rbf fee rate when rbf enabled', () => {
  const amount = asset.currency.parse('1 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [bigFeeTx, smallFeeTx],
      amount,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '199999725 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '275 satoshis',
      fee: '275 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(0)
  expect(replaceTx).toBe(undefined)
})

test('Select cpfp utxo when needed and the extra fee', async () => {
  const amount = asset.currency.parse('2.5 BTC')
  const utxos = twoConfirmedUtxos.union(oneCpfpUnconfirmedUtxos)

  const insightClient = {
    fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
      if (paramTxId === 'cpfp') return { size: 100, fees: 5 }
    }),
  }

  const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
    utxos,
    insightClient,
  })
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      unconfirmedTxAncestor,
      usableUtxos: utxos,
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999350 satoshis',
      extraFee: '195 satoshis',
      unspendableFee: '650 satoshis',
      extraFeeType: 'cpfp',
      fee: '650 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.getTxIdUtxos('cpfp').size).toBe(1)
  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
})

test('Select cpfp utxo when needed and the extra fee, no replecable', async () => {
  const amount = asset.currency.parse('2.5 BTC')
  const utxos = twoConfirmedUtxos.union(oneCpfpUnconfirmedUtxos)

  const insightClient = {
    fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
      if (paramTxId === 'cpfp') return { size: 100, fees: 5 }
    }),
  }

  const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
    utxos,
    insightClient,
  })
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      unconfirmedTxAncestor,
      usableUtxos: utxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999350 satoshis',
      extraFee: '195 satoshis',
      unspendableFee: '650 satoshis',
      extraFeeType: 'cpfp',
      fee: '650 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.getTxIdUtxos('cpfp').size).toBe(1)
  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
})

test('Select cpfp utxo when needed and the extra fee and dust, no replecable', async () => {
  const amount = asset.currency.baseUnit('300000000').sub(asset.currency.baseUnit(1000))
  const utxos = twoConfirmedUtxos.union(oneCpfpUnconfirmedUtxos)

  const insightClient = {
    fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
      if (paramTxId === 'cpfp') return { size: 100, fees: 5 }
    }),
  }

  const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
    utxos,
    insightClient,
  })
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      unconfirmedTxAncestor,
      usableUtxos: utxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999350 satoshis',
      extraFee: '545 satoshis',
      unspendableFee: '650 satoshis',
      extraFeeType: 'cpfpdust',
      fee: '1000 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.getTxIdUtxos('cpfp').size).toBe(1)
  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
})

test('Select rbf utxo when all when rbf disabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      isSendAll: true,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999709 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '291 satoshis',
      fee: '291 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.size).toBe(3)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('Select rbf utxo when all when rbf enabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      isSendAll: true,
      feeRate: economicalFeeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '199999709 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '291 satoshis',
      fee: '291 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.size).toBe(3)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('Empty object response when not enough funds', () => {
  const amount = asset.currency.parse('2 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      availableBalance: '199999518 satoshis',
      balance: '200000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '482 satoshis',
      fee: '482 satoshis',
      spendableBalance: '200000000 satoshis',
    }
  )

  expect(selectedUtxos).toBe(undefined)
  expect(replaceTx).toBe(undefined)
})

test('replace all utxos for isSendAll when rbf disabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(smallFeeTx)
})

test('replace all utxos for isSendAll when rbf enabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(smallFeeTx)
})

test('no replacing with unconfirmed utxo for isSendAll when rbf disabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos
        .union(oneRbfDisabledUnconfirmedUtxos)
        .union(oneUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '400000000 satoshis',
      availableBalance: '399999318 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '682 satoshis',
      fee: '682 satoshis',
      spendableBalance: '400000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 4,
    }
  )

  expect(selectedUtxos.size).toBe(4)
  expect(replaceTx).toBe(undefined)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
})

test('no replacing with unconfirmed utxo for isSendAll when rbf enabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos
        .union(oneRbfEnabledUnconfirmedUtxos)
        .union(oneUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '400000000 satoshis',
      availableBalance: '299999318 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '682 satoshis',
      fee: '682 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 4,
    }
  )

  expect(selectedUtxos.size).toBe(4)
  expect(replaceTx).toBe(undefined)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
})

test('should return unconfirmed utxos', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: oneUnconfirmedUtxos,
      replaceableTxs: [],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '100000000 satoshis',
      availableBalance: '99999618 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '382 satoshis',
      fee: '382 satoshis',
      spendableBalance: '100000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(selectedUtxos.value.toDefaultString({ unit: true })).toBe('1 BTC')
  expect(replaceTx).toBe(undefined)
})

test('should return unconfirmed utxos when rbfEnabled when rbf disabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: oneRbfDisabledUnconfirmedUtxos,
      replaceableTxs: [],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '100000000 satoshis',
      availableBalance: '99999618 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '382 satoshis',
      fee: '382 satoshis',
      spendableBalance: '100000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(selectedUtxos.value.toDefaultString({ unit: true })).toBe('1 BTC')
  expect(replaceTx).toBe(undefined)
})

test('should return unconfirmed utxos when rbfEnabled when rbf enabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: oneRbfEnabledUnconfirmedUtxos,
      replaceableTxs: [],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      availableBalance: '0 satoshis',
      balance: '100000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '282 satoshis',
      fee: '282 satoshis',
      spendableBalance: '0 satoshis',
    }
  )

  expect(selectedUtxos).toBeUndefined()
  expect(replaceTx).toBe(undefined)
})

test('replacing with multiple replaceable txs for isSendAll when rbf disabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx, bigFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999418 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '582 satoshis',
      fee: '582 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
})

test('replacing with multiple replaceable txs for isSendAll when rbf enabled', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx, bigFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '199999418 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '582 satoshis',
      fee: '582 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 3,
    }
  )

  expect(selectedUtxos.size).toBe(3)
  expect(replaceTx).toBe(undefined)
  expect(selectedUtxos.getTxIdUtxos('rbf').size).toBe(1)
})

test('check available balance can be selected', () => {
  const amount = assertGetUtxosData(
    {
      asset,
      isSendAll: true,
      usableUtxos: twoConfirmedUtxos,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999518 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '482 satoshis',
      fee: '482 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  ).availableBalance

  expect(amount.toDefaultString({ unit: true })).toBe('1.99999518 BTC')

  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999518 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '482 satoshis',
      fee: '482 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(undefined)
})

test('check spendable balance can not be selected', () => {
  const amount = assertGetUtxosData(
    {
      asset,
      isSendAll: true,
      usableUtxos: twoConfirmedUtxos,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999518 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '482 satoshis',
      fee: '482 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  ).spendableBalance

  expect(amount.toDefaultString({ unit: true })).toBe('2 BTC')

  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      availableBalance: '199999518 satoshis',
      balance: '200000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '482 satoshis',
      fee: '482 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: undefined,
    }
  )

  expect(selectedUtxos).toBe(undefined)
  expect(replaceTx).toBe(undefined)
})

test('check available balance when not sending all', () => {
  const { availableBalance: amount } = assertGetUtxosData(
    {
      asset,
      isSendAll: false,
      amount: asset.currency.parse('1.5 BTC'),
      usableUtxos: twoConfirmedUtxos,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999450 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '550 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(amount.toDefaultString({ unit: true })).toBe('1.9999945 BTC')

  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999450 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '550 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(undefined)
  // fee is more expensive because it includes a change output
})

test('check available balance can be selected with replaceable tx when rbf disabled', () => {
  const amount = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  ).availableBalance

  expect(amount.toDefaultString({ unit: true })).toBe('2.99999682 BTC')

  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(smallFeeTx)
})

test('check available balance can be selected with replaceable tx when rbf enabled', () => {
  const amount = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      feeRate,
      isSendAll: true,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  ).availableBalance

  expect(amount.toDefaultString({ unit: true })).toBe('2.99999682 BTC')

  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      availableBalance: '299999682 satoshis',
      balance: '300000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(smallFeeTx)
})

test('check getFee', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { fee } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999550 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '450 satoshis',
      fee: '450 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(fee.toBaseString({ unit: true })).toBe('450 satoshis')

  assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos,
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '200000000 satoshis',
      availableBalance: '199999550 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '450 satoshis',
      fee: '450 satoshis',
      spendableBalance: '200000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )
})

test('check getFee with replaceable tx when rbf disabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { fee } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )

  expect(fee.toBaseString({ unit: true })).toBe('286 satoshis')

  assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )
})

test('check getFee with replaceable tx when rbf enabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { fee } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )

  expect(fee.toBaseString({ unit: true })).toBe('286 satoshis')

  assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      availableBalance: '299999714 satoshis',
      balance: '300000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )
})

test('check getFee with replaceable tx when rbf enabled', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { fee } = assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )

  expect(fee.toBaseString({ unit: true })).toBe('286 satoshis')

  assertGetUtxosData(
    {
      asset,
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999714 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '518 satoshis',
      fee: '286 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 0,
    }
  )
})

test('select with no change and no receiveAddress with replaceable tx when rbf disabled', () => {
  const amount = asset.currency.parse('2.999350 BTC')

  assertGetUtxosData(
    {
      asset,
      balance: '300000000 satoshis',
      usableUtxos: twoConfirmedUtxos.union(oneRbfDisabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      receiveAddress: null,
      amount,
      feeRate,
      isSendAll: false,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )
})

test('select with no change and no receiveAddress with replaceable tx when rbf enabled', () => {
  const amount = asset.currency.parse('2.999350 BTC')

  assertGetUtxosData(
    {
      asset,
      balance: '300000000 satoshis',
      usableUtxos: twoConfirmedUtxos.union(oneRbfEnabledUnconfirmedUtxos),
      replaceableTxs: [smallFeeTx],
      receiveAddress: null,
      amount,
      feeRate,
      isSendAll: false,
      getFeeEstimator,
    },
    {
      balance: '300000000 satoshis',
      availableBalance: '299999682 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '318 satoshis',
      spendableBalance: '300000000 satoshis',
      replaceTxId: 'rbf',
      selectedUtxos: 2,
    }
  )
})

test('select both utxos without mustSpendUtxos', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: smallAndLargeUtxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '150000000 satoshis',
      availableBalance: '149999450 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '550 satoshis',
      spendableBalance: '150000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(undefined)
})

test('select both with change dust', () => {
  const amount = smallAndLargeUtxos.value.sub(asset.currency.baseUnit(1000))
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: smallAndLargeUtxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '150000000 satoshis',
      availableBalance: '149999450 satoshis',
      extraFee: '450 satoshis',
      extraFeeType: 'dust',
      unspendableFee: '550 satoshis',
      fee: '1000 satoshis',
      spendableBalance: '150000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(undefined)
})

test('select both without change dust', () => {
  const amount = smallAndLargeUtxos.value.sub(asset.currency.baseUnit(6550))
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: smallAndLargeUtxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
    },
    {
      balance: '150000000 satoshis',
      availableBalance: '149999450 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '550 satoshis',
      fee: '550 satoshis',
      spendableBalance: '150000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 2,
    }
  )

  expect(selectedUtxos.size).toBe(2)
  expect(replaceTx).toBe(undefined)
})

test('select one utxo when spending with inscriptions', () => {
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: smallAndLargeUtxos,
      replaceableTxs: [],
      feeRate,
      getFeeEstimator,
      inscriptionIds,
    },
    {
      availableBalance: '149999414 satoshis',
      balance: '150000000 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '586 satoshis',
      fee: '586 satoshis',
      selectedUtxos: 1,
      spendableBalance: '150000000 satoshis',
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})

test('select larger utxo only with mustSpendUtxos', () => {
  const amount = asset.currency.parse('0.5 BTC')
  const { selectedUtxos, replaceTx } = assertGetUtxosData(
    {
      asset,
      usableUtxos: smallAndLargeUtxos,
      replaceableTxs: [],
      amount,
      feeRate,
      getFeeEstimator,
      mustSpendUtxos: largeUtxo,
    },
    {
      balance: '150000000 satoshis',
      availableBalance: '149999550 satoshis',
      extraFee: '0 satoshis',
      unspendableFee: '450 satoshis',
      fee: '450 satoshis',
      spendableBalance: '150000000 satoshis',
      replaceTxId: undefined,
      selectedUtxos: 1,
    }
  )

  expect(selectedUtxos.size).toBe(1)
  expect(replaceTx).toBe(undefined)
})
