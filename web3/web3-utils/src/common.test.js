import { createCurrency, hexToBN } from './common.js'

describe('hexToBN', () => {
  it('creates a big number instance from a hex prefixed string', () => {
    const bn = hexToBN('0xF')
    expect(bn.toString(10)).toEqual('15')
  })

  it('creates a big number instance from a string not starting with 0x', () => {
    const bn = hexToBN('F')
    expect(bn.toString(10)).toEqual('15')
  })
})

describe('createCurrency', () => {
  it('creates a proper Number Unit instance', () => {
    const denominator = 8 // 1 BTC = 10^8 satoshis;
    const bitcoin = createCurrency({
      amount: 10 ** 8,
      symbol: 'BTC',
      denominator,
    })
    expect(bitcoin.toString()).toEqual(`${10 ** 8} base`)
    expect(bitcoin.toString({ unitInstance: bitcoin.defaultUnit })).toEqual(
      `1 BTC`,
    )
  })

  it('takes the supplied "base" parameter into account', () => {
    const denominator = 8 // 1 BTC = 10^8 satoshis;
    const bitcoin = createCurrency({
      amount: 10 ** 8,
      base: 'satoshi',
      symbol: 'BTC',
      denominator,
    })
    expect(bitcoin.toString()).toEqual(`${10 ** 8} satoshi`)
    expect(bitcoin.toString({ unitInstance: bitcoin.defaultUnit })).toEqual(
      `1 BTC`,
    )
  })
})
