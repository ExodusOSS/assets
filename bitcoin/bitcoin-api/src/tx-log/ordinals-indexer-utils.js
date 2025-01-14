import { memoizeLruCache } from '@exodus/asset-lib'
import lodash from 'lodash'

const { cloneDeep } = lodash

export const indexOutputs = ({ tx, currency }) => {
  const inscriptions = []

  let inputOffset = currency.ZERO
  for (let i = 0; i < tx.vin.length; i++) {
    const vin = tx.vin[i]
    const value = currency.defaultUnit(vin.value)
    inscriptions.push(
      ...(vin.inscriptions || []).map((i) => ({
        ...i,
        offset: currency.baseUnit(i.offset).add(inputOffset),
      }))
    )
    inputOffset = inputOffset.add(value)
  }

  let outputOffset = currency.ZERO
  for (let i = 0; i < tx.vout.length; i++) {
    const vout = tx.vout[i]
    const value = currency.defaultUnit(vout.value)
    vout.inscriptions = inscriptions
      .filter((i) => i.offset.gte(outputOffset) && i.offset.lt(value.add(outputOffset)))
      .map((i) => ({ ...i, offset: i.offset.sub(outputOffset).toBaseNumber() }))
    outputOffset = outputOffset.add(value)
  }

  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  tx.inscriptionsMemoryIndexed = true // avoids btc being spent even when the mempool index was done in memory
  return tx
}

export const cachedIndexOrdinalUnconfirmedTx = memoizeLruCache(
  async ({ insightClient, currency, tx }) => {
    if (tx.inscriptionsIndexed || tx.inscriptionsMemoryIndexed) {
      return tx
    }

    const copyTx = cloneDeep(tx)
    await Promise.all(
      copyTx.vin.map(async (vin) => {
        const outputTx = await cachedIndexOrdinalUnconfirmedTx({
          insightClient,
          currency,
          tx: await insightClient.fetchTxObject(vin.txid),
        })
        if (!outputTx.inscriptionsIndexed && !outputTx.inscriptionsMemoryIndexed) {
          throw new Error(`Cannot index ${tx.txid}. Input tx ${outputTx.txid} is not indexed. `)
        }

        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        vin.inscriptions = outputTx.vout[vin.vout].inscriptions
      })
    )
    return indexOutputs({ tx: copyTx, currency })
  },
  ({ tx }) => `${tx.txid}_${tx.confirmations}`,
  100
)

export const indexOrdinalUnconfirmedTx = ({ insightClient, currency, tx }) => {
  if (tx.inscriptionsIndexed) {
    return tx
  }

  return cachedIndexOrdinalUnconfirmedTx({
    insightClient,
    currency,
    tx,
  })
}
