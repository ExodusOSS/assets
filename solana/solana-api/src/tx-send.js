import assert from 'minimalistic-assert'

import { createUnsignedTxForSend, extractTxLogData } from './create-unsigned-tx-for-send.js'

export const createAndBroadcastTXFactory =
  ({ api, assetClientInterface, feePayerApiUrl }) =>
  async ({ asset, walletAccount, unsignedTx: predefinedUnsignedTx, ...legacyParams }) => {
    const assetName = asset.name
    assert(assetClientInterface, `assetClientInterface must be supplied in sendTx for ${assetName}`)

    const baseAsset = asset.baseAsset

    const resolveTxs = async () => {
      if (predefinedUnsignedTx) {
        return predefinedUnsignedTx
      }

      // handle legacy mode
      const feeData = await assetClientInterface.getFeeData({ assetName })
      const fromAddress = await assetClientInterface.getReceiveAddress({
        assetName: baseAsset.name,
        walletAccount,
      })

      return createUnsignedTxForSend({
        api,
        asset,
        feeData,
        fromAddress,
        feePayerApiUrl,
        amount: legacyParams.amount,
        toAddress: legacyParams.address,
        ...legacyParams.options,
      })
    }

    const unsignedTx = await resolveTxs()

    const signedTx = await assetClientInterface.signTransaction({
      assetName: baseAsset.name,
      unsignedTx,
      walletAccount,
    })

    const txId = signedTx.txId

    const isToken = asset.assetType === api.tokenAssetType

    await baseAsset.api.broadcastTx(signedTx.rawTx)

    try {
      // collecting data from unsignedTx, it should be sufficient
      const txLogData = await extractTxLogData({ unsignedTx, api })

      const method = txLogData.method
      const fromAddress = txLogData.from
      const toAddress = txLogData.to
      const selfSend = fromAddress === toAddress
      const amount = asset.currency.baseUnit(txLogData.amount)
      const feeAmount = txLogData.usedFeePayer
        ? asset.feeAsset.currency.ZERO
        : asset.feeAsset.currency.baseUnit(txLogData.fee)

      const isStakingTx = ['delegate', 'undelegate', 'withdraw'].includes(method)
      let coinAmount = asset.currency.ZERO

      if (amount) {
        const absoluteAmount = amount.abs()
        if (isStakingTx) {
          coinAmount = absoluteAmount
        } else if (!selfSend) {
          coinAmount = absoluteAmount.negate()
        }
      }

      let data = Object.create(null)

      if (isStakingTx) {
        data = {
          staking: {
            ...txLogData.stakingParams,
            stake: coinAmount.toBaseNumber(),
          },
        }
        coinAmount = asset.currency.ZERO
      }

      const tx = {
        txId,
        confirmations: 0,
        coinName: assetName,
        coinAmount,
        feeAmount,
        feeCoinName: asset.feeAsset.name,
        selfSend,
        to: toAddress,
        data,
        currencies: {
          [assetName]: asset.currency,
          [asset.feeAsset.name]: asset.feeAsset.currency,
        },
      }
      await assetClientInterface.updateTxLogAndNotify({
        assetName,
        walletAccount,
        txs: [tx],
      })

      if (isToken) {
        // write tx entry in solana for token fee
        const txForFee = {
          txId,
          confirmations: 0,
          coinName: baseAsset.name,
          coinAmount: baseAsset.currency.ZERO,
          tokens: [assetName],
          feeAmount,
          feeCoinName: baseAsset.feeAsset.name,
          to: toAddress,
          selfSend,
          currencies: {
            [baseAsset.name]: baseAsset.currency,
            [baseAsset.feeAsset.name]: baseAsset.feeAsset.currency,
          },
        }
        await assetClientInterface.updateTxLogAndNotify({
          assetName: baseAsset.name,
          walletAccount,
          txs: [txForFee],
        })
      }
    } catch (err) {
      console.log('error writing SOL txLog', err)
      return { txId, txLogError: true }
    }

    return { txId }
  }
