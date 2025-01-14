import { FeeData } from '@exodus/asset-lib'
import { asset } from '@exodus/bitcoin-meta'
import { Address, UtxoCollection } from '@exodus/models'

import { resolveUnconfirmedAncestorData } from '../../unconfirmed-ancestor-data.js'
import getFeeEstimatorFactory from '../fee-estimator.js'

const feeData = new FeeData({
  config: { feePerKB: '68000 satoshis' },
  mainKey: 'feePerKB',
  currency: asset.currency,
})

const getFeeEstimator = getFeeEstimatorFactory({
  defaultOutputType: 'P2WSH',
  addressApi: {},
})
test('default fee - P2PKH => P2PKH + P2PKH', () => {
  const feePerKB = feeData.feePerKB
  const fee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs: [null],
    outputs: ['P2PKH', 'P2PKH'],
  }).toBaseString()

  expect(fee).toBe(feePerKB.mul(0.226).toBaseString())
})

test('nested segwit inputs - P2SH(P2WPKH) => P2PKH + P2PKH', () => {
  const feePerKB = feeData.feePerKB
  const fee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs: ['a9149f7fd096d37ed2c0e3f7f0cfc924beef4ffceb6887'], // P2SH is treated as nested segwit
    outputs: ['P2SH', 'P2SH'],
  }).toBaseString()
  expect(fee).toBe(feePerKB.mul(0.166).toBaseString())
})

test('custom fee - P2PKH => P2PKH + P2PKH', () => {
  const feeEstimator = getFeeEstimator(asset, asset.currency.baseUnit(1000))
  const fee = feeEstimator({ inputs: [null], outputs: ['P2PKH', 'P2PKH'] }).toBaseString({
    unit: true,
  })
  expect(fee).toBe('226 satoshis')
})

test('use defaultOptions - P2PKH => P2PKH', () => {
  const feePerKB = feeData.feePerKB
  const feeEstimator = getFeeEstimator(asset, feePerKB, { outputs: ['P2PKH'] })
  const fee = feeEstimator({ inputs: [null] }).toBaseString()
  expect(fee).toBe(feePerKB.mul(0.192).toBaseString())
})

test('UtxoCollection as inputs - nothing => P2PKH', () => {
  const utxos = UtxoCollection.fromArray([], { currency: asset.currency })
  const feePerKB = feeData.feePerKB
  const fee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs: utxos,
    outputs: ['P2PKH'],
  }).toBaseString()
  expect(fee).toBe(feePerKB.mul(0.044).toBaseString())
})

test('Add extra fee', async () => {
  const txId = 'small'

  const { size, fees } = { size: 100, fees: 100 }

  const insightClient = {
    fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
      expect(paramTxId).toEqual(txId)
      return {
        size,
        fees,
      }
    }),
  }
  const utxos = UtxoCollection.fromArray(
    [{ address: Address.create('Address'), txId, value: '5 BTC' }],
    { currency: asset.currency }
  )

  const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
    utxos,
    insightClient,
  })

  const feePerKB = feeData.feePerKB
  const fee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs: utxos,
    outputs: ['P2PKH'],
    unconfirmedTxAncestor,
  }).toBaseString()
  const extraFee = (feePerKB.toBaseNumber() / 1e3 - fees / size) * size

  expect(fee).toBe(
    feePerKB.mul(0.192).add(asset.currency.baseUnit(extraFee)).toBaseString(),
    'P2PKH => P2PKH + extra fee'
  )
})

test('Ravencoin specific script', () => {
  const inputs = [
    '76a914000000000000000000000000000000000000000088ac',
    '76a9146850d8a39506d5840892b8fd144733b39c2a888988acc02572766e74185757572e52564e415353455453464f5253414c452e434f4d005ed0b20000000075',
    '76a9146850d8a39506d5840892b8fd144733b39c2a888988acc01b72766e740e434f52564f434841542f4245544100e40b540200000075',
  ]

  // default bitcoin fails on RVN inputs
  expect(() => getFeeEstimator(asset, feeData.feePerKB)({ inputs, outputs: ['P2PKH'] })).toThrow(
    'Only pubkeyhash, witnesspubkeyhash, scripthash, taproot inputs supported right now'
  )
})

test('Taproot tapScript spend specific script', () => {
  const feePerKB = feeData.feePerKB
  const inputs = ['51205108307e38a0fd85ff5ffeb27c78143ed488d91eec3100edaeebc253ce254f5d']
  const outputs = ['P2TR', 'P2TR']
  const fee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs,
    outputs,
  }).toBaseString()
  const txSize = 154
  expect(fee).toBe(feePerKB.mul(txSize / 1000).toBaseString())

  const extraTaprootWitnessSize = 400
  const taprootFee = getFeeEstimator(
    asset,
    feePerKB
  )({
    inputs,
    outputs,
    taprootInputWitnessSize: extraTaprootWitnessSize + 65, // 65 is single signature plus varint,
  }).toBaseString()
  const taprootTxSize = txSize + extraTaprootWitnessSize / 4
  expect(taprootFee).toBe(feePerKB.mul(taprootTxSize / 1000).toBaseString())
})
