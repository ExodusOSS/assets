import BIP32 from '@exodus/bip32'
import { FINAL_SEQUENCE, RBF_SEQUENCE } from '@exodus/bitcoin-lib'
import { Transaction } from '@exodus/bitcoinjs'
import lodash from 'lodash'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const { cloneDeep } = lodash

const asset = assetPlugin.createAsset({ assetClientInterface })

const createHdKey = (xpriv) => BIP32.fromXPriv(xpriv)

const fixtures = {
  accountFixture:
    'xprv9ysniBuk7BcZWMiPKvm9md3NnQi2XVV3XEQfNzsmMrZu4ksDXfiMD5ixiK4FZzS9ioPQxQfGqzEN8oA4fDKUiEML5UsfibQZi8Mr7Yxj6F5',
  accountFixture84:
    'xprv9z3nXnHr3bvnFtVrHcVoASn5K3dDKCEVnqHoQ2zaAPKbcN9Nf7Tto8W4H2ygzvLKZ9cTRjxERpDybzBk5XJBjFcn4nfs3v1R8hadbuKaYkB',
  accountFixture86:
    'xprv9zWgX6DKmGDe5AVhZYfgtorgxZfdUecw52Z3hgSm4YQyxqXdNJJQ7PrDBuvRJ9zBaEHGPxqQmpByPUhf6QP9xLRQ6KuTxVvXC53LtunxZ7c',
}

const hdKey = createHdKey(fixtures.accountFixture)
const hdKey84 = createHdKey(fixtures.accountFixture84)
const hdKey86 = createHdKey(fixtures.accountFixture86)

const createBitcoinSignedTransaction = asset.api.signTx

// Ported from desktop!

const unsignedTx = {
  txData: {
    inputs: [
      {
        txId: '2c6ec07fb117d2950b88ce6edec09c432d22878487841e76f001bedfd51c17a0', // P2PKH
        vout: 0,
        address: '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT',
        value: 1_913_796,
        sequence: FINAL_SEQUENCE,
      },
      {
        txId: '2568a15c1cf8c9eaa30ab2d3c688ef790f73a319569017b75b530e64a27712a0', // P2WPKH
        vout: 0,
        address: 'bc1qdz34y5kjwj5ej0rv5528mwjl49ufkl098l2gd9',
        value: 10_000_000,
        script: '001468a35252d274a9993c6ca5147dba5fa9789b7de5',
        sequence: RBF_SEQUENCE,
      },
    ],
    outputs: [
      ['15oHUdk7k5N6uNb7d3JdbA7qfhph4n6bK6', 2_100_000],
      ['bc1qv3ptd9qzv87klf34wnxxpmhlqgwu6fvp9q26yd', 8_998_000],
    ],
  },
  txMeta: {
    assetName: 'bitcoin',
    addressPathsMap: {
      '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT': 'm/0/0',
      bc1qdz34y5kjwj5ej0rv5528mwjl49ufkl098l2gd9: 'm/1/1',
    },
    rawTxs: [
      {
        txId: '2c6ec07fb117d2950b88ce6edec09c432d22878487841e76f001bedfd51c17a0',
        rawData:
          '01000000017e879a21dd0243d0a02bbb43a05332f59444df6ae69b37a1edd9b0477e40403f000000006a473044022013afbe1cb93e44ea15f119ab43251945b579599b6d82f9488c9e39a6a685d39702202313e215a94b3ddaba6c1fbc01aa22cb13c5db97a2a3651b850767990e93669e01210233a3643aea86194871d2ba38db890f3bd42bcc9b709e7eef7afaa9f467e74f91ffffffff02c4331d00000000001976a914147d4d251f681599fbea7884ac4021cff378524a88ac7cc67a00000000001976a9140bd42e2594a41443bcc963a1ef9135c4147a3f5588ac00000000',
      },
      {
        txId: '2568a15c1cf8c9eaa30ab2d3c688ef790f73a319569017b75b530e64a27712a0',
        rawData: '01', // can't find the raw data for this tx, since it was replaced, but we can replace it with a dummy value
      },
    ],
    replayProtect: {},
    hasChange: true,
  },
}

test('create replaceable SignedTransaction for bitcoin ', async () => {
  const { rawTx } = await createBitcoinSignedTransaction({
    unsignedTx,
    hdkeys: { 44: hdKey, 84: hdKey84 },
  })

  const { ins, outs } = Transaction.fromBuffer(rawTx)

  ins.forEach(({ sequence }, index) => {
    const { sequence: uSequence } = unsignedTx.txData.inputs[index]
    expect(uSequence).toEqual(sequence)
  })

  outs.forEach(({ value }, index) => {
    const [, uValue] = unsignedTx.txData.outputs[index]
    expect(uValue).toEqual(value)
  })
  expect(ins[1].sequence).toBe(RBF_SEQUENCE)
})

test('non-witness output requires the full previous transaction', async () => {
  const tx = cloneDeep(unsignedTx)
  tx.txMeta.rawTxs = [tx.txMeta.rawTxs[1]]
  try {
    await createBitcoinSignedTransaction({ unsignedTx: tx, hdkeys: { 44: hdKey, 84: hdKey84 } })
    expect('Expected exception "Non-taproot outputs require the full previous transaction"').toBe(
      true
    )
  } catch (err) {
    expect(err.message).toEqual('Non-taproot outputs require the full previous transaction.')
  }
})

test('spend from P2SH-P2WPKH using privateKeysAddressMap', async () => {
  const tx = cloneDeep(unsignedTx)
  const p2shAddress = '3JBEtYcWsH6kfLxkKxAgnScxSWHTWaVFJa'
  tx.txData.inputs[0].address = p2shAddress

  const privateKeysAddressMap = {
    [p2shAddress]: asset.keys.encodePrivate(hdKey.derive('m/0/0').privateKey),
    bc1qdz34y5kjwj5ej0rv5528mwjl49ufkl098l2gd9: asset.keys.encodePrivate(
      hdKey84.derive('m/1/1').privateKey
    ),
  }

  const { txId, rawTx } = await createBitcoinSignedTransaction({
    unsignedTx: tx,
    privateKeysAddressMap,
  })

  const { ins } = Transaction.fromBuffer(rawTx)
  const p2shInput = ins[0]

  expect(txId.toString('hex')).toBe(
    '3a0e3c9e76cf8aed93c1f5a5f212a7de6e88452d125a0bf7aa7aa92d8b18697c'
  )
  expect(p2shInput.witness[0].toString('hex')).toBe(
    '30440220013ecaaa22220e32f024fc0537db877e7897dd3ee72d5a258b056843a4fb525a02201bf51913a87f3629fb1ae479bcd071ec4a45e0a932b99bc151b11da2a5ae3c7701'
  )
  expect(p2shInput.witness[1].toString('hex')).toBe(
    '027135776e6628b3da577e6775193bc219ac054034eda1041138313bc1b4f1110d'
  )
})

test('spend from P2SH-P2WPKH using hdkeys', async () => {
  const tx = cloneDeep(unsignedTx)
  const p2shAddress = '3JBEtYcWsH6kfLxkKxAgnScxSWHTWaVFJa'
  tx.txData.inputs[0].address = p2shAddress
  tx.txMeta.addressPathsMap[p2shAddress] = 'm/0/0'

  const { txId, rawTx } = await createBitcoinSignedTransaction({
    unsignedTx: tx,
    hdkeys: { 44: hdKey, 49: hdKey, 84: hdKey84, 86: hdKey86 }, // Test is coming from desktop and it picked 44 as the purpose when addresses was 3J...
  })

  const { ins } = Transaction.fromBuffer(rawTx)
  const p2shInput = ins[0]

  expect(txId.toString('hex')).toBe(
    '3a0e3c9e76cf8aed93c1f5a5f212a7de6e88452d125a0bf7aa7aa92d8b18697c'
  )
  expect(p2shInput.witness[0].toString('hex')).toBe(
    '30440220013ecaaa22220e32f024fc0537db877e7897dd3ee72d5a258b056843a4fb525a02201bf51913a87f3629fb1ae479bcd071ec4a45e0a932b99bc151b11da2a5ae3c7701'
  )
  expect(p2shInput.witness[1].toString('hex')).toBe(
    '027135776e6628b3da577e6775193bc219ac054034eda1041138313bc1b4f1110d'
  )
})

test('spend from P2TR', async () => {
  const tx = cloneDeep(unsignedTx)
  const p2trAddress = 'bc1p3efq8ujsj0qr5xvms7mv89p8cz0crqdtuxe9ms6grqgxc9sgsntslthf6w'
  tx.txData.inputs.push({
    txId: 'f633a68122e25dc2a8d3e223a5d49f914a70015db654a4d2f7885c5c4299bf5c',
    vout: 0,
    address: p2trAddress,
    value: 22_961,
    script: '51208e5203f25093c03a199b87b6c39427c09f8181abe1b25dc34818106c160884d7',
    sequence: FINAL_SEQUENCE,
  })
  tx.txMeta.addressPathsMap[p2trAddress] = 'm/0/2'

  const { txId, rawTx } = await createBitcoinSignedTransaction({
    unsignedTx: tx,
    hdkeys: { 44: hdKey, 84: hdKey84, 86: hdKey86 },
  })
  expect(txId.toString('hex')).toEqual(
    '71fbc69242791e904a0aa9df3c71ad89e4ec7841d50d7852c992a2f385b08769'
  )

  const { ins } = Transaction.fromBuffer(rawTx)
  const p2trInput = ins[2]
  expect(p2trInput.witness.length).toEqual(1)
  expect(p2trInput.witness[0].length).toEqual(64)
})
