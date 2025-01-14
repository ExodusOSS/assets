import { createGetAddress } from '@exodus/assets-testing'
import { parseUnsignedTxFactory } from '@exodus/bitcoin-api/src/parse-unsigned-tx.js'

import assetPlugin from '../index.js'
import loadFixture from './load-fixture.cjs'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const unsignedTxBtcLike = loadFixture('unsigned-btclike-desktop')
const asset = assetPlugin.createAsset({ assetClientInterface })

test('recover info from unsigned tx (btcLike)', async () => {
  const rawTxs = [
    '0100000000010114b768c2e90af7a154c2addf38cb8645991dd507fa62c798164187ba20f67b2e0000000000ffffffff023891000000000000160014dfa8a78ed7255215529e52dfcf03eac49fc5e11dd09200000000000016001470d7aff24e0c461fad4118d38d69c2c2ad0e2eea02483045022100ee8c8bc265e7cd66d28af875590fc813747c631bff508774ff30f6b1f42b69ac02200d4f87295cae2591225d71debc8fd80a47db54b46b5bfa35850e412d42ba6661012102945e55d2f1e78c95257e9d17f9d8a548ca47c31edb0c6a874c8fb324cc3220d000000000',
    '020000000001015ad0950feac98862f4d89028582b669ea49d9b028fcc17858e1ba9ef34ceb1960300000000ffffffff07a51c09000000000016001470d7aff24e0c461fad4118d38d69c2c2ad0e2eea23062500000000001976a9145018b5d2498444addfdccdd9fe692cf4eec2dc1d88acf01202000000000017a914708885e0c0b9de2975f8f9f564ec2b539a86163c8788850500000000001600142766b9e0f2c185c7e0b90c5963766fefbf37490b7ac608000000000017a914e204b2b4be235998a37c6b25d71f6353552c150387bea3060000000000160014ff0a9ed66383d0413903f9a40d1e9e47291101e3ac40a91f0000000016001483c365d654cfb273770dd1e25147c2c4e9c17f26024730440220361bd753c256237a90ed30530994dc35e0a8ab135d22bbfac601c0bb26745618022007c6d3bf110802218671424c2d4ccc8be41ce821f104642729b8d19cab8b405f0121034908ea0aebaf46b223e1789af24bbc22236101678b88fb38db3ba5d6441cf7df00000000',
  ]

  asset.baseAsset = asset
  asset.baseAsset.insightClient = {
    fetchRawTx: jest.fn(async (txId) => {
      if (txId === unsignedTxBtcLike.txData.inputs[0].txId) return rawTxs[0]
      if (txId === unsignedTxBtcLike.txData.inputs[1].txId) return rawTxs[1]
      expect(`Unknown txId ${txId}`).toEqual(false)
    }),
  }

  const summary = await parseUnsignedTxFactory()({
    asset,
    unsignedTx: unsignedTxBtcLike,
    getAddress: createGetAddress(unsignedTxBtcLike),
  })

  const toNumberUnit = (value) => asset.currency.defaultUnit(value)

  expect(summary).toEqual({
    asset,
    amount: toNumberUnit('0.00313866'),
    changeAddress: 'bc1qu0lc37p9nlh8a5u8qhp0aaj0y204rg979pe0am',
    changeAmount: toNumberUnit('0.00314251'),
    fee: toNumberUnit('0.00006624'),
    from: ['bc1qwrt6lujwp3rplt2prrfc66wzc2ksuth2u5yzye'],
    to: 'bc1qm7520rkhy4fp25572t0u7ql2cj0utcga8nddxp',
  })

  expect(asset.baseAsset.insightClient.fetchRawTx).toBeCalledWith(
    unsignedTxBtcLike.txData.inputs[0].txId
  )
  expect(asset.baseAsset.insightClient.fetchRawTx).toBeCalledWith(
    unsignedTxBtcLike.txData.inputs[1].txId
  )
})
