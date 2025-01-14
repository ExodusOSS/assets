import { UnitType } from '@exodus/currency'

import mapCurrency from '../map-currency.js'

const usd = UnitType.create({
  dime: 0,
  dollar: 1,
})

const cny = UnitType.create({ cny: 0 })

test('works', () => {
  const result = mapCurrency(
    {
      a: 1,
      b: '2 dime',
      c: '3 dollar',
      d: '4 ETH',
      e: usd.dime(5),
      extraWhitespace: ' 6 dollar   ',
    },
    [cny, usd],
    ['b', 'c', 'e', 'extraWhitespace']
  )

  expect(result).toEqual({
    a: 1,
    b: usd.dime(2),
    c: usd.dollar(3),
    d: '4 ETH',
    e: usd.dime(5),
    extraWhitespace: usd.dollar(6),
  })
})

test('unitKeysGuard', () => {
  expect(() => {
    mapCurrency(
      {
        fee: '1 WrongUnit',
      },
      [usd],
      ['a', 'fee']
    )
  }).toThrow(/invalid value/)
})
