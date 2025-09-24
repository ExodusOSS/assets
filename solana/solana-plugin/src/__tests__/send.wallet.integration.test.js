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

  const assertTxResult = async ({ result, assetClientInterface, asset, walletAccount }) => {
    if (shouldBroadcast) {
      console.log(result)
    } else {
      expect(result.txId).toBeDefined()
      const txLogs = await assetClientInterface.getTxLog({
        assetName: asset.name,
        walletAccount,
      })
      const txItem = txLogs.get(result.txId).toJSON()
      txItem.date = 'NOW'
      txItem.txId = 'SOME_TX_ID'
      expect(txItem).toMatchSnapshot()

      if (asset.name !== asset.baseAsset.name) {
        const txLogs = await assetClientInterface.getTxLog({
          assetName: asset.baseAsset.name,
          walletAccount,
        })
        const txItem = txLogs.get(result.txId).toJSON()
        txItem.date = 'NOW'
        txItem.txId = 'SOME_TX_ID'
        expect(txItem).toMatchSnapshot()
      }
    }
  }

  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    assetConfig: {
      allowSendingAll: true,
    },
    importSafeReportFile: path.join(import.meta.dirname, 'solana-private-seed-safe-report.json'),
    expectedAddresses: {
      solana_44_exodus_0_0_0: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
      solana_44_exodus_1_0_0: 'FegJauRKyricstvwpXuNkrG4GTzbJt5n6qiUdnhmH7rR',
      solana_44_exodus_2_0_0: 'FMMV9fFrquxt5WXvzB5YzpEyg7WqB9DYy5siAANFnqAt',
    },
    beforeEach: ({ asset }) => {
      const broadcastTx = jest.spyOn(asset.api, 'broadcastTx')
      jest.spyOn(asset.api, 'signTx')

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

        const spendableBalance = asset.currency.parse('0.024283533 SOL')

        // sending to self
        const fromAddress = await assetClientInterface.getReceiveAddress({
          walletAccount,
          assetName: asset.name,
        })

        const accountState = await assetClientInterface.getAccountState({
          walletAccount,
          assetName: asset.name,
        })

        const expectedFee = asset.currency.parse('0.00000545 SOL')

        const balances = asset.api.getBalances({ asset, accountState })

        expect(balances.spendable.toDefaultString({ unit: true })).toEqual(
          spendableBalance.toDefaultString({ unit: true })
        )

        expect(asset.api.broadcastTx).not.toBeCalled()

        const amount = spendableBalance.sub(expectedFee)
        const fees = await feesModule.getFees({
          assetName: asset.name,
          toAddress: fromAddress,
          fromAddress,
          walletAccount,
          isSendAll: true,
          amount,
        })

        const expectedUnsignedTx = {
          txData: {
            amount: 24_278_083,
            computeUnits: 450,
            expectedTakerAmount: null,
            fee: null,
            fixedFee: null,
            from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            priorityFee: 1_000_000,
            recentBlockhash: expect.any(String),
            takerAmount: null,
            to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          },
          txMeta: {
            assetName: 'solana',
            fee: 5450,
            stakingParams: {},
            useFeePayer: false,
            usedFeePayer: false,
          },
        }
        expect(fees.unsignedTx).toEqual(expectedUnsignedTx)
        expect(fees.fee.toDefaultString({ unit: true })).toEqual(
          expectedFee.toDefaultString({ unit: true })
        )
        expect(amount.toDefaultString({ unit: true })).toEqual(
          balances.spendable.sub(fees.fee).toDefaultString({ unit: true })
        )

        const result = await asset.api.sendTx({
          asset,
          walletAccount,
          unsignedTx: fees.unsignedTx,
        })

        expect(asset.api.broadcastTx).toBeCalledTimes(1)
        expect(asset.api.signTx).toBeCalledTimes(1)
        const unsignedTx = asset.api.signTx.mock.calls[0][0].unsignedTx
        expectedUnsignedTx.txMeta.accountIndex = 0
        expect(unsignedTx).toEqual(expectedUnsignedTx)
        assertTxResult({ result, walletAccount, asset, assetClientInterface })
      },

      'Send some integration test': async (deps) => {
        const { asset, assetClientInterface, fees: feesModule } = deps
        const walletAccount = 'exodus_0'

        const spendableBalance = asset.currency.parse('0.024283533 SOL')

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

        const amount = asset.currency.parse('0.0001 SOL')

        const fees = await feesModule.getFees({
          assetName: asset.name,
          toAddress: fromAddress,
          fromAddress,
          amount,
        })

        const expectedUnsignedTx = {
          txData: {
            amount: 100_000,
            computeUnits: 450,
            expectedTakerAmount: null,
            fee: null,
            fixedFee: null,
            from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            priorityFee: 1_000_000,
            recentBlockhash: expect.any(String),
            takerAmount: null,
            to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          },
          txMeta: {
            fee: 5450,
            assetName: 'solana',
            stakingParams: {
              method: undefined,
              pool: undefined,
              seed: undefined,
              stakeAddresses: undefined,
            },
            useFeePayer: false,
            usedFeePayer: false,
          },
        }

        expect(fees.unsignedTx).toEqual(expectedUnsignedTx)
        expect(fees.fee.toDefaultString({ unit: true })).toEqual('0.00000545 SOL')

        const result = await asset.api.sendTx({
          asset,
          walletAccount,
          unsignedTx: fees.unsignedTx,
        })

        expect(asset.api.broadcastTx).toBeCalledTimes(1)
        expect(asset.api.signTx).toBeCalledTimes(1)
        const unsignedTx = asset.api.signTx.mock.calls[0][0].unsignedTx
        expectedUnsignedTx.txMeta.accountIndex = 0
        expect(unsignedTx).toEqual(expectedUnsignedTx)
        assertTxResult({ result, walletAccount, asset, assetClientInterface })
      },

      'Send some staratlas_solana integration test': async (deps) => {
        const { asset, assetClientInterface, fees: feesModule, assetsModule } = deps
        const walletAccount = 'exodus_0'

        const token = await assetsModule.getAsset('staratlas_solana')

        // sending to self
        const fromAddress = await assetClientInterface.getReceiveAddress({
          walletAccount,
          assetName: asset.name,
        })

        expect(asset.api.broadcastTx).not.toBeCalled()

        const amount = token.currency.parse('1000 base')

        const fees = await feesModule.getFees({
          assetName: token.name,
          toAddress: fromAddress,
          fromAddress,
          amount,
        })

        const expectedUnsignedTx = {
          txData: {
            amount: 1000,
            computeUnits: 4674,
            expectedTakerAmount: null,
            destinationAddressType: 'solana',
            fee: null,
            fixedFee: null,
            from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            fromTokenAddresses: [
              {
                balance: '100000000',
                decimals: 8,
                feeBasisPoints: 0,
                maximumFee: 0,
                mintAddress: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
                owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
                ticker: 'ATLASSOL',
                tokenAccountAddress: 'FMCCRZWaM9HfS4naf73zTFK4fCdCn32HH5nmg4rozHBt',
                tokenName: 'staratlas_solana',
                tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              },
            ],
            isAssociatedTokenAccountActive: true,
            priorityFee: 1_000_000,
            recentBlockhash: expect.any(String),
            takerAmount: null,
            to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            tokenMintAddress: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
            tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          },
          txMeta: {
            assetName: 'staratlas_solana',
            fee: 9674,
            stakingParams: {},
            useFeePayer: false,
            usedFeePayer: false,
          },
        }

        expect(fees.unsignedTx).toEqual(expectedUnsignedTx)

        expect(fees.fee.toDefaultString({ unit: true })).toEqual('0.000009674 SOL')

        const result = await asset.api.sendTx({
          asset: token,
          walletAccount,
          unsignedTx: fees.unsignedTx,
        })

        expect(asset.api.broadcastTx).toBeCalledTimes(1)
        expect(asset.api.signTx).toBeCalledTimes(1)
        const unsignedTx = asset.api.signTx.mock.calls[0][0].unsignedTx
        expectedUnsignedTx.txMeta.accountIndex = 0
        expect(unsignedTx).toEqual(expectedUnsignedTx)
        assertTxResult({ result, walletAccount, asset: token, assetClientInterface })
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

        expect(balances.spendable.toDefaultString({ unit: true })).toEqual('0.024283533 SOL')

        expect(asset.api.broadcastTx).not.toBeCalled()

        const nft = {
          id: 'solana:7nh6EvZUtVP4oPc9shyjLMmprfg5huKuvTUm8Xfejs8E',
          tokenStandard: 4,
          mintAddress: '7nh6EvZUtVP4oPc9shyjLMmprfg5huKuvTUm8Xfejs8E',
        }

        const expectedUnsignedTx = {
          txData: {
            amount: 1,
            computeUnits: 9851,
            destinationAddressType: 'solana',
            expectedTakerAmount: null,
            fee: null,
            fixedFee: null,
            from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            fromTokenAddresses: [
              {
                balance: '1',
                decimals: 0,
                feeBasisPoints: 0,
                maximumFee: 0,
                mintAddress: '7nh6EvZUtVP4oPc9shyjLMmprfg5huKuvTUm8Xfejs8E',
                owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
                ticker: 'UNKNOWN',
                tokenAccountAddress: '9qUjdmrnFoHd6DAH3dNiqm8ayBeSrZEUczQ23KCb3muL',
                tokenName: 'unknown',
                tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
              },
            ],
            isAssociatedTokenAccountActive: true,
            method: 'metaplexTransfer',
            priorityFee: 1_000_000,
            recentBlockhash: expect.any(String),

            takerAmount: null,
            to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            tokenMintAddress: '7nh6EvZUtVP4oPc9shyjLMmprfg5huKuvTUm8Xfejs8E',
            tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
            tokenStandard: 4,
          },
          txMeta: {
            assetName: 'solana',
            fee: 14_851,
            stakingParams: {
              method: 'metaplexTransfer',
              pool: undefined,
              seed: undefined,
              stakeAddresses: undefined,
            },
            useFeePayer: false,
            usedFeePayer: false,
          },
        }

        const fees = await feesModule.getFees({
          assetName: asset.name,
          fromAddress,
          toAddress: fromAddress,
          walletAccount,
          nft,
        })

        expect(fees.fee.toDefaultString({ unit: true })).toEqual('0.000014851 SOL')
        expect(fees.unsignedTx).toEqual(expectedUnsignedTx)

        const result = await asset.api.sendTx({
          asset,
          walletAccount,
          unsignedTx: fees.unsignedTx,
        })

        expect(asset.api.broadcastTx).toBeCalledTimes(1)
        expect(asset.api.signTx).toBeCalledTimes(1)
        const unsignedTx = asset.api.signTx.mock.calls[0][0].unsignedTx
        expectedUnsignedTx.txMeta.accountIndex = 0
        expect(unsignedTx).toEqual(expectedUnsignedTx)

        assertTxResult({ result, walletAccount, asset, assetClientInterface })
      },

      'Send all wallet 2 include dust integration test': async (deps) => {
        const { asset, assetClientInterface, fees: feesModule } = deps
        const walletAccount = 'exodus_1'

        const spendableBalance = asset.currency.parse('72971302 Lamports')
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
        const expectedFee = asset.currency.parse('0.00000545 SOL')

        const amount = balances.spendable.sub(expectedFee)

        const fees = await feesModule.getFees({
          assetName: asset.name,
          toAddress: fromAddress,
          fromAddress,
          walletAccount,
          isSendAll: true,
          amount,
        })

        const expectedUnsignedTx = {
          txData: {
            amount: 72_965_852,
            computeUnits: 450,
            expectedTakerAmount: null,
            fee: null,
            fixedFee: null,
            from: 'FegJauRKyricstvwpXuNkrG4GTzbJt5n6qiUdnhmH7rR',
            priorityFee: 1_000_000,
            recentBlockhash: expect.any(String),
            takerAmount: null,
            to: 'FegJauRKyricstvwpXuNkrG4GTzbJt5n6qiUdnhmH7rR',
          },
          txMeta: {
            assetName: 'solana',
            fee: 5450,
            stakingParams: {},
            useFeePayer: false,
            usedFeePayer: false,
          },
        }
        expect(fees.unsignedTx).toEqual(expectedUnsignedTx)
        expect(fees.fee.toDefaultString({ unit: true })).toEqual(
          expectedFee.toDefaultString({ unit: true })
        )

        const result = await asset.api.sendTx({
          asset,
          walletAccount,
          unsignedTx: fees.unsignedTx,
        })

        expect(asset.api.broadcastTx).toBeCalledTimes(1)
        expect(asset.api.signTx).toBeCalledTimes(1)
        const unsignedTx = asset.api.signTx.mock.calls[0][0].unsignedTx
        expectedUnsignedTx.txMeta.accountIndex = 1
        expect(unsignedTx).toEqual(expectedUnsignedTx)

        assertTxResult({ result, walletAccount, asset, assetClientInterface })
      },
    },
  })
})
