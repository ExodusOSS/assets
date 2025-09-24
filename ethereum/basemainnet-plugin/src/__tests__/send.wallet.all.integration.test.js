/* eslint-disable camelcase */
import { walletTester } from '@exodus/assets-testing'
import { asset as baseAssetMeta } from '@exodus/basemainnet-meta'
import { resolveGasPrice } from '@exodus/ethereum-api/src/fee-utils.js'
import { createNoHistoryServerDescribe } from '@exodus/evm-fork-testing'

import baseAssetPlugin from '../index.js'

const describeBaseMainnet = createNoHistoryServerDescribe({
  assetName: 'basemainnet',
  baseAssetMeta,
  baseAssetPlugin,
  port: 8553,
  simulator: 'supersim',
})

const estimateL1DataFeeFor = async ({
  asset,
  assetClientInterface,
  walletAccount,
  walletAddress,
  toAddress,
  amount,
  gasLimit,
  disableL1DataFeeExtraBuffer = false,
}) => {
  const [feeData, nonce] = await Promise.all([
    assetClientInterface.getFeeData({
      assetName: asset.name,
    }),
    asset.server.getTransactionCount(walletAddress),
  ])

  const { eip1559Enabled } = feeData

  const maxFeePerGas = await resolveGasPrice({ feeData })

  const createUnsignedTxParams = {
    asset,
    walletAccount,
    address: toAddress,
    amount,
    nonce,
    txInput: null,
    gasLimit,
    gasPrice: maxFeePerGas,
    tipGasPrice: maxFeePerGas,
    fromAddress: walletAddress,
    eip1559Enabled,
  }

  const unsignedTx = await asset.api.createUnsignedTx(createUnsignedTxParams)
  const estimatedL1DataFee = await asset.estimateL1DataFee({
    unsignedTx,
    disableL1DataFeeExtraBuffer,
  })
  return { createUnsignedTxParams, estimatedL1DataFee, maxFeePerGas }
}

describeBaseMainnet(
  'basemainnet send all',
  async ({
    ADDRESS_DEAD,
    assetName,
    assetPlugin,
    setBalance,
    mine,
    WAD,
    mulDivUp,
    getForkAccount,
  }) => {
    const walletTesterTest_getL1DataFee = async ({
      addressesCollector,
      asset,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const startingBalance = asset.currency.baseUnit('69000000000000000000')

      const { spendable } = await asset.api.getBalances({
        asset,
        txLog: await assetClientInterface.getTxLog({
          assetName,
          walletAccount,
        }),
        accountState: await setBalance({
          asset,
          assetClientInterface,
          walletAccount,
          walletAddress,
          amount: startingBalance,
        }),
      })

      expect(spendable.equals(startingBalance)).toBeTrue()

      const gasLimit = 21_000
      const amount = asset.currency.baseUnit('42000000000000000000')
      const toAddress = ADDRESS_DEAD

      const { estimatedL1DataFee: estimatedL1DataFeeWithPadding, maxFeePerGas } =
        await estimateL1DataFeeFor({
          asset,
          assetClientInterface,
          walletAccount,
          walletAddress,
          toAddress,
          amount,
          gasLimit,
        })

      expect(typeof estimatedL1DataFeeWithPadding).toBe('string')
      expect(parseInt(estimatedL1DataFeeWithPadding)).toBeGreaterThan(0)

      const feeData = await asset.api.getFeeData()

      // Ensure the calculations are consistent:
      const { fee } = await asset.api.getFeeAsync({
        asset,
        fromAddress: walletAccount,
        toAddress: ADDRESS_DEAD,
        amount,
        txInput: null,
        gasLimit,
        feeData,
      })

      // NOTE: By default, fee estimations include padding.
      expect(fee.toBaseString()).toBe(
        asset.currency
          .baseUnit(estimatedL1DataFeeWithPadding)
          .add(maxFeePerGas.mul(gasLimit))
          .toBaseString()
      )

      const sendAllAmount = startingBalance.sub(fee)

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: sendAllAmount,
        options: { isSendAll: true },
      })

      // NOTE: Automine is not enabled by default for `supersim`!
      await mine({ asset })

      const originalDataFee = mulDivUp(
        BigInt(estimatedL1DataFeeWithPadding),
        WAD,
        // The default padding exaggerates the true fee by 1.25x:
        BigInt('1250000000000000000')
      )

      // Since we add 25% padding, we expect this buffer to remain:
      const leftoverPadding = BigInt(estimatedL1DataFeeWithPadding) - originalDataFee
      expect(BigInt(await asset.server.getBalance(walletAddress))).toBe(leftoverPadding)
    }

    walletTester({
      assetPlugin,
      assetName,
      seed: 'test test test test test test test test test test test junk',
      tests: {
        walletTesterTest_getL1DataFee,
      },
    })
  }
)
