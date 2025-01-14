import assert from 'minimalistic-assert'

import { brc20Utils } from './brc-20-utils.js'

export const createBrc20Command = ({ asset, amount, accountState }) => {
  assert(asset.name !== asset.baseAsset.name, `${asset.name} should be a token!`)

  const brc20BalanceMultipleAddresses = accountState?.brc20Balances?.[asset.name] || {}
  const balance = brc20Utils.getTokenBalance({ asset, accountState })
  const transferableList = brc20Utils.getTransferableList({ asset, accountState })
  assert(
    balance.gte(amount),
    `Not enough ${asset.name} balance. Wanted ${amount.toDefaultString({
      unit: true,
    })}, but got ${balance.toDefaultString({ unit: true })}`
  )

  const transferableItemsResult = brc20Utils.findTransferableItems({
    transferableList,
    amount,
    currency: asset.currency,
  })
  const brc20 = {
    inscriptionIds: transferableItemsResult.transferableItems.map((i) => i.inscriptionId),
  }

  let requireInscriptionAmount = amount.sub(transferableItemsResult.transferableItemsAmount)

  brc20.newInscriptions = Object.entries(brc20BalanceMultipleAddresses)
    .map(([address, assetBalance]) => {
      const availableBalance = asset.currency.defaultUnit(assetBalance.brc20OwnerAvailableBalance)
      const amount = requireInscriptionAmount.gt(availableBalance)
        ? availableBalance
        : requireInscriptionAmount
      requireInscriptionAmount = requireInscriptionAmount.sub(amount)
      return {
        amount,
        address,
      }
    })
    .filter((i) => i.amount.gt(asset.currency.ZERO))

  assert(
    balance.gte(amount),
    `Not enough ${asset.name} balance. Wanted ${amount.toDefaultString({
      unit: true,
    })}, but got ${balance.toDefaultString({ unit: true })}`
  )

  return brc20
}
