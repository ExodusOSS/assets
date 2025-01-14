import { AssetError } from '../asset-error.js'

test('Can create AssetError', () => {
  const properties = { address: 'abc' }
  const error = new AssetError('no-balance-code', properties)
  // 'no-balance-code' would be a key for the user message in the wallet, probably internationalized
  expect(error.message).toEqual('no-balance-code')
  expect(error.code).toEqual('no-balance-code')
  expect(error.properties).toEqual(properties)

  expect(Object.keys(error)).toEqual(['code', 'properties'])
  expect(error.constructor.name).toEqual('AssetError')
  expect(AssetError.name).toEqual('AssetError')
})
