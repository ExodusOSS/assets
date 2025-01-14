import { fetchival } from '@exodus/fetch'
import assert from 'minimalistic-assert'
import ms from 'ms'

const HTTP_POST_TIMEOUT = ms('30s')
const DEFAULT_ORDINALS_API_KEY = undefined // ME's api key is included in proxy call
export const DEFAULT_BRC_20_URL = 'https://api-mainnet-magiceden.exodus.io'

async function improveErrorMessage(err) {
  if (err.response) {
    try {
      const responseText = await err.response.text()
      if (responseText)
        // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
        return Promise.reject(new Error(`${err.message}. Error: ${responseText.slice(0, 200)}`)) // trying to get error more info from body)
    } catch {}
  }

  throw new Error(err.message)
}

export const brc20ApiClientFactory = ({
  brc20Url = DEFAULT_BRC_20_URL,
  ordinalsApiKey = DEFAULT_ORDINALS_API_KEY,
} = {}) => {
  let baseUrl = brc20Url

  const setUrl = (newBaseUrl) => {
    baseUrl = newBaseUrl || DEFAULT_BRC_20_URL
  }

  const request = (path, queryParams) => {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
    if (ordinalsApiKey) headers.Authorization = `Bearer ${ordinalsApiKey}`

    return fetchival(baseUrl + path, { headers, timeout: HTTP_POST_TIMEOUT })
      .get(queryParams)
      .catch(improveErrorMessage)
  }

  const getOwnerTickBalances = async ({ address }) => {
    assert(address, 'address is required')
    return request(`/v2/ord/brc20/balances/${encodeURIComponent(address)}`)
  }

  const getTickerInfo = async ({ tick }) => {
    assert(tick, 'tick is required')
    return request(`/v2/ord/brc20/tokens/${encodeURIComponent(tick)}`)
  }

  const getTickerInfoByDeployInscriptionId = async ({ deployInscriptionId }) => {
    assert(deployInscriptionId, 'deployInscriptionId is required')
    return request(
      `/v2/ord/btc/brc20/deployed_inscription/${encodeURIComponent(deployInscriptionId)}`
    )
  }

  const paginatedTransactionHistory = async (queryParams) => {
    const address = queryParams.address
    assert(address, 'address is required')
    const events = []
    const limit = queryParams.limit || 40
    let offset = queryParams.offset || 0
    let response
    do {
      response = await request(`/v2/ord/brc20/history/${encodeURIComponent(address)}`, {
        limit,
        offset,
      })
      offset = offset + limit
      events.push(...response.results)
    } while (offset < response.total)

    // remap to previous event shape that later logic expects
    return events.map((event) => {
      const brc20OwnerAvailableBalance = Number(event.available_balance)
      const brc20OwnerTransferBalance = Number(event.transferrable_balance)
      assert(!isNaN(brc20OwnerAvailableBalance))
      assert(!isNaN(brc20OwnerTransferBalance))
      const brc20Op =
        event.type === 'inscribe-transfer'
          ? 'transfer'
          : event.type === 'inscribe-mint'
            ? 'mint'
            : event.type === null
              ? 'unknown'
              : event.type

      return {
        brc20Tick: event.ticker,
        inscriptionId: event.inscription_id,
        inscriptionNumber: event.inscription_number,
        txId: event.tx_id,
        createdAt: new Date(event.block_time * 1000).toISOString(),
        owner: address,
        transferFrom: event.from,
        transferTo: event.to,
        brc20Op,
        brc20Amt: event.amount,
        brc20OwnerAvailableBalance, // todo use NUs for adding these
        brc20OwnerTransferBalance, // todo use NUs for adding these
      }
    })
  }

  const getTokenTransactionHistory = ({ ticker, offset, limit, address }) => {
    return paginatedTransactionHistory({ ticker, offset, limit, address })
  }

  return {
    setUrl,
    getOwnerTickBalances,
    getTickerInfo,
    getTickerInfoByDeployInscriptionId,
    getTokenTransactionHistory,
  }
}
