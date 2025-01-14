import type { Asset, BalanceChanges, NumberUnit } from '@exodus/web3-types'

export const hasSufficientBalance = (
  asset: Asset,
  txFee: NumberUnit,
  balanceChanges: BalanceChanges,
  availableBalance: NumberUnit,
): boolean => {
  const sendAmount = balanceChanges.willSend.reduce((acc, { balance }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore unitName exists on NumberUnit, but deprecated
    if (asset.currency.ZERO.unitName === balance.unitName) {
      return acc.add(balance)
    }
    return acc
  }, asset.currency.ZERO)

  const totalCost = sendAmount.add(txFee)

  return availableBalance.gte(totalCost)
}
