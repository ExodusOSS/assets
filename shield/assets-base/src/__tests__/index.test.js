import lodash from 'lodash'

import assets from '../index.js'

const { groupBy, mapValues, omitBy } = lodash

test('no duplicated ticker', () => {
  const duplicatedTickers = omitBy(
    mapValues(groupBy(Object.values(assets), 'ticker'), (array) => array.length),
    (total) => total === 1
  )
  expect(duplicatedTickers).toEqual({})
})
