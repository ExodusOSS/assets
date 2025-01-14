import InsightAPIClient from '../index.js'

test('fetch tx data', async () => {
  const insight = new InsightAPIClient('https://bitcoin.a.exodus.io/insight/')
  const knownTx = '75b8785cf2b2789cc86b235cc0bd776e04c73aa1ab1c8315dbf79790b64dc8e5'
  const invalidTx = '65b8785cf2b2789cc86b235cc0bd776e04c73aa1ab1c8315dbf79790b64dc8e5'

  const knownTxData = await insight.fetchTx(knownTx)
  expect(knownTxData.txid).toEqual(knownTx)

  const unknownTxData = await insight.fetchTx(invalidTx)
  expect(unknownTxData).toEqual(null)
})
