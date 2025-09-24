import { retry } from '@exodus/simple-retry'
import delay from 'delay'
import lodash from 'lodash'
import urlJoin from 'url-join'

const { isEmpty } = lodash

const getTextFromResponse = async (response) => {
  try {
    const responseBody = await response.text()
    return responseBody.slice(0, 100)
  } catch {
    return ''
  }
}

const fetchJson = async (url, fetchOptions, nullWhen404) => {
  const response = await fetch(url, fetchOptions)

  if (nullWhen404 && response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(
      `${url} returned ${response.status}: ${
        response.statusText || 'Unknown Status Text'
      }. Body: ${await getTextFromResponse(response)}`
    )
  }

  return response.json()
}

async function fetchJsonRetry(url, fetchOptions) {
  const waitTimes = ['5s', '10s', '20s', '30s']
  const fetchWithRetry = retry(fetchJson, { delayTimesMs: waitTimes })
  return fetchWithRetry(url, fetchOptions)
}

export default class InsightAPIClient {
  constructor(baseURL) {
    this._baseURL = baseURL
  }

  setBaseUrl(baseURL) {
    this._baseURL = baseURL
  }

  async isNetworkConnected() {
    const url = urlJoin(this._baseURL, '/peer')
    const peerStatus = await fetchJson(url, { timeout: 10_000 })
    return !!peerStatus.connected
  }

  async fetchBalance(address) {
    const encodedAddress = encodeURIComponent(address)
    const url = urlJoin(this._baseURL, `/balance/${encodedAddress}`)
    return fetchJson(url)
  }

  async fetchBlockHeight() {
    const url = urlJoin(this._baseURL, '/status')
    const status = await fetchJson(url, { timeout: 10_000 })
    return status.info.blocks
  }

  async fetchAddress(address, opts) {
    const encodedAddress = encodeURIComponent(address)
    const url = urlJoin(
      this._baseURL,
      opts?.includeTxs ? `/addr/${encodedAddress}` : `/addr/${encodedAddress}?noTxList=1`
    )
    return fetchJson(url)
  }

  async fetchUTXOs(addresses, { assetNames = [] } = {}) {
    if (Array.isArray(addresses)) addresses = addresses.join(',')
    const query = new URLSearchParams('noCache=1')
    if (assetNames) {
      query.set('assetNames', assetNames.join(','))
    }

    const encodedAddresses = encodeURIComponent(addresses)
    const url = urlJoin(this._baseURL, `/addrs/${encodedAddresses}/utxo?${query}`)
    const utxos = await fetchJson(url)

    return utxos.map((utxo) => ({
      address: utxo.address,
      txId: utxo.txid,
      confirmations: utxo.confirmations || 0,
      value: utxo.amount,
      vout: utxo.vout,
      height: utxo.height,
      script: utxo.script ?? utxo.scriptPubKey,
      asset: utxo.asset,
    }))
  }

  async fetchTx(txId) {
    const encodedTxId = encodeURIComponent(txId)
    const url = urlJoin(this._baseURL, `/tx/${encodedTxId}`)
    return fetchJson(url, undefined, true)
  }

  async fetchTxObject(txId) {
    const url = urlJoin(this._baseURL, `/fulltx?${new URLSearchParams({ hash: txId })}`)
    const object = await fetchJson(url, undefined, true)
    if (!object || isEmpty(object)) {
      return null
    }

    return object
  }

  async fetchRawTx(txId) {
    const encodedTxId = encodeURIComponent(txId)
    const url = urlJoin(this._baseURL, `/rawtx/${encodedTxId}`)
    const { rawtx } = await fetchJson(url)
    return rawtx
  }

  async fetchTxData(addrs, options = {}) {
    if (!Array.isArray(addrs) || addrs.length === 0) return { items: [], totalItems: 0 }

    options = { noScriptSig: 1, noAsm: 1, noSpent: 0, from: 0, to: 10, ...options }
    const url = `${urlJoin(this._baseURL, '/addrs/txs')}?${new URLSearchParams(options)}`

    const fetchOptions = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addrs: addrs.join(',') }),
      timeout: 10_000,
    }

    return fetchJsonRetry(url, fetchOptions)
  }

  async fetchAllTxData(addrs = [], chunk = 25, httpDelay = 2000, shouldStopFetching = () => {}) {
    const txs = []
    while (true) {
      const data = await this.fetchTxData(addrs, { from: txs.length, to: txs.length + chunk })
      if (!Array.isArray(data.items) || data.items.length === 0) break

      txs.push(...data.items)
      if ((data.totalItems && data.totalItems <= txs.length) || data.items.length < chunk) break

      if (shouldStopFetching && (await shouldStopFetching(data.items))) break

      await delay(httpDelay)
    }

    return txs
  }

  async fetchUnconfirmedAncestorData(txId) {
    const encodedTxId = encodeURIComponent(txId)
    const url = urlJoin(this._baseURL, `/unconfirmed_ancestor/${encodedTxId}`)
    return fetchJson(url)
  }

  async fetchFeeRate() {
    const url = urlJoin(this._baseURL, '/v2/fees')
    return fetchJson(url)
  }

  async broadcastTx(rawTx) {
    const _rawTx = rawTx instanceof Uint8Array ? Buffer.from(rawTx).toString('hex') : rawTx
    console.log('gonna broadcastTx')
    const url = urlJoin(this._baseURL, '/tx/send')
    const fetchOptions = {
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rawtx: _rawTx }),
    }

    const response = await fetch(url, fetchOptions)
    let data = await response.text()

    if (!response.ok) {
      console.warn('Insight Broadcast HTTP Error:')
      console.warn(response.statusText)
      console.warn(data)
      throw new Error(`Insight Broadcast HTTP Error: ${data}`)
    }

    try {
      data = JSON.parse(data)
    } catch (err) {
      console.warn('Insight Broadcast JSON Parse Error:', err.message, data)
      throw new Error(`data: ${data}`, { cause: err })
    }

    if (!data.txid) throw new Error('transaction id was not returned')
  }

  async getClaimable(address) {
    const encodedAddress = encodeURIComponent(address)
    const url = urlJoin(this._baseURL, `/addr/${encodedAddress}/claimable`)
    return fetchJson(url)
  }

  async getUnclaimed(address) {
    const encodedAddress = encodeURIComponent(address)
    const url = urlJoin(this._baseURL, `/addr/${encodedAddress}/unclaimed`)
    return fetchJson(url)
  }
}
