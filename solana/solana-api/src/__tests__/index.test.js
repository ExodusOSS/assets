import serverApi from '../index.js'

test('default export should be the solana server api instance', () => {
  expect(serverApi).toBeDefined()
  expect(serverApi.rpcUrl).toBeDefined()
  expect(serverApi.tokens).toBeDefined()
})
