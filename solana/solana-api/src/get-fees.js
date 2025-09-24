/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
import assert from 'minimalistic-assert'

import { createUnsignedTxForSend } from './create-unsigned-tx-for-send.js'

const DEFAULT_SAFE_FEE = '0.0025' // SOL (enough for rent exemption)

export const getFeeAsyncFactory = ({ api }) => {
  assert(api, 'api is required')
  return async ({
    asset,
    method,
    feeData,
    unsignedTx: providedUnsignedTx,
    amount,
    toAddress,
    stakingInfo,
    ...rest
  }) => {
    let fee, unsignedTx

    if (providedUnsignedTx) {
      unsignedTx = providedUnsignedTx
      fee = asset.feeAsset.currency.baseUnit(unsignedTx.txMeta.fee)
    } else {
      if (['delegate', 'undelegate', 'withdraw'].includes(method)) {
        assert(stakingInfo, 'stakingInfo is required for staking txs')
        assert(rest.fromAddress, 'fromAddress is required for staking txs')
        assert(feeData, 'feeData is required for staking txs')

        // staking params
        rest.method = method
        rest.seed = `exodus:${Date.now()}` // unique seed
        rest.pool = stakingInfo.staking.pool

        const stakeAddresses = []
        for (const [addr, info] of Object.entries(stakingInfo.accounts || {})) {
          if (method === 'undelegate' && (info.state === 'active' || info.state === 'activating')) {
            stakeAddresses.push(addr)
          }
        }

        rest.stakeAddresses = stakeAddresses
        rest.accounts = stakingInfo.accounts

        amount =
          method === 'undelegate'
            ? stakingInfo.locked // unstake all
            : method === 'withdraw'
              ? stakingInfo.withdrawable // withdraw all
              : amount
        // withdraw won't use amount, will extract it from accounts
      }

      try {
        unsignedTx = await createUnsignedTxForSend({
          asset,
          feeData,
          api,
          amount: amount ?? asset.currency.baseUnit(1),
          toAddress: toAddress ?? rest.fromAddress,
          useFeePayer: false,
          ...rest,
        })

        fee = asset.feeAsset.currency.baseUnit(unsignedTx.txMeta.fee)
      } catch (err) {
        console.log('error computing right SOL fee:', err)
        // simulating a tx will fail if the user has not enough balance
        // we fallback to a default fee (but we could leave some dust)
        fee = asset.feeAsset.currency.defaultUnit(DEFAULT_SAFE_FEE)
      }
    }

    return { fee, unsignedTx }
  }
}

export const getFeeFactory =
  ({ asset }) =>
  ({ feeData }) => {
    return { fee: feeData.fee }
  }
