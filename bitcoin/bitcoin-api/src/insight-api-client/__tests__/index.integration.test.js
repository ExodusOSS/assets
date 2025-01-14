import InsightAPIClient from '../index.js'

jest.setTimeout(30_000)

const bitcoinBaseUrl = 'https://bitcoin.a.exodus.io/insight/'

test('fetch utxos from multiple addresses', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)
  const addrs = ['1HjdiADVHew97yM8z4Vqs4iPwMyQHkkuhj', '12owkvCcMPw5u1M692GbBFmpaMdX3kqXQM']
  const utxos = await insight.fetchUTXOs(addrs)

  expect(Array.isArray(utxos)).toEqual(true)
  expect(utxos.some((utxo) => utxo.address === addrs[0])).toEqual(true)
  expect(utxos.some((utxo) => utxo.address === addrs[1])).toEqual(true)
  expect(utxos.every((utxo) => typeof utxo.vout === 'number')).toEqual(true)
  expect(utxos.every((utxo) => typeof utxo.value === 'number')).toEqual(true)
  expect(utxos.every((utxo) => typeof utxo.txId === 'string')).toEqual(true)
  // height is null when it's an unconfirmed tx
  expect(utxos.every((utxo) => typeof utxo.height === 'number' || utxo.height === null)).toEqual(
    true
  )
})

test('isNetworkConnected fails for some reason', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)
  await expect(() => insight.isNetworkConnected()).rejects.toEqual(
    new Error(`${bitcoinBaseUrl}peer returned 404: Not Found. Body: Page not found.`)
  )
})

test('fetchBlockHeight success', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)
  const height = await insight.fetchBlockHeight()
  expect(height).toBeGreaterThan(70_000)
})

test('fetchUTXOs with invalid address', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)
  const addrs = ['invalidADdress']
  await expect(() => insight.fetchUTXOs(addrs)).rejects.toEqual(
    new Error(
      `${bitcoinBaseUrl}addrs/invalidADdress/utxo?noCache=1&assetNames= returned 500: Internal Server Error. Body: Invalid address: invalidADdress`
    )
  )
})

test('getUnclaimed not found', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)

  const address = '1HjdiADVHew97yM8z4Vqs4iPwMyQHkkuhj'
  await expect(() => insight.getUnclaimed(address)).rejects.toEqual(
    new Error(
      `${bitcoinBaseUrl}addr/1HjdiADVHew97yM8z4Vqs4iPwMyQHkkuhj/unclaimed returned 404: Not Found. Body: Page not found.`
    )
  )
})

test('getClaimable not found', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)
  const address = '1HjdiADVHew97yM8z4Vqs4iPwMyQHkkuhj'
  await expect(() => insight.getClaimable(address)).rejects.toEqual(
    new Error(
      `${bitcoinBaseUrl}addr/1HjdiADVHew97yM8z4Vqs4iPwMyQHkkuhj/claimable returned 404: Not Found. Body: Page not found.`
    )
  )
})
test('fetchUnconfirmedAncestorData with invalid tx id', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)

  await expect(() => insight.fetchUnconfirmedAncestorData('someId')).rejects.toEqual(
    new Error(
      `${bitcoinBaseUrl}unconfirmed_ancestor/someId returned 500: Internal Server Error. Body: Invalid hash: someId`
    )
  )
})

test('fetchUnconfirmedAncestorData with valid tx id', async () => {
  const insight = new InsightAPIClient(bitcoinBaseUrl)

  const data = await insight.fetchUnconfirmedAncestorData(
    '346da91286a6af5466a5494d011b7cd4c8364cf057f540af8302a9736438e6af'
  )
  expect(data).toEqual({ fees: 0, size: 0 })
})

test('fetch a group of transactions for a group of addresses', async () => {
  const insight = new InsightAPIClient('https://dash.a.exodus.io/insight/')
  const addrs = ['XsoSi8EabUk7QGEmAyumEjmMVDpXrRHNtY', 'XtNHpsgFLHVLRDnb4u91fH7y1hm8F2kwrn']
  const n = 15
  const txData = await insight.fetchTxData(addrs, { from: 0, to: n })

  expect(Array.isArray(txData.items)).toEqual(true)
  expect(txData.items.length).toEqual(n)
})

test('fetchTxData when valid', async () => {
  const insight = new InsightAPIClient('https://bitcoin.a.exodus.io/insight/')
  const txId = 'e950ff090d875fb296c91fdafa79e026cad9bf99a73e64c688b015debf1b142f'
  const txData = await insight.fetchTxObject(txId)
  expect(txData.txid).toEqual(txId)
  expect(txData.blockheight).toEqual(778_445)
  expect(txData.vin.length).toEqual(1)
  expect(txData.vout.length).toEqual(2)
})

test('fetchTxData when does not exist', async () => {
  const insight = new InsightAPIClient('https://bitcoin.a.exodus.io/insight/')
  const txId = 'aaaaff090d875fb296c91fdafa79e026cad9bf99a73e64c688b015debf1b142f'
  const txData = await insight.fetchTxObject(txId)
  expect(txData).toEqual(null)
})
