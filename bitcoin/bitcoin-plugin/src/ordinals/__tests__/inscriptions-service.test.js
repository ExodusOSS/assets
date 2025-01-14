import '@exodus/assets-testing/src/jest-to-be-buffer.js'

import { FeeData } from '@exodus/asset-lib'
import { createAccountState } from '@exodus/bitcoin-api'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import { asset as bitcoinMeta } from '@exodus/bitcoin-meta'
import { ECPair, networks } from '@exodus/bitcoinjs'
import { publicKeyToX } from '@exodus/crypto/secp256k1'
import { Address, UtxoCollection } from '@exodus/models'
import { Buffer } from 'buffer'
import { when } from 'jest-when'

import { inscriptionsServiceFactory } from '../inscriptions-service.js'

// removes the random ouf of the taproot signature
// note that the value is different from other places which have 1230.....0
jest
  .spyOn(defaultEntropy, 'getSchnorrEntropy')
  .mockImplementation(() =>
    Buffer.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex')
  )

const network = networks.bitcoin

const secret = 'fc7458de3d5616e7803fdc81d688b9642641be32fee74c4558ce680cac3d4111'
const privateKey = Buffer.from(secret, 'hex')

const keypair = ECPair.fromPrivateKey(privateKey, { network })

const publicKey = keypair.publicKey

const ordinalChainIndex = 2

const {
  createBrc20Inscription,
  createCommitTxData,
  createRevealTx,
  createTextInscription,
  broadcastInscription,
  estimateTxSize,
} = inscriptionsServiceFactory({ network, ordinalChainIndex })

test('validate keys', () => {
  expect(publicKey).toBeBuffer('03d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151')
  expect(publicKeyToX({ publicKey, format: 'buffer' })).toBeBuffer(
    'd734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151'
  )
  expect(privateKey).toBeBuffer('fc7458de3d5616e7803fdc81d688b9642641be32fee74c4558ce680cac3d4111')
})

test('createCommitTxData on text', () => {
  const inscription = createTextInscription({ text: 'Hello!!' })
  const commitTxData = createCommitTxData({ publicKey, inscription })

  expect(commitTxData).toEqual({
    cblock: 'c1d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151',
    script: [
      expect.toBeBuffer('d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151'),
      172,
      0,
      99,
      expect.toBeBuffer('6f7264'),
      1,
      1,
      expect.toBeBuffer('746578742f706c61696e3b636861727365743d7574662d38'),
      0,
      expect.toBeBuffer('48656c6c6f2121'),
      104,
    ],
    outputScript: expect.toBeBuffer(
      '20d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38000748656c6c6f212168'
    ),
    tapleaf: '13caa908fa38108fa21fcc47e99764ed5da8e579aed0a5af2c50c02257efeee9',
    tpubkey: 'a56d17d8e7c732e3721c21b1df3a0643c0e4260efb524d01bb0cce1ff4ca0766',
    revealAddress: 'bc1p54k30k88cuewxusuyxca7wsxg0qwgfswldfy6qdmpn8plax2qanq9wtlsw',
    scriptTaproot: expect.any(Object),
  })
})

test('createCommitTxData on brc20', () => {
  const inscription = createBrc20Inscription({
    op: 'deploy',
    tick: 'ordi',
    max: '21000000',
    lim: '1000',
  })
  const commitTxData = createCommitTxData({ publicKey, inscription })

  expect(commitTxData).toEqual({
    cblock: 'c0d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151',
    script: [
      expect.toBeBuffer('d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151'),
      172,
      0,
      99,
      expect.toBeBuffer('6f7264'),
      1,
      1,
      expect.toBeBuffer('746578742f706c61696e3b636861727365743d7574662d38'),
      0,
      expect.toBeBuffer(
        '7b2270223a226272632d3230222c226f70223a226465706c6f79222c227469636b223a226f726469222c226d6178223a223231303030303030222c226c696d223a2231303030227d'
      ),
      104,
    ],
    outputScript: expect.toBeBuffer(
      '20d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d3800487b2270223a226272632d3230222c226f70223a226465706c6f79222c227469636b223a226f726469222c226d6178223a223231303030303030222c226c696d223a2231303030227d68'
    ),
    // script: expect.any(Array),
    tapleaf: 'c02e35918fef0f88b30467d100eda06835cdbaeddf68e19147df68b75604760c',
    tpubkey: 'fc2401e05683d340a9c50be7411989a42bdc658a81a5433412ea508832c13215',
    revealAddress: 'bc1plsjqrczks0f5p2w9p0n5zxvf5s4acev2sxj5xdqjafggsvkpxg2sx6tdld',
    scriptTaproot: expect.any(Object),
  })
})

test('createRevealTx', async () => {
  const inscription = createTextInscription({ text: 'Hello!!' })
  const commitTxData = createCommitTxData({
    publicKey,
    inscription,
  })

  const toAddress = Address.create(
    'bc1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fq3y4x0q',
    {
      path: 'm/0/0',
    }
  )
  const padding = 549
  const txSize = 600 + Math.floor(inscription.content.length / 4)
  const feeRate = 2
  const minersFee = txSize * feeRate

  const requiredAmount = 550 + minersFee + padding

  expect(requiredAmount).toEqual(2301)

  const commitTxResult = {
    txId: 'd2e8358a8f6257ed6fc5eabe4e85951b702918a7a5d5b79a45e535e1d5d65fb2',
    sendUtxoIndex: 1,
    sendAmount: requiredAmount,
  }

  const revelRawTx = await createRevealTx({
    commitTxData,
    commitTxResult,
    toAddress,
    privateKey,
    amount: padding,
  })
  const rawTx =
    '02000000000101b25fd6d5e135e5459ab7d5a5a71829701b95854ebeeac56fed57628f8a35e8d20100000000ffffffff012502000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e920340e397d713d4832069e7a6794f62d23e7f7f8d8670aa1ebb72872ad8cb908a2575b2c71746f795bbfdba3e433e80b08ce1b5454cb2a349b25111c269b9f625cf8d4d20d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38000748656c6c6f21216821c1d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f15100000000'
  expect(revelRawTx).toEqual({
    inscriptionId: 'e79beb0fe7d1aaa6a1ffd589ad95f52c54b1137b9c6620f0fcc56631db8f020ci0',
    rawTx,
    script: '5120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92',
    txId: 'e79beb0fe7d1aaa6a1ffd589ad95f52c54b1137b9c6620f0fcc56631db8f020c',
    signature:
      'e397d713d4832069e7a6794f62d23e7f7f8d8670aa1ebb72872ad8cb908a2575b2c71746f795bbfdba3e433e80b08ce1b5454cb2a349b25111c269b9f625cf8d',
    value: 549,
    virtualSize: 139,
    vout: 0,
  })
})

test('broadcastInscription', async () => {
  const inscription = createTextInscription({ text: 'Hello!!' })

  const walletAccount = `exodus_0`

  const receiverWalletAccount = `exodus_1`

  const fromAddress = 'bc1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fq3y4x0q'
  const toAddress = 'bc1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gq7ygsk4'

  const asset = { ...bitcoinMeta, api: { sendTx: jest.fn(), broadcastTx: jest.fn() } }
  const assetClientInterface = {
    getAddress: jest.fn(),
    getFeeConfig: jest.fn(),
    getAccountState: jest.fn(),
    updateAccountState: jest.fn(),
  }

  when(assetClientInterface.getAddress)
    .calledWith({
      assetName: asset.name,
      purpose: 86,
      walletAccount,
      chainIndex: ordinalChainIndex,
      addressIndex: 0,
    })
    .mockReturnValue(Promise.resolve(Address.create(fromAddress, { path: 'm/0/0' })))

  when(assetClientInterface.getAddress)
    .calledWith({
      assetName: asset.name,
      purpose: 86,
      walletAccount: receiverWalletAccount,
      chainIndex: ordinalChainIndex,
      addressIndex: 0,
    })
    .mockReturnValue(Promise.resolve(Address.create(toAddress, { path: 'm/0/0' })))

  const accountStateClass = createAccountState({ asset, ordinalsEnabled: true, brc20Enabled: true })
  when(assetClientInterface.getAccountState)
    .calledWith({
      assetName: asset.name,
      walletAccount: receiverWalletAccount,
    })
    .mockReturnValue(Promise.resolve(accountStateClass.create()))

  const commitAmount = 12_780

  when(asset.api.sendTx)
    .calledWith({
      asset,
      walletAccount,
      address: expect.any(String),
      amount: expect.any(Object),
      options: { isRbfAllowed: false },
    })
    .mockReturnValue(
      Promise.resolve({
        txId: 'd2e8358a8f6257ed6fc5eabe4e85951b702918a7a5d5b79a45e535e1d5d65fb2',
        sendUtxoIndex: 1,
        sendAmount: commitAmount,
      })
    )

  const feeData = new FeeData({
    config: { feePerKB: '20000 satoshis' },
    mainKey: 'feePerKB',
    currency: asset.currency,
  })

  when(assetClientInterface.getFeeConfig)
    .calledWith({
      assetName: asset.name,
    })
    .mockReturnValue(Promise.resolve(feeData))

  const revealTx = await broadcastInscription({
    asset,
    walletAccount,
    receiverWalletAccount,
    assetClientInterface,
    inscription,
    privateKey,
  })
  const rawTx =
    '02000000000101b25fd6d5e135e5459ab7d5a5a71829701b95854ebeeac56fed57628f8a35e8d20100000000ffffffff011027000000000000225120dc14565953a3614caba75e42dedfbf94849ec2c8a2f06d5797e8e5a4f51c5e9003405b292abab45899c8db675028563904b8f8c11a392f9682b6f21e38dd0259f60ca0df8bc134377607fa71aca53520bf9b60f4a6580f3b336e77fbddd29cb640034d20d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38000748656c6c6f21216821c1d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f15100000000'

  const ordinalsUtxos = UtxoCollection.fromJSON(
    {
      bc1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gq7ygsk4: {
        address: 'bc1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gq7ygsk4',
        path: 'm/0/0',
        utxos: [
          {
            confirmations: 0,
            inscriptionIndexed: false,
            inscriptions: [
              {
                inscriptionId: '475dbed54a26bf92048d7ab031ced6303696d9aa55645f8989908994311aad6ai0',
                offset: 0,
              },
            ],
            rbfEnabled: false,
            script: '5120dc14565953a3614caba75e42dedfbf94849ec2c8a2f06d5797e8e5a4f51c5e90',
            txId: '475dbed54a26bf92048d7ab031ced6303696d9aa55645f8989908994311aad6a',
            value: '10000 satoshis',
            vout: 0,
          },
        ],
      },
    },
    { currency: asset.currency }
  )
  expect(assetClientInterface.updateAccountState).toBeCalledWith({
    assetName: asset.name,
    walletAccount: receiverWalletAccount,
    newData: {
      ordinalsUtxos,
    },
  })

  expect(asset.api.broadcastTx).toBeCalledWith(rawTx)

  expect(revealTx).toEqual({
    cblock: 'c1d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151',
    inscriptionId: '475dbed54a26bf92048d7ab031ced6303696d9aa55645f8989908994311aad6ai0',
    outputScript: expect.toBeBuffer(
      '20d734e09fc6ed105225ff316c6fa74f89096f90a437b1c7001af6d0b244d6f151ac0063036f7264010118746578742f706c61696e3b636861727365743d7574662d38000748656c6c6f212168'
    ),
    rawTx,
    revealAddress: 'bc1p54k30k88cuewxusuyxca7wsxg0qwgfswldfy6qdmpn8plax2qanq9wtlsw',
    script: expect.any(Array),
    scriptTaproot: expect.any(Object),
    signature:
      '5b292abab45899c8db675028563904b8f8c11a392f9682b6f21e38dd0259f60ca0df8bc134377607fa71aca53520bf9b60f4a6580f3b336e77fbddd29cb64003',

    tapleaf: '13caa908fa38108fa21fcc47e99764ed5da8e579aed0a5af2c50c02257efeee9',
    tpubkey: 'a56d17d8e7c732e3721c21b1df3a0643c0e4260efb524d01bb0cce1ff4ca0766',
    txId: '475dbed54a26bf92048d7ab031ced6303696d9aa55645f8989908994311aad6a',
    virtualSize: 139,
    value: 10_000,
    vout: 0,
  })
})

describe('estimate tx sizes', () => {
  const fixtures = [
    [createTextInscription({ text: 'a' }), 138],
    [createTextInscription({ text: 'ab' }), 138],
    [createTextInscription({ text: 'abc' }), 138],
    [createTextInscription({ text: 'Some Long text with funny characters 🌈' }), 148],
    [createTextInscription({ text: 'Hello!!' }), 139],
    [
      createBrc20Inscription({
        op: 'deploy',
        tick: 'ordi',
        max: '21000000',
        lim: '1000',
      }),
      156,
    ],
    [
      createBrc20Inscription({
        op: 'transfer',
        tick: 'ordi',
        amt: '1',
      }),
      151,
      createBrc20Inscription({
        op: 'transfer',
        tick: 'ordi',
        amt: '1.000000000001',
      }),
      151,
    ],
  ]

  fixtures.forEach(([inscription, size], i) => {
    test(`estimateTxSize ${i}`, () => {
      expect(estimateTxSize({ inscription })).toEqual(size)
    })
  })
})
