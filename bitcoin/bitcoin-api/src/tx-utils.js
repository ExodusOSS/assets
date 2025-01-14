import { resolveExtraFeeOfTx } from './unconfirmed-ancestor-data.js'

export const findUnconfirmedSentRbfTxs = (txSet) =>
  [...txSet].filter(
    (tx) =>
      tx.sent &&
      tx.pending &&
      tx.data &&
      tx.data.rbfEnabled &&
      !tx.data.replacedBy &&
      tx.data.inputs
  )

export const findLargeUnconfirmedTxs = ({ txSet, feeRate, maxFee, unconfirmedTxAncestor }) =>
  txSet
    ? new Set(
        [...txSet]
          .filter((tx) => {
            if (!tx.pending) return false
            const extraFee = resolveExtraFeeOfTx({
              feeRate,
              txId: tx.txId,
              unconfirmedTxAncestor,
            })
            return extraFee && extraFee > maxFee
          })
          .map((tx) => tx.txId)
      )
    : new Set()
