import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { groupBy, sortBy } = lodash

// return first to last (ALSO FILTERS)
// we need to do this because Insight often returns the blocktime as time and many
// txs may fall inside the same block, but if one is an input to other, it should preceed
/*
  A -> B (tx A is an input to tx B)
  B -> C
  A -> C

  start:

  C B A  (same time, ordered)... look at C, check if C's inputs are ahead, look for one furthest, then set + 1

  B A C  check B, A is in input

  A B C  check A, no inputs
*/
export function orderTxs(txs) {
  if (txs.length === 1) return [...txs]

  // filter duplicates
  const txMap = {}
  txs.forEach((tx) => {
    txMap[tx.txid] = tx
  })

  // group by time
  const txTimesMap = groupBy(Object.values(txMap), (tx) => tx.time || '')

  // sort unique time keys
  const txTimes = Object.keys(txTimesMap)
  txTimes.sort((a, b) => Math.trunc(a) - Math.trunc(b))

  const rettxs = []

  txTimes.forEach((txTime) => {
    const txsAtTime = txTimesMap[txTime] // array of txs
    // should always be an array, but just incase
    if (!Array.isArray(txsAtTime)) return
    if (txsAtTime.length === 1) return rettxs.push(txsAtTime[0])

    // existing order { txid: orderNum }
    const txOrderCol = []
    for (const [i, element] of txsAtTime.entries()) {
      txOrderCol.push({ txid: element.txid, order: i })
    }

    // determine new orders, checks each vin and looks for max order,
    // want current tx greater than any vin
    const txsAtTimeClone = [...txsAtTime]
    while (txsAtTime.length > 0) {
      const tx = txsAtTime.shift()
      let maxOrder = 0
      tx.vin.forEach((vin) => {
        const txOrderMatch = txOrderCol.find((opair) => opair.txid === vin.txid)
        if (txOrderMatch && txOrderMatch.order > maxOrder) maxOrder = txOrderMatch.order
      })
      txOrderCol.find((opair) => opair.txid === tx.txid).order = maxOrder + 1
    }

    const baseTime = Math.trunc(txTime)
    const newWorldOrder = sortBy(txOrderCol, ['order'])
    newWorldOrder.forEach((opair, i) => {
      const txid = opair.txid

      const tx = txsAtTimeClone.find((tx) => tx.txid === txid)
      assert(tx, 'InsightAPIClient.orderTxs() tx undefined.')

      // we must do this to preserve order outside of this algorithm, difference is negligible
      tx.time = txTime ? baseTime + i : baseTime
      rettxs.push(tx)
    })
  })

  return rettxs
}

/**
 * It concerts an api URL to a WS service URL.
 *
 * https://somebtc.a.exodus.io/insight/ => https://somebtc.a.exodus.io
 *
 * @param {string} apiUrl the original apiUrl
 * @returns {string} a WS url without the paths.
 */
export function toWSUrl(apiUrl) {
  if (!apiUrl) {
    return apiUrl
  }

  try {
    // Note, we are not using URL because URL is different between mobile, desktop and BE
    // Using hydra's networking modules is an overkill for this function.
    const firstSplit = apiUrl.split('://')
    if (firstSplit.length > 1) {
      return `${firstSplit[0]}://${firstSplit[1].split('/')[0]}`
    }

    return apiUrl
  } catch {
    return apiUrl
  }
}

export function normalizeInsightConfig(config) {
  const apiUrl = config?.insightServers?.[0]
  const wsUrl = config?.insightServersWS?.[0] || toWSUrl(apiUrl)
  return { apiUrl, wsUrl }
}
