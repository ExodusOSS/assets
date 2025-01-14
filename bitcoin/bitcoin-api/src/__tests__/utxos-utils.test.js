import { asset } from '@exodus/bitcoin-meta'
import { Address, UtxoCollection } from '@exodus/models'

import {
  getInscriptionTxId,
  getTransferOrdinalsUtxos,
  getUsableUtxos,
  isValidInscription,
  mergeAdditionalInscriptions,
} from '../utxos-utils.js'

describe('isValidInscription', () => {
  test('return if inscriptions are valid or not', () => {
    expect(isValidInscription({ value: 5000, offset: 10 })).toBe(true)
    expect(isValidInscription({ value: 10_000_000, offset: 10 })).toBe(false)
    expect(isValidInscription({ value: 10_000_000, offset: 0 })).toBe(true)
  })
})

describe('getUsableUtxos', () => {
  test('do not return coinbase utxos below maturity height', () => {
    const utxos = [
      {},
      { isCoinbase: false },
      { isCoinbase: true, confirmations: 100 },
      { isCoinbase: true, confirmations: 99 },
      { isCoinbase: true, confirmations: 1 },
      { isCoinbase: true, confirmations: 0 },
    ]
    const usableUtxos = getUsableUtxos({ asset: {}, utxos, feeData: {}, txSet: {} })
    expect(usableUtxos).toStrictEqual([
      {},
      { isCoinbase: false },
      { isCoinbase: true, confirmations: 100 },
    ])
  })
})

describe('getTransferOrdinalsUtxos', () => {
  // Mock data setup

  const currency = asset.currency
  const ordinalsUtxos = UtxoCollection.fromArray(
    [
      {
        address: Address.create('address1'),
        txId: 'tx1',
        value: '0.00001 BTC',
        inscriptions: [
          { inscriptionId: '1i0', offset: 0 }, // mouse case image
          { inscriptionId: '1i1', offset: 0 }, // mouse case meta
        ],
      },
      {
        address: Address.create('address1'),
        txId: 'tx2',
        value: '0.001 BTC',
        inscriptions: [{ inscriptionId: '2i0', offset: 100 }],
      },
      {
        address: Address.create('address1'),
        txId: 'tx3',
        value: '0.1 BTC',
        inscriptions: [
          { inscriptionId: '3i0', offset: 0 },
          { inscriptionId: '4i0', offset: 100 },
          { inscriptionId: '5i0', offset: 2000 },
        ],
      },
    ],
    { currency }
  )

  test('filters UTXOs matching given inscription IDs', () => {
    // Adjust utxos to match mockInscriptionIds
    const inscriptionIds = ['1i0', '2i0']
    const result = getTransferOrdinalsUtxos({
      inscriptionIds,
      ordinalsUtxos,
    })
    expect(result.toJSON()).toEqual({
      address1: {
        address: 'address1',
        utxos: [
          {
            inscriptions: [
              {
                inscriptionId: '1i0',
                offset: 0,
              },
              {
                inscriptionId: '1i1',
                offset: 0,
              },
            ],
            txId: 'tx1',
            value: '0.00001 BTC',
          },
          {
            inscriptions: [
              {
                inscriptionId: '2i0',
                offset: 100,
              },
            ],
            txId: 'tx2',
            value: '0.001 BTC',
          },
        ],
      },
    })
  })

  test('raises when missing inscription', () => {
    const inscriptionIds = ['1i0', '2i0']
    expect(() =>
      getTransferOrdinalsUtxos({
        inscriptionIds,
        ordinalsUtxos: UtxoCollection.fromArray([], { currency }),
      })
    ).toThrow('Expected inscriptions 2. Found: 0')
  })

  test('raises when missing one inscription', () => {
    const inscriptionIds = ['1i0', '2i0', '10i0']
    expect(() =>
      getTransferOrdinalsUtxos({
        inscriptionIds,
        ordinalsUtxos,
      })
    ).toThrow('Expected inscriptions 3. Found: 2')
  })

  test('throws error when an unsafe inscription is included', () => {
    const inscriptionIds = ['1i0', '5i0']
    expect(() =>
      getTransferOrdinalsUtxos({
        inscriptionIds,
        ordinalsUtxos,
      })
    ).toThrow('The following inscriptions are unsafe 3i0 when 1i0,5i0 should be spent')
  })

  test('returns micky mouse case when multiple inscriptions for the same ordinal is included', () => {
    const inscriptionIds = ['1i1']
    const result = getTransferOrdinalsUtxos({
      inscriptionIds,
      ordinalsUtxos,
    })

    expect(result.toJSON()).toEqual({
      address1: {
        address: 'address1',
        utxos: [
          {
            inscriptions: [
              {
                inscriptionId: '1i0',
                offset: 0,
              },
              {
                inscriptionId: '1i1',
                offset: 0,
              },
            ],
            txId: 'tx1',
            value: '0.00001 BTC',
          },
        ],
      },
    })
  })

  test('returns the utxos to be spent when multiple in one utxo', () => {
    const inscriptionIds = ['1i0', '3i0', '5i0']
    expect(
      getTransferOrdinalsUtxos({
        inscriptionIds,
        ordinalsUtxos,
      }).toJSON()
    ).toEqual({
      address1: {
        address: 'address1',
        utxos: [
          {
            inscriptions: [
              {
                inscriptionId: '1i0',
                offset: 0,
              },
              {
                inscriptionId: '1i1',
                offset: 0,
              },
            ],
            txId: 'tx1',
            value: '0.00001 BTC',
          },
          {
            inscriptions: [
              {
                inscriptionId: '3i0',
                offset: 0,
              },
              {
                inscriptionId: '4i0',
                offset: 100,
              },
              {
                inscriptionId: '5i0',
                offset: 2000,
              },
            ],
            txId: 'tx3',
            value: '0.1 BTC',
          },
        ],
      },
    })
  })
})

test('getInscriptionTxId', () => {
  expect(
    getInscriptionTxId('862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30ci0')
  ).toEqual('862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30c')

  expect(
    getInscriptionTxId('862ecd0fe343da32d19ff9277639ff71e10d894f055b6dee82dbfb9c158d5d30ci22')
  ).toEqual('862ecd0fe343da32d19ff9277639ff71e10d894f055b6dee82dbfb9c158d5d30c')
  expect(
    getInscriptionTxId('862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30c')
  ).toEqual('862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30c')
})

describe('mergeAdditionalInscriptions', () => {
  const currency = asset.currency
  const allUtxos = UtxoCollection.fromArray(
    [
      {
        address: Address.create('address1'),
        txId: 'tx1',
        vout: 0,
        value: '0.00000001 BTC',
        inscriptions: [{ inscriptionId: '1i0', offset: 0 }],
      },
      {
        address: Address.create('address1'),
        txId: 'tx2',
        vout: 1,
        value: '0.00000002 BTC',
      },
      {
        address: Address.create('address1'),
        txId: 'tx3',
        vout: 0,
        value: '0.00000003 BTC',
        inscriptions: [{ inscriptionId: '3i0', offset: 0 }],
      },
    ],
    { currency }
  )

  test('when empty addition inscriptions', () => {
    const additionalInscriptions = []
    expect(mergeAdditionalInscriptions({ allUtxos, additionalInscriptions }).toJSON()).toEqual({
      address1: {
        address: 'address1',
        utxos: [
          {
            inscriptions: [
              {
                inscriptionId: '1i0',
                offset: 0,
              },
            ],
            txId: 'tx1',
            value: '0.00000001 BTC',
            vout: 0,
          },
          {
            txId: 'tx2',
            value: '0.00000002 BTC',
            vout: 1,
          },
          {
            inscriptions: [
              {
                inscriptionId: '3i0',
                offset: 0,
              },
            ],
            txId: 'tx3',
            value: '0.00000003 BTC',
            vout: 0,
          },
        ],
      },
    })
  })

  test('when multiple addition inscriptions', () => {
    const additionalInscriptions = [
      {
        // duplicated
        inscriptionId: '1i0',
        txId: 'tx1',
        vout: 0,
      },
      {
        // utxo does not exist, different vout
        inscriptionId: 'Ai0',
        txId: 'txA',
        vout: 1,
      },
      {
        // to be added, first inscription
        inscriptionId: 'Bi0',
        txId: 'tx2',
        vout: 1,
      },
      {
        /// no utxo tx
        inscriptionId: 'Ci0',
        txId: 'txX',
        vout: 0,
      },
      {
        // to be added, custom offset
        inscriptionId: 'Ci0',
        txId: 'tx3',
        vout: 0,
        offset: 100,
      },
    ]
    expect(mergeAdditionalInscriptions({ allUtxos, additionalInscriptions }).toJSON()).toEqual({
      address1: {
        address: 'address1',
        utxos: [
          {
            inscriptions: [
              {
                inscriptionId: '1i0',
                offset: 0,
              },
            ],
            txId: 'tx1',
            value: '0.00000001 BTC',
            vout: 0,
          },
          {
            inscriptions: [
              {
                inscriptionId: 'Bi0',
                offset: 0,
              },
            ],
            txId: 'tx2',
            value: '0.00000002 BTC',
            vout: 1,
          },
          {
            inscriptions: [
              {
                inscriptionId: '3i0',
                offset: 0,
              },
              {
                inscriptionId: 'Ci0',
                offset: 100,
              },
            ],
            txId: 'tx3',
            value: '0.00000003 BTC',
            vout: 0,
          },
        ],
      },
    })
  })
})
