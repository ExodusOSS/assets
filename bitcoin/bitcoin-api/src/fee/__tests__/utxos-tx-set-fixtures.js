import { asset } from '@exodus/bitcoin-meta'
import { Tx, UtxoCollection } from '@exodus/models'

const coinName = asset.name
const feeCoinName = asset.name
const currency = asset.currency
export const createCollection = (utxos) =>
  UtxoCollection.fromJSON(
    {
      address: {
        utxos,
      },
    },
    { currency }
  )

export const unconfirmedUtxos = createCollection([
  {
    txId: '1',
    value: '1 BTC',
    vout: 0,
  },
])

export const confirmedUtxos = createCollection([
  {
    txId: '1',
    value: '1 BTC',
    vout: 0,
    confirmations: 1,
  },
])

export const rbfChangeConfirmedUtxos = createCollection([
  {
    txId: 'rbf',
    value: '1 BTC',
    vout: 0,
    confirmations: 1,
  },
])

export const rbfTx = Tx.fromJSON({
  txId: 'rbf',
  coinName,
  feeAmount: '0.00000232 BTC',
  feeCoinName,
  coinAmount: asset.currency.defaultUnit(500),
  to: 'Somebody Else',
  pending: true,
  data: {
    sent: [{ address: 'P2WSH' }],
    changeAddress: { address: 'P2WPKH' },
    feePerKB: 1000,
    rbfEnabled: true,
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

export const noChangeTx = Tx.fromJSON({
  txId: '1',
  coinName,
  feeAmount: '0.00000232 BTC',
  feeCoinName,
  coinAmount: asset.currency.defaultUnit(500),
  to: 'Somebody Else',
  pending: true,
  data: {
    sent: [{ address: 'P2WSH' }],
    feePerKB: 1000,
    rbfEnabled: true,
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
