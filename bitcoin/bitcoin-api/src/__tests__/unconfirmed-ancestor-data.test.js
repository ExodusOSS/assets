import { asset } from '@exodus/bitcoin-meta'
import { UnitType } from '@exodus/currency'
import { Address, UtxoCollection } from '@exodus/models'

import {
  getUnconfirmedTxAncestorMap,
  resolveExtraFeeOfTx,
  resolveUnconfirmedAncestorData,
} from '../unconfirmed-ancestor-data.js'

describe('unconfirmed-ancestor-data tests ', () => {
  const txId1 = 'txId1'
  const txId2 = 'txId2'
  const insightClient = {
    fetchUnconfirmedAncestorData: jest.fn(async (paramTxId) => {
      if (paramTxId === txId1) {
        return { size: 2, fees: 10 }
      }

      if (paramTxId === txId2) {
        return { size: 3, fees: 11 }
      }

      return {
        size: 0,
        fees: 0,
      }
    }),
  }

  test('should resolve resolveExtraFeeOfTx after updating data ', async () => {
    const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: UtxoCollection.fromArray(
        [{ address: Address.create('Address'), txId: txId1, value: '5 BTC' }],
        { currency: asset.currency }
      ),
      insightClient,
    })

    expect(resolveExtraFeeOfTx({ txId: txId1, feeRate: 1, unconfirmedTxAncestor })).toEqual(0)
    expect(resolveExtraFeeOfTx({ txId: txId1, feeRate: 2, unconfirmedTxAncestor })).toEqual(0)
    expect(resolveExtraFeeOfTx({ txId: txId1, feeRate: 7, unconfirmedTxAncestor })).toEqual(4)
    expect(resolveExtraFeeOfTx({ txId: txId1, feeRate: 10, unconfirmedTxAncestor })).toEqual(10)
    expect(resolveExtraFeeOfTx({ txId: txId1, feeRate: 100_000, unconfirmedTxAncestor })).toEqual(
      199_990
    )
    expect(
      resolveExtraFeeOfTx({ txId: txId1, feeRate: 100_000_000_000, unconfirmedTxAncestor })
    ).toEqual(199_999_999_990)
    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
  })

  test('should resolve resolveExtraFeeOfTx even after updating another asset', async () => {
    const anotherAsset = {
      name: 'fercoin',
      currency: UnitType.create({
        base: 0,
        FER: 8,
      }),
    }

    // Setup
    const accountStates = {
      [asset.name]: {
        utxos: UtxoCollection.fromArray(
          [{ address: Address.create('Address'), txId: txId1, value: '5 BTC' }],
          { currency: asset.currency }
        ),
        mem: {
          unconfirmedTxAncestor: {},
        },
      },
      [anotherAsset.name]: {
        utxos: UtxoCollection.fromArray(
          [{ address: Address.create('Address'), txId: txId2, value: '5 FER' }],
          { currency: anotherAsset.currency }
        ),
        mem: {
          unconfirmedTxAncestor: {},
        },
      },
    }

    accountStates[asset.name].mem.unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: accountStates[asset.name].utxos,
      insightClient,
    })
    accountStates[anotherAsset.name].mem.unconfirmedTxAncestor =
      await resolveUnconfirmedAncestorData({
        insightClient,
        utxos: accountStates[anotherAsset.name].utxos,
      })

    const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({
      accountState: accountStates[asset.name],
    })
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 1,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 2,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 7,
        unconfirmedTxAncestor,
      })
    ).toEqual(4)
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 10,
        unconfirmedTxAncestor,
      })
    ).toEqual(10)
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 100_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(199_990)
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(199_999_999_990)
    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)

    const unconfirmedTxAncestorOfAnotherAsset = getUnconfirmedTxAncestorMap({
      accountState: accountStates[anotherAsset.name],
    })
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 1,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(0)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 2,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(0)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 7,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(10)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 10,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(19)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 100_000,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(299_989)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: txId2,
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(299_999_999_989)
    expect(
      resolveExtraFeeOfTx({
        assetName: anotherAsset.name,
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor: unconfirmedTxAncestorOfAnotherAsset,
      })
    ).toEqual(0)
  })

  test('should resolve 0 after confirmations > 0 ', async () => {
    let accountState = {
      utxos: UtxoCollection.fromArray(
        [{ address: Address.create('Address'), txId: txId1, value: '5 BTC' }],
        { currency: asset.currency }
      ),
      mem: {},
    }

    let unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: accountState.utxos,
      insightClient,
    })
    accountState.mem = { unconfirmedTxAncestor }

    expect(
      resolveExtraFeeOfTx({ txId: txId1, feeRate: 100_000_000_000, unconfirmedTxAncestor })
    ).toEqual(199_999_999_990)
    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)

    accountState = {
      utxos: UtxoCollection.fromArray(
        [{ address: Address.create('Address'), txId: txId1, value: '5 BTC', confirmations: 2 }], // removed due confirmation
        { currency: asset.currency }
      ),
    }
    unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: accountState.utxos,
      insightClient,
    })

    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
  })

  test('should resolveExtraFeeOfTx because updating another wallet', async () => {
    const accountStates = {
      myWallet: {
        utxos: UtxoCollection.fromArray(
          [{ address: Address.create('Address'), txId: txId1, value: '5 BTC' }],
          { currency: asset.currency }
        ),
      },
      anotherWallet: {
        utxos: UtxoCollection.fromArray(
          [
            {
              address: Address.create('Address'),
              txId: 'anotherTxId',
              value: '1 BTC',
            },
          ], // removed due confirmation
          { currency: asset.currency }
        ),
      },
    }

    const unconfirmedTxAncestor = await resolveUnconfirmedAncestorData({
      utxos: accountStates.myWallet.utxos,
      insightClient,
    })
    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(199_999_999_990)
    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)

    await resolveUnconfirmedAncestorData({
      utxos: accountStates.anotherWallet.utxos,
      insightClient,
    })

    expect(
      resolveExtraFeeOfTx({
        txId: txId1,
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(199_999_999_990)

    expect(
      resolveExtraFeeOfTx({
        txId: 'invalid',
        feeRate: 100_000_000_000,
        unconfirmedTxAncestor,
      })
    ).toEqual(0)
  })
})
