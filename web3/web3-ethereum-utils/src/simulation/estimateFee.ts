/*
 This utility determines a preliminary fee a transaction is going to pay based on
 its "gas", "gasPrice" and "maxFeePerGas" properties.

 Note: if EIP-1559 is enabled, a transaction will have the "maxFeePerGas" field. In that case,
 a final gas price will be determined on-chain (the utility uses a maximum possible gas price value).
 If a transaction has only "gasPrice", it can be considered as a final gas price.
 However, a final fee for non-simple transfers is always calculated on-chain once the EVM executes a transaction
 and has the number of gas consumed.
 */

import { createCurrency, hexToBN } from '@exodus/web3-utils'

import { getCreateCurrencyParams } from './common.js'

import type { EthTransaction } from '../types.js'
import type { Asset, NumberUnit } from '@exodus/web3-types'

export const estimateFee = ({
  asset,
  transaction,
}: {
  asset: Asset
  transaction: EthTransaction
}): NumberUnit => {
  const gas = hexToBN(transaction.gas)

  if (transaction.maxFeePerGas) {
    const maxFeePerGas = hexToBN(transaction.maxFeePerGas)
    const maximumFee = gas.mul(maxFeePerGas)

    return createCurrency(getCreateCurrencyParams(asset, maximumFee.toString()))
  }

  const gasPrice = hexToBN(transaction.gasPrice)

  return createCurrency(
    getCreateCurrencyParams(asset, gas.mul(gasPrice).toString()),
  )
}
