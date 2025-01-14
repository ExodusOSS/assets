import { FeeData } from '@exodus/asset-lib'
import { asset } from '@exodus/bitcoin-meta'
import { Address, UtxoCollection } from '@exodus/models'

import { resolveUnconfirmedAncestorData } from '../../unconfirmed-ancestor-data.js'
import { getExtraFee } from '../fee-utils.js'

const feeData = new FeeData({
  config: { feePerKB: '68000 satoshis' },
  mainKey: 'feePerKB',
  currency: asset.currency,
})

describe('fee-utils.getExtraFee', () => {
  test('getExtraFee include small unconfirmed tx', async () => {
    const txId = 'small'
    const utxos = UtxoCollection.fromArray(
      [{ address: Address.create('Address'), txId, value: '5 BTC' }],
      { currency: asset.currency }
    )
    const { fees, size } = { size: 100, fees: 100 }
    const insightClient = {
      fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
        expect(paramTxId).toEqual(txId)
        return { fees, size }
      }),
    }

    const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos,
      insightClient,
    })
    const feePerKB = feeData.feePerKB
    const extraFee = getExtraFee({ asset, inputs: utxos, feePerKB, unconfirmedTxAncestor })
    const expectedExtraFee = (feePerKB.toBaseNumber() / 1e3 - fees / size) * size
    expect(extraFee).toBe(expectedExtraFee)
    expect(extraFee).toBe(6700)
  })

  test('getExtraFee exclude large unconfirmed txs', async () => {
    const txId = 'large'
    const utxos = UtxoCollection.fromArray(
      [{ address: Address.create('Address'), txId, value: '5 BTC' }],
      { currency: asset.currency }
    )
    const { fees, size } = { size: 10_000, fees: 1_000_000 }
    const insightClient = {
      fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
        expect(paramTxId).toEqual(txId)
        return { fees, size }
      }),
    }

    const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos,
      insightClient,
    })
    const feePerKB = feeData.feePerKB
    const extraFee = getExtraFee({ asset, inputs: utxos, feePerKB, unconfirmedTxAncestor })
    // unconfirmed is too big and excluded for cpfp
    expect(extraFee).toBe(0)
  })
})
