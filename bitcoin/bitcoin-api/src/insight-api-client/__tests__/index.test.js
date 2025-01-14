/* eslint-disable unicorn/no-useless-undefined */

jest.mock('delay', () => jest.fn())

const { default: delay } = await import('delay')
const { default: InsightAPIClient } = await import('../index.js')

const fetch = jest.exodus.mock.fetchNoop()

afterEach(() => {
  jest.resetAllMocks()
})
const mockFetch = (...responses) => {
  responses.forEach((response, index) => {
    const isError = response instanceof Error
    const value = {
      ok: !isError,
      statusText: isError ? response.message : 'ok',
      json: () => (isError ? Promise.reject(response) : Promise.resolve(response)),
      text: () => (isError ? Promise.reject(response) : Promise.resolve(JSON.stringify(response))),
    }
    if (index === responses.length - 1) {
      fetch.mockResolvedValue(value)
    } else {
      fetch.mockResolvedValueOnce(value)
    }
  })
}

describe('insight-api-client tests', () => {
  const client = new InsightAPIClient('https://localhost:9999')
  test('isNetworkConnected to be true', async () => {
    mockFetch({ connected: true })
    expect(await client.isNetworkConnected()).toEqual(true)
    expect(fetch).toBeCalledWith(`https://localhost:9999/peer`, { timeout: 10_000 })
  })

  test('isNetworkConnected to be false', async () => {
    mockFetch({ connected: false })
    expect(await client.isNetworkConnected()).toEqual(false)
    expect(fetch).toBeCalledWith(`https://localhost:9999/peer`, { timeout: 10_000 })
  })

  test('isNetworkConnected fail', async () => {
    mockFetch(new Error('Fail me once'))
    await expect(client.isNetworkConnected()).rejects.toThrow('Fail me once')
    expect(fetch).toBeCalledWith(`https://localhost:9999/peer`, { timeout: 10_000 })
  })

  test('fetchAddress real address', async () => {
    mockFetch({ someData: 123 })
    expect(await client.fetchAddress('abc', { includeTxs: true })).toEqual({ someData: 123 })
    expect(fetch).toBeCalledWith(`https://localhost:9999/addr/abc`, undefined)
  })

  test('fetchAddress funny address', async () => {
    mockFetch({ someData: 123 })
    expect(await client.fetchAddress('abc/123?wrong=true', { includeTxs: true })).toEqual({
      someData: 123,
    })
    expect(fetch).toBeCalledWith(`https://localhost:9999/addr/abc%2F123%3Fwrong%3Dtrue`, undefined)
  })

  test('fetchUTXOs real addresses and asset names', async () => {
    mockFetch([])
    expect(
      await client.fetchUTXOs(['abc', '123'], { assetNames: ['bitcoin', 'ethereum'] })
    ).toEqual([])
    expect(fetch).toBeCalledWith(
      `https://localhost:9999/addrs/abc%2C123/utxo?noCache=1&assetNames=bitcoin%2Cethereum`,
      undefined
    )
  })

  test('fetchUTXOs hacked addresses and asset names', async () => {
    mockFetch([])
    expect(
      await client.fetchUTXOs(['abc/cc?wrong=true', '123'], {
        assetNames: ['bitcoin/cc?wrong=true', 'ethereum'],
      })
    ).toEqual([])
    expect(fetch).toBeCalledWith(
      `https://localhost:9999/addrs/abc%2Fcc%3Fwrong%3Dtrue%2C123/utxo?noCache=1&assetNames=bitcoin%2Fcc%3Fwrong%3Dtrue%2Cethereum`,
      undefined
    )
  })

  test('fetchTxData real addresses ', async () => {
    mockFetch([])
    expect(await client.fetchTxData(['abc', '123'], { yetAnotherOption: 10 })).toEqual([])
    expect(fetch).toBeCalledWith(
      `https://localhost:9999/addrs/txs?noScriptSig=1&noAsm=1&noSpent=0&from=0&to=10&yetAnotherOption=10`,
      {
        body: '{"addrs":"abc,123"}',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        method: 'post',
        timeout: 10_000,
      }
    )
  })

  test('fetchTxData funny addresses and options', async () => {
    const url = `https://localhost:9999/addrs/txs?noScriptSig=1&noAsm=1&noSpent=0&from=0&to=10&yetAnotherOption=abc%3D1%26escapeme%3D2`
    mockFetch([])
    expect(
      await client.fetchTxData(['abc,def', '123'], { yetAnotherOption: 'abc=1&escapeme=2' })
    ).toEqual([])
    expect(fetch).toBeCalledWith(url, {
      body: '{"addrs":"abc,def,123"}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'post',
      timeout: 10_000,
    })
  })

  test('fetchTxData retry', async () => {
    const url = `https://localhost:9999/addrs/txs?noScriptSig=1&noAsm=1&noSpent=0&from=0&to=10&yetAnotherOption=abc%3D1%26escapeme%3D2`
    mockFetch(new Error('Some Error'), new Error('Some Error Twice'), [])
    expect(
      await client.fetchTxData(['abc,def', '123'], { yetAnotherOption: 'abc=1&escapeme=2' })
    ).toEqual([])
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(delay).toHaveBeenCalledTimes(2)
    expect(delay).toHaveBeenNthCalledWith(1, 5000)
    expect(delay).toHaveBeenNthCalledWith(2, 10_000)
    expect(fetch).toHaveBeenNthCalledWith(1, url, {
      body: '{"addrs":"abc,def,123"}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'post',
      timeout: 10_000,
    })

    expect(fetch).toHaveBeenNthCalledWith(2, url, {
      body: '{"addrs":"abc,def,123"}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'post',
      timeout: 10_000,
    })
    expect(fetch).toHaveBeenNthCalledWith(3, url, {
      body: '{"addrs":"abc,def,123"}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'post',
      timeout: 10_000,
    })
  })

  test('fetchTxData fail after many errors', async () => {
    mockFetch(new Error('Some Error'))
    await expect(
      client.fetchTxData(['abc,def', '123'], { yetAnotherOption: 'abc=1&escapeme=2' })
    ).rejects.toThrowError('Some Error')
    expect(fetch).toHaveBeenCalledTimes(5)
    expect(delay).toHaveBeenCalledTimes(4)
    expect(delay).toHaveBeenNthCalledWith(1, 5000)
    expect(delay).toHaveBeenNthCalledWith(2, 10_000)
    expect(delay).toHaveBeenNthCalledWith(3, 20_000)
    expect(delay).toHaveBeenNthCalledWith(4, 30_000)
  })

  test('fetchAllTxData several pages', async () => {
    mockFetch({ items: [{ id: 1 }, { id: 2 }] }, { items: [{ id: 3 }] }, { items: [] })
    expect(await client.fetchAllTxData(['abc', '123'], 2)).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 3 },
    ])
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      'https://localhost:9999/addrs/txs?noScriptSig=1&noAsm=1&noSpent=0&from=0&to=2',
      {
        body: '{"addrs":"abc,123"}',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        method: 'post',
        timeout: 10_000,
      }
    )
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      'https://localhost:9999/addrs/txs?noScriptSig=1&noAsm=1&noSpent=0&from=2&to=4',
      {
        body: '{"addrs":"abc,123"}',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        method: 'post',
        timeout: 10_000,
      }
    )
  })

  test('fetchUnconfirmedAncestorData', async () => {
    mockFetch({ abc: 123 })
    expect(await client.fetchUnconfirmedAncestorData('abc/1456')).toEqual({ abc: 123 })
    expect(fetch).toBeCalledWith(
      'https://localhost:9999/unconfirmed_ancestor/abc%2F1456',
      undefined
    )
  })
  test('fetchFeeRate', async () => {
    mockFetch({ abc: 123 })
    expect(await client.fetchFeeRate()).toEqual({ abc: 123 })
    expect(fetch).toBeCalledWith('https://localhost:9999/v2/fees', undefined)
  })
  test('broadcastTx', async () => {
    mockFetch({ txid: 123 })
    expect(await client.broadcastTx('abc/456')).toEqual(undefined)
    expect(fetch).toBeCalledWith('https://localhost:9999/tx/send', {
      body: '{"rawtx":"abc/456"}',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      method: 'post',
    })
  })

  test('getClaimable', async () => {
    mockFetch({ txid: 123 })
    expect(await client.getClaimable('abc/456')).toEqual({ txid: 123 })
    expect(fetch).toBeCalledWith('https://localhost:9999/addr/abc%2F456/claimable', undefined)
  })

  test('fetchRawTx', async () => {
    mockFetch({ rawtx: 123 })
    expect(await client.fetchRawTx('abc/456')).toEqual(123)
    expect(fetch).toBeCalledWith('https://localhost:9999/rawtx/abc%2F456', undefined)
  })

  test('getUnclaimed', async () => {
    mockFetch({ txid: 123 })
    expect(await client.getUnclaimed('abc/456')).toEqual({ txid: 123 })
    expect(fetch).toBeCalledWith('https://localhost:9999/addr/abc%2F456/unclaimed', undefined)
  })
})
