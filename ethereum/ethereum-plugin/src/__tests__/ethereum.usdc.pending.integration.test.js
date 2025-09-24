/* eslint-disable camelcase */
import { walletTester } from '@exodus/assets-testing'
import { estimateGasLimit } from '@exodus/ethereum-api'

import { createEthereumNoHistoryServerDescribe } from './__utils__/index.js'

jest.setTimeout(60 * 60 * 1000)

const describe = createEthereumNoHistoryServerDescribe({ port: 8549 })

describe(
  'ethereum usdc pending integration tests',
  async ({
    abiEncodeBigInt,
    ADDRESS_DEAD,
    TYPE_UINT128_MAX,
    assetName,
    assetPlugin,
    createWatchTx,
    setBalance,
    getEthLikeTokenAddressOrThrow,
    getForkAccount,
    startNoHistoryMonitor,
    setAutomine,
    mine,
  }) => {
    const walletTesterTest_dealUsdc = async ({
      addressesCollector,
      asset,
      assetsModule,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const tokenAsset = await assetsModule.getAsset('usdcoin')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      const {
        confirmed: { [tokenAssetAddress]: usdcBalanceBefore },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(usdcBalanceBefore)).toBe(BigInt('0'))

      const accountState = await setBalance({
        asset: tokenAsset,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: tokenAsset.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
      })

      const {
        confirmed: { [tokenAssetAddress]: usdcBalanceAfter },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(usdcBalanceAfter)).toBe(TYPE_UINT128_MAX)

      const usdcBalances = tokenAsset.api.getBalances({
        asset: tokenAsset,
        txLog: await assetClientInterface.getTxLog({
          assetName: tokenAsset.name,
          walletAccount,
        }),
        accountState,
      })

      expect(BigInt(usdcBalances.total.toBaseString())).toBe(TYPE_UINT128_MAX)
      expect(BigInt(usdcBalances.balance.toBaseString())).toBe(TYPE_UINT128_MAX)
      expect(BigInt(usdcBalances.spendableBalance.toBaseString())).toBe(TYPE_UINT128_MAX)
    }

    const walletTesterTest_sendAllUsdc = async ({
      asset,
      assetsModule,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const watchTx = createWatchTx({ asset, assetClientInterface, walletAccount })

      const tokenAsset = await assetsModule.getAsset('usdcoin')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      const { stopNoHistoryMonitor } = await startNoHistoryMonitor({
        asset,
        assetClientInterface,
        walletAccount,
      })

      const nextAccountState = tokenAsset.api.getBalances({
        asset: tokenAsset,
        txLog: await assetClientInterface.getTxLog({
          assetName: tokenAsset.name,
          walletAccount,
        }),
        accountState: await setBalance({
          asset: tokenAsset,
          assetClientInterface,
          walletAddress,
          walletAccount,
          amount: tokenAsset.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
        }),
      })

      const { spendableBalance: beforeSpendableBalance } = nextAccountState
      expect(BigInt(beforeSpendableBalance.toBaseString())).toBe(TYPE_UINT128_MAX)

      // Send the next transaction.
      const { txId } = await asset.api.sendTx({
        asset: tokenAsset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: beforeSpendableBalance,
        options: { isSendAll: true },
      })

      await watchTx(txId)

      const {
        confirmed: { [tokenAssetAddress]: usdcBalanceAfter },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(usdcBalanceAfter)).toBe(BigInt(0)) // Confirmed balance of zero.

      const txLog = await assetClientInterface.getTxLog({
        assetName: tokenAsset.name,
        walletAccount,
      })

      const { spendableBalance: afterSpendableBalance } = tokenAsset.api.getBalances({
        asset: tokenAsset,
        txLog,
        accountState: nextAccountState,
      })

      expect(afterSpendableBalance).toBe(tokenAsset.currency.ZERO)
      return stopNoHistoryMonitor()
    }

    const walletTesterTest_sendAllUsdcWhilstPending = async ({
      asset,
      assetsModule,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
      blockchainMetadata,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const watchTx = createWatchTx({ asset, assetClientInterface, walletAccount })

      const { stopNoHistoryMonitor } = await startNoHistoryMonitor({
        asset,
        assetClientInterface,
        walletAccount,
      })

      const [tokenAsset] = await Promise.all([
        assetsModule.getAsset('usdcoin'),
        setAutomine({ asset, disabled: true }),
      ])

      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      // Define the total amounts we're going to incrementally send. The
      // transactions we send can be optionally stuck in pending whilst
      // we send others, so we can use this to search for any discrepencies
      // when handling the two formats.
      const sequence = Array.from({ length: 10 }).map((_, i, orig) => ({
        shouldConfirm: Math.random() > 0.5 || i === orig.length - 1,
        amount: tokenAsset.currency.parse(`${(Math.random() * 1000).toFixed(6)} USDC`),
      }))

      // Compute and mint the `totalAmount` to the sender wallet.
      const totalAmount = sequence.reduce(
        (e, { amount }) => e.add(amount),
        tokenAsset.currency.ZERO
      )

      const usdcBalancesBefore = tokenAsset.api.getBalances({
        asset: tokenAsset,
        txLog: await assetClientInterface.getTxLog({
          assetName: tokenAsset.name,
          walletAccount,
        }),
        accountState: await setBalance({
          asset: tokenAsset,
          assetClientInterface,
          walletAddress,
          walletAccount,
          amount: totalAmount,
        }),
      })

      const {
        confirmed: { [tokenAssetAddress]: usdcBalanceBefore },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(usdcBalanceBefore)).toBe(BigInt(totalAmount.toBaseString()))

      expect(usdcBalancesBefore.spendableBalance).toBe(totalAmount)

      let totalAmountSent = tokenAsset.currency.ZERO
      const txIds = []

      for (let i = 0; i < sequence.length; i++) {
        const { amount: maybeAmountToTransfer, shouldConfirm } = sequence[i]
        const isSendAll = i === sequence.length - 1

        const txLog = await assetClientInterface.getTxLog({
          assetName: tokenAsset.name,
          walletAccount,
        })

        const expectedBalance = totalAmount.sub(totalAmountSent)

        // TODO: everywhere we're not currently doing this is basically broken :(
        const accountState = await blockchainMetadata.getAccountState({
          assetName: asset.name,
          walletAccount,
        })

        const nextBalances = await tokenAsset.api.getBalances({
          asset: tokenAsset,
          txLog,
          accountState,
        })

        const { spendableBalance: currentSpendableBalance } = nextBalances

        expect(BigInt(currentSpendableBalance.toBaseString())).toBe(
          BigInt(expectedBalance.toBaseString())
        )

        // For the last transaction, we'll rely upon the `txLog`
        // to determine the `amountToTransfer`.
        const amountToTransfer = isSendAll ? currentSpendableBalance : maybeAmountToTransfer

        // Validate that we're attempting to send the expected amount
        // for the final transaction.
        if (isSendAll) {
          expect(BigInt(amountToTransfer.toBaseString())).toBe(
            BigInt(maybeAmountToTransfer.toBaseString())
          )
        }

        // Send the next transaction.
        const { txId } = await asset.api.sendTx({
          asset: tokenAsset,
          walletAccount,
          address: ADDRESS_DEAD,
          amount: amountToTransfer,
          options: { isSendAll },
        })

        txIds.push(txId)
        totalAmountSent = totalAmountSent.add(amountToTransfer)

        // If this transaction must be confirmed, then we can perform
        // additional checks to ensure all the balances until this
        // point can be reconciled with the expectations of the sequence.
        if (shouldConfirm) {
          await mine({ asset })
          await watchTx(txId)
          const {
            confirmed: { [tokenAssetAddress]: usdcBalanceAfter },
          } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')
          // Ensure we've sent up to the correct amount.
          expect(BigInt(usdcBalanceAfter)).toBe(
            BigInt(totalAmount.toBaseString()) - BigInt(totalAmountSent.toBaseString())
          )
        }
      }

      await setAutomine({ asset })
      await stopNoHistoryMonitor()

      // Ensure that all transactions succeeded.
      for (const txId of txIds) {
        const { status } = await asset.server.getTransactionReceipt(txId)
        expect(status).toBe('0x1')
      }
    }

    const walletTesterTest_estimateUsdcTransferGas = async ({ asset, assetsModule }) => {
      // Calculates the estimated gas for a USDC token transfer from an
      // address with a deep liquid balance of USDC to the defined
      // `recipientAddress`.
      const estimateUsdcTransferToRecipient = async ({ recipientAddress }) => {
        const tokenAsset = await assetsModule.getAsset('usdcoin')
        return estimateGasLimit({
          asset,
          fromAddress: '0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341' /* Maker PSM */,
          toAddress: getEthLikeTokenAddressOrThrow({ asset: tokenAsset }),
          data: `0xa9059cbb${abiEncodeBigInt(BigInt(recipientAddress))}${abiEncodeBigInt(BigInt('1'))}`,
        })
      }

      expect(
        await estimateUsdcTransferToRecipient({
          recipientAddress: '0xffffffffffffffffffffffffffffffffffffffff',
        })
      ).toBeLessThan(
        await estimateUsdcTransferToRecipient({
          recipientAddress: '0xfffFfFfFfFfFFFFFfeFfFFFffFffFFFFfFFFFFFF',
        })
      )
    }

    walletTester({
      assetPlugin,
      assetName,
      seed: 'test test test test test test test test test test test junk',
      expectedAddresses: {
        ethereum_44_exodus_0_0_0: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
      availableAssetNames: ['usdcoin', 'ethereum'],
      walletAccountCount: 1,
      tests: {
        walletTesterTest_dealUsdc,
        walletTesterTest_sendAllUsdc,
        walletTesterTest_sendAllUsdcWhilstPending,
        walletTesterTest_estimateUsdcTransferGas,
      },
    })
  },
  { blockNumber: 22_216_186 }
)
