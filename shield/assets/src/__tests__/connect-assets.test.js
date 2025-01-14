import { mapValues } from '@exodus/basic-utils'

import { getListWithTokensLast } from '../connect-assets.js'

const assets = {
  bar: { baseAssetName: 'foo' },
  foo: { baseAssetName: 'foo' },
  baz: { baseAssetName: 'foo' },
  snafu: { baseAssetName: 'snafu' },
}

const expected = ['foo', 'snafu', 'bar', 'baz']

test('test that assets get sorted correctly', () => {
  const sorted = getListWithTokensLast(mapValues(assets, (asset, name) => ({ name, ...asset })))
  expect(sorted.map(({ name }) => name)).toStrictEqual(expected)
})
