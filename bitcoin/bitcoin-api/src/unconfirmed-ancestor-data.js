import assert from 'minimalistic-assert'

export async function resolveUnconfirmedAncestorData({ utxos, insightClient }) {
  assert(utxos, 'utxos is required')
  assert(insightClient, 'insightClient is required')
  const dataMap = Object.create(null)
  const unconfirmedUtxos = utxos.toArray().filter((data) => {
    return !data.confirmations || data.confirmations <= 0
  })
  const txIds = new Set(unconfirmedUtxos.map(({ txId }) => txId))
  for (const txId of txIds) {
    try {
      const { size, fees } = await insightClient.fetchUnconfirmedAncestorData(txId)
      if (size !== 0) {
        dataMap[txId] = { size, fees }
      }
    } catch (e) {
      console.warn(e)
    }
  }

  return dataMap
}

export function getUnconfirmedTxAncestorMap({ accountState }) {
  return accountState?.mem?.unconfirmedTxAncestor || Object.create(null)
}

export function resolveExtraFeeOfTx({ feeRate, txId, unconfirmedTxAncestor }) {
  const data = unconfirmedTxAncestor?.[txId]
  if (!data) return 0
  const { fees, size } = data
  // Get the difference in fee rate between ancestors and current estimate
  const feeRateDiff = feeRate - fees / size
  // If the diff is negative, ancestors already pay more than current estimate
  if (feeRateDiff <= 0) return 0
  // Calculate enough fee to bring the fee rate of ancestors to current estimate
  return feeRateDiff * size
}
