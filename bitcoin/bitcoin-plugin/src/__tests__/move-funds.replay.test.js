import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import path from 'path'

import assetPlugin from '../index.js'

jest.exodus.mock.fetchReplay()

const importSafeReportFile = path.join(import.meta.dirname, 'reports/unit-test-safe-report.json')

describe(`bitcoin move funds`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  class MoveFundsError extends Error {
    constructor(message, extra) {
      super(message)
      this.extra = extra
    }
  }

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 4,
    beforeEach: () => {
      // removes the random ouf of the taproot signature
      jest
        .spyOn(defaultEntropy, 'getSchnorrEntropy')
        .mockImplementation(() =>
          Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
        )
    },
    tests: {
      'can move from segwit to legacy': async ({ asset, assetClientInterface, getPrivateKey }) => {
        const assetName = asset.name
        const toAddress = '1Azpg7QEdQ8FHhNLzEpbpo1Uowh3t7B3Ex'

        const { privateKey, address: fromAddress } = await getPrivateKey({
          asset,
          purpose: 84,
          accountIndex: 1,
          chainIndex: 1,
          addressIndex: 2,
        })

        const insightClient = asset.insightClient
        const accountIndex = 1

        const rawUtxos = [
          {
            address: fromAddress,
            txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
            confirmations: 6048,
            value: 0.1,
            vout: 0,
            height: 765_218,
            script: '001491223b6a34a067a8ba0a8d3127090cd64a1b97b9',
            asset: undefined,
          },
        ]

        jest.spyOn(insightClient, 'broadcastTx').mockImplementation(() => true)
        jest.spyOn(insightClient, 'fetchUTXOs').mockImplementation(([address]) => {
          if (address === fromAddress) {
            return rawUtxos
          }

          return []
        })

        const prepareResult = await asset.api.moveFunds.prepareSendFundsTx({
          assetName,
          input: privateKey,
          assetClientInterface,
          toAddress,
          walletAccount: `exodus_${accountIndex}`,
          MoveFundsError,
        })
        expect(Object.keys(prepareResult)).toEqual([
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
          'utxos',
          'unsignedTx',
          'sizeKB',
          'privateKey',
        ])

        expect(prepareResult.fromAddress).toEqual(fromAddress)
        expect(prepareResult.toAddress).toEqual(toAddress)
        expect(prepareResult.fee.toBaseString({ unit: true })).toEqual('8296 satoshis')
        expect(prepareResult.amount.toBaseString({ unit: true })).toEqual('9991704 satoshis')
        expect(prepareResult.utxos.value.toBaseString({ unit: true })).toEqual('10000000 satoshis')
        expect(prepareResult.utxos.value.sub(prepareResult.fee)).toEqual(prepareResult.amount)
        expect(prepareResult.utxos.size).toEqual(rawUtxos.length)
        expect(prepareResult.privateKey).toEqual(privateKey)
        expect(prepareResult.sizeKB).toEqual(0.122)

        const sendFundsResult = await asset.api.moveFunds.sendFunds({
          assetName: asset.name,
          ...prepareResult,
        })

        expect(Object.keys(sendFundsResult)).toEqual([
          'txId',
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
        ])

        expect(sendFundsResult.txId).toEqual(
          '4d71a7ec4866ef7ccc40a574e6bd661a8219c0dffd1f507d8026039907d03cb5'
        )
        expect(sendFundsResult.fromAddress).toEqual(fromAddress)
        expect(sendFundsResult.toAddress).toEqual(toAddress)
        expect(sendFundsResult.fee).toEqual(prepareResult.fee)
        expect(sendFundsResult.amount).toEqual(prepareResult.amount)
        expect(insightClient.broadcastTx).toHaveBeenCalledTimes(1)
        expect(insightClient.broadcastTx).toBeCalledWith(
          '020000000001012ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000ffffffff0118769800000000001976a9146da8a36d9bad2762d037ef60f974df6fd4c7798c88ac024730440220314b5df40b935a4580583cf0ae1068a280cf24f37550e7f336c03701b0cef5db02202e0cd007ff97e9af9e8eace4ac0558acbf8ffec436c5f77048c7adb6f7a32cff012103822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a938093100000000'
        )
      },

      'can move from taproot to legacy': async ({ asset, assetClientInterface, getPrivateKey }) => {
        const toAddress = '1KS3LDX6BfkD1GGVDiVuB5WsER1SLPyGcc'

        const { privateKey, address: fromAddress } = await getPrivateKey({
          asset,
          purpose: 86,
          accountIndex: 1,
          chainIndex: 0,
          addressIndex: 0,
        })

        const insightClient = asset.insightClient
        const accountIndex = 0

        const rawUtxos = [
          {
            address: fromAddress,
            txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
            confirmations: 6048,
            value: 0.1,
            vout: 0,
            height: 765_218,
            script: '5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
            asset: undefined,
          },
        ]

        jest.spyOn(insightClient, 'broadcastTx').mockImplementation(() => true)
        jest.spyOn(insightClient, 'fetchUTXOs').mockImplementation(([address]) => {
          if (address === fromAddress) {
            return rawUtxos
          }

          return []
        })
        const prepareResult = await asset.api.moveFunds.prepareSendFundsTx({
          assetName: asset.name,
          input: privateKey,
          assetClientInterface,
          toAddress,
          walletAccount: `exodus_${accountIndex}`,
          MoveFundsError,
        })
        expect(Object.keys(prepareResult)).toEqual([
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
          'utxos',
          'unsignedTx',
          'sizeKB',
          'privateKey',
        ])

        expect(prepareResult.fromAddress).toEqual(fromAddress)
        expect(prepareResult.toAddress).toEqual(toAddress)
        expect(prepareResult.fee.toBaseString({ unit: true })).toEqual('7548 satoshis')
        expect(prepareResult.amount.toBaseString({ unit: true })).toEqual('9992452 satoshis')
        expect(prepareResult.utxos.value.toBaseString({ unit: true })).toEqual('10000000 satoshis')
        expect(prepareResult.utxos.value.sub(prepareResult.fee)).toEqual(prepareResult.amount)
        expect(prepareResult.utxos.size).toEqual(rawUtxos.length)
        expect(prepareResult.privateKey).toEqual(privateKey)
        expect(prepareResult.sizeKB).toEqual(0.111)

        const sendFundsResult = await asset.api.moveFunds.sendFunds({
          assetName: asset.name,
          ...prepareResult,
        })

        expect(Object.keys(sendFundsResult)).toEqual([
          'txId',
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
        ])

        expect(sendFundsResult.txId).toEqual(
          '8e54712bd6c16303dc89b652d87ba61da34fab17e37aac6bb7449dc9fc47f991'
        )
        expect(sendFundsResult.fromAddress).toEqual(fromAddress)
        expect(sendFundsResult.toAddress).toEqual(toAddress)
        expect(sendFundsResult.fee).toEqual(prepareResult.fee)
        expect(sendFundsResult.amount).toEqual(prepareResult.amount)
        expect(insightClient.broadcastTx).toHaveBeenCalledTimes(1)
        expect(insightClient.broadcastTx).toBeCalledWith(
          '020000000001012ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000ffffffff0104799800000000001976a914ca2e9bf684906245a62a50af0b4c92ad47c6f03d88ac01403cf28e0f3ad3bda2bc66979bb9f3f221e2eba59b910c6aaaaf5779927373279955b9dae3edbdd66bfa4b1dcb7dac795c61531c4e345ceceb07c1ae6390ccb3c900000000'
        )
      },

      'can move from legacy to segwit': async ({ asset, assetClientInterface, getPrivateKey }) => {
        const toAddress = 'bc1q3yt56war2meuc0jkp85y9ty58flkwf9nxmt2rk'

        const { privateKey, address: fromAddress } = await getPrivateKey({
          asset,
          purpose: 44,
          accountIndex: 1,
          chainIndex: 0,
          addressIndex: 1,
        })

        const insightClient = asset.insightClient
        const accountIndex = 0

        const rawUtxos = [
          {
            address: fromAddress,
            txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
            confirmations: 12_036,
            value: 0.0002,
            vout: 2,
            height: 759_232,
            script: '76a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac',
            asset: undefined,
          },
        ]

        const rawTxs = {
          '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db':
            '02000000000101ca9ca8b726f6b212056270e0bc746457a7aeefc1ebe0022d74c2e70a45ac6fa70000000000fdffffff03a08601000000000016001418d1c1c15e818969f10c3563723e25ca06cd99e51fdbef0200000000160014d55ed98cefa2cfd7bf1489e15311d586ea55dbda204e0000000000001976a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac02483045022100c432f274be60fd883e8840d1181c103b8ee3892a09f2c8b781f78cfec805d4f802207a3fba3aca4eecc247e3d6538b1d1b91cce185606416eec4ec33c3c0a7d385ea0121031447ea71d2d2172c0560bc52afa7f3e87fae66c18b22e832a205a5662063eb4b00000000',
        }

        jest.spyOn(insightClient, 'broadcastTx').mockImplementation(() => true)
        jest.spyOn(insightClient, 'fetchRawTx').mockImplementation(async (txId) => {
          expect(rawTxs[txId]).toBeDefined()
          return rawTxs[txId]
        })

        jest.spyOn(insightClient, 'fetchUTXOs').mockImplementation(([address]) => {
          if (address === fromAddress) {
            return rawUtxos
          }

          return []
        })
        const prepareResult = await asset.api.moveFunds.prepareSendFundsTx({
          assetName: asset.name,
          input: privateKey,
          assetClientInterface,
          toAddress,
          walletAccount: `exodus_${accountIndex}`,
          MoveFundsError,
        })
        expect(Object.keys(prepareResult)).toEqual([
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
          'utxos',
          'unsignedTx',
          'sizeKB',
          'privateKey',
        ])
        expect(prepareResult.fromAddress).toEqual(fromAddress)
        expect(prepareResult.toAddress).toEqual(toAddress)
        expect(prepareResult.fee.toBaseString({ unit: true })).toEqual('13668 satoshis')
        expect(prepareResult.amount.toBaseString({ unit: true })).toEqual('6332 satoshis')
        expect(prepareResult.utxos.value.toBaseString({ unit: true })).toEqual('20000 satoshis')
        expect(prepareResult.utxos.value.sub(prepareResult.fee)).toEqual(prepareResult.amount)
        expect(prepareResult.utxos.size).toEqual(rawUtxos.length)
        expect(prepareResult.privateKey).toEqual(privateKey)
        expect(prepareResult.sizeKB).toEqual(0.200_999_999_999_999_98)

        const sendFundsResult = await asset.api.moveFunds.sendFunds({
          assetName: asset.name,
          ...prepareResult,
        })

        expect(Object.keys(sendFundsResult)).toEqual([
          'txId',
          'fromAddress',
          'toAddress',
          'amount',
          'fee',
        ])

        expect(sendFundsResult.txId).toEqual(
          '7e4dc767ca0dbfeab3c3dc3269449e1062ad6bc15e208b7d43a6726a2ecfb77e'
        )
        expect(sendFundsResult.fromAddress).toEqual(fromAddress)
        expect(sendFundsResult.toAddress).toEqual(toAddress)
        expect(sendFundsResult.fee).toEqual(prepareResult.fee)
        expect(sendFundsResult.amount).toEqual(prepareResult.amount)

        expect(insightClient.broadcastTx).toHaveBeenCalledTimes(1)
        expect(insightClient.broadcastTx).toBeCalledWith(
          '0200000001db67754a57a2267bd68c6b6df0c10242f8aa9c3d038e5f1e4c84ced31a189620020000006a473044022061dc43e5aa15f716257bb5538771cb9bb872827f48c343d20ee6d2c8e970138302207f6ad29083d95bced68f64c46633d470892cab9154fad991b926674a56808adb012102fad2af50eac67b388a83a69c62d666675b1a9899e7f3a4f59fbb832e2cb6ea85ffffffff01bc1800000000000016001489174d3ba356f3cc3e5609e842ac943a7f6724b300000000'
        )
      },

      'cannot move 0': async ({ asset, assetClientInterface }) => {
        const toAddress = '1Azpg7QEdQ8FHhNLzEpbpo1Uowh3t7B3Ex'
        const input = 'KwFHiWMbL5X7oDQ9Cf24bX6zVrHStaGMu5h3omriuhXDA1Kujf6x'
        const insightClient = asset.insightClient

        jest.spyOn(insightClient, 'broadcastTx').mockImplementation(() => true)
        jest.spyOn(insightClient, 'fetchUTXOs').mockImplementation(([address]) => {
          return []
        })

        try {
          await asset.api.moveFunds.prepareSendFundsTx({
            assetName: asset.name,
            input,
            assetClientInterface,
            toAddress,
            walletAccount: 'exodus_0',
            MoveFundsError,
          })
          expect(true).toEqual(false)
        } catch (e) {
          expect(e.message).toEqual('balance-zero')
          expect(e.extra).toEqual({
            assetName: asset.name,
            fromAddress:
              '1Da2gQPyb7EQdiAYfuveAJ7vQxKQizFDDF, 3CaFGT9ntyqCgSD9m9SUCQs2B4bVLFxDwN, bc1q38s2x49tcl25tvg998t53kaaje3gyf5lzs56ul, or bc1pk765u7msse4mpj9zyrepqewdagk4qhrnkp5twq886rpr4t09vv3q7q6fpj',
            fromAddresses: [
              '1Da2gQPyb7EQdiAYfuveAJ7vQxKQizFDDF',
              '3CaFGT9ntyqCgSD9m9SUCQs2B4bVLFxDwN',
              'bc1q38s2x49tcl25tvg998t53kaaje3gyf5lzs56ul',
              'bc1pk765u7msse4mpj9zyrepqewdagk4qhrnkp5twq886rpr4t09vv3q7q6fpj',
            ],
          })
        }
      },

      'cannot move to own address': async ({ asset, assetClientInterface, getPrivateKey }) => {
        const accountIndex = 2

        const { privateKey, address: fromAddress } = await getPrivateKey({
          asset,
          purpose: 84,
          accountIndex,
          chainIndex: 0,
          addressIndex: 0,
        })

        const toAddress = fromAddress

        expect(toAddress).toEqual('bc1q80wm35xel29d2xd79e4uveudejwmh3jnecvnl4')

        const insightClient = asset.insightClient

        const rawUtxos = [
          {
            address: fromAddress,
            txId: 'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a',
            confirmations: 3590,
            value: 0.201,
            vout: 0,
            height: 767_664,
            script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
            asset: undefined,
          },
        ]

        jest.spyOn(insightClient, 'broadcastTx').mockImplementation(() => true)
        jest.spyOn(insightClient, 'fetchUTXOs').mockImplementation(([address]) => {
          if (address === fromAddress) {
            return rawUtxos
          }

          return []
        })

        try {
          await asset.api.moveFunds.prepareSendFundsTx({
            assetName: asset.name,
            input: privateKey,
            assetClientInterface,
            toAddress,
            walletAccount: `exodus_${accountIndex}`,
            MoveFundsError,
          })
          expect(true).toEqual(false)
        } catch (e) {
          expect(e.message).toEqual('private-key-own-key')
          expect(e.extra).toEqual({
            assetName: asset.name,
          })
        }
      },
    },
  })
})
