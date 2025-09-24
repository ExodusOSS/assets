import { Tx } from '@exodus/models'

import { parseCurrency } from './fee/fee-utils.js'

export const getActivityTxs = ({ txs, asset }) => {
  return txs.flatMap((tx) => {
    if (tx.sent && Array.isArray(tx.data.sent) && tx.data.sent.length > 0) {
      const feeAmount = tx.feeAmount.div(tx.data.sent.length)
      return tx.data.sent
        .map((to, i) => {
          // Avoids using tx.update(...) because it uses lodash _.merge
          // which can be pretty slow on mobile.
          const current = tx.toJSON()
          return Tx.fromJSON({
            ...current,
            to: to.address,
            data: {
              ...current.data,
              sentIndex: i,
              activityIndex: i,
            },
            coinAmount: to.amount
              ? parseCurrency(to.amount, asset.currency).negate()
              : asset.currency.ZERO,
            feeAmount,
          })
        })
        .reverse()
    }

    return tx
  })
}
