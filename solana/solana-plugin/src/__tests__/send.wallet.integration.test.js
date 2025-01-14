import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import path from 'path'

import assetPlugin from '../index.js'

describe(`solana send transfer integration test`, () => {
  const mockedMessage = "I didn't really broadcast"

  const shouldBroadcast = false // true this if you really want to send a transfer

  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    importSafeReportFile: path.join(import.meta.dirname, 'solana-private-seed-safe-report.json'),
    expectedAddresses: {
      solana_44_exodus_0_0_0: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
      solana_44_exodus_1_0_0: 'FegJauRKyricstvwpXuNkrG4GTzbJt5n6qiUdnhmH7rR',
      solana_44_exodus_2_0_0: 'FMMV9fFrquxt5WXvzB5YzpEyg7WqB9DYy5siAANFnqAt',
    },
    beforeEach: ({ asset }) => {
      const broadcastTx = jest.spyOn(asset.api, 'broadcastTx')

      // if you really runs this, remember to update the monitor integration test and safe report
      if (!shouldBroadcast) {
        broadcastTx.mockImplementation(() => {
          return Promise.resolve({ mockedMessage })
        })
      }
    },
    tests: {
      'Send all integration test': async (deps) => {
        const { asset, assetClientInterface, fees: feesModule } = deps
        const walletAccount = 'exodus_0'

        const spendableBalance = asset.currency.parse('0.023392651 SOL')
        const defaultFee = asset.currency.parse('0.000005 SOL')

        // sending to self
        const fromAddress = await assetClientInterface.getReceiveAddress({
          walletAccount,
          assetName: asset.name,
        })

        const accountState = await assetClientInterface.getAccountState({
          walletAccount,
          assetName: asset.name,
        })

        const balances = asset.api.getBalances({ asset, accountState })

        expect(balances.spendable.toDefaultString({ unit: true })).toEqual(
          spendableBalance.toDefaultString({ unit: true })
        )

        expect(asset.api.broadcastTx).not.toBeCalled()

        const amount = spendableBalance.sub(defaultFee)

        const fees = await feesModule.getFees({
          assetName: asset.name,
          toAddress: fromAddress,
          fromAddress,
          isSendAll: true,
          amount,
        })

        expect(fees.priorityFee).toEqual(1_000_000)
        expect(fees.fee.toDefaultString({ unit: true })).toEqual(
          defaultFee.toDefaultString({ unit: true })
        )
        expect(amount.toDefaultString({ unit: true })).toEqual(
          balances.spendable.sub(fees.fee).toDefaultString({ unit: true })
        )

        const result = await asset.api.sendTx(
          {
            asset,
            walletAccount,
            address: fromAddress,
            amount,
            options: { ...fees, feeAmount: fees.fee },
          },
          { assetClientInterface }
        )

        expect(asset.api.broadcastTx).toBeCalled()
        if (shouldBroadcast) {
          console.log(result)
        } else {
          expect(result.txId).toBeDefined()
        }
      },

      'Send NFT integration test tokenStandard 4': async (deps) => {
        const { asset, assetClientInterface, fees: feesModule } = deps
        const walletAccount = 'exodus_0'

        // sending to self
        const fromAddress = await assetClientInterface.getReceiveAddress({
          walletAccount,
          assetName: asset.name,
        })

        const accountState = await assetClientInterface.getAccountState({
          walletAccount,
          assetName: asset.name,
        })
        const balances = asset.api.getBalances({ asset, accountState })

        expect(balances.spendable.toDefaultString({ unit: true })).toEqual('0.023392651 SOL')

        expect(asset.api.broadcastTx).not.toBeCalled()

        const amount = asset.currency.baseUnit(1)

        const fees = await feesModule.getFees({
          assetName: asset.name,
          toAddress: fromAddress,
          fromAddress,
          isSendAll: true,
          amount,
        })

        expect(fees.priorityFee).toEqual(1_000_000)
        expect(fees.fee.toDefaultString({ unit: true })).toEqual('0.000005 SOL')

        const nft = {
          tokenStandard: 4,
          mintAddress: '7nh6EvZUtVP4oPc9shyjLMmprfg5huKuvTUm8Xfejs8E',
        }

        const result = await asset.api.sendTx(
          {
            asset,
            walletAccount,
            address: fromAddress,
            amount,
            options: {
              ...fees,
              feeAmount: fees.fee,
              nft,
            },
          },
          { assetClientInterface }
        )

        expect(asset.api.broadcastTx).toBeCalled()
        if (shouldBroadcast) {
          console.log(result)
        } else {
          expect(result.txId).toBeDefined()
        }
      },
    },
  })
})
