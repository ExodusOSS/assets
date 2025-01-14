import { UnitType } from '@exodus/currency'

import FeeData from '../fee-data.js'

const units = {
  satoshis: 0,
  bits: 2,
  BTC: 8,
}

const currency = UnitType.create(units)

describe('create', () => {
  it('works', () => {
    const a = new FeeData({
      config: { fee: '1 BTC' },
      mainKey: 'fee',
      currency,
    })
    expect(a.fee).toEqual(currency.BTC(1))
  })

  it('Not convert to default unit', () => {
    const a = new FeeData({ config: { fee: '10000 satoshis' }, mainKey: 'fee', currency })
    expect(a.fee.toBaseString({ unit: true })).toEqual('10000 satoshis')
  })

  it('spread', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    expect({ ...a }).toEqual({
      fee: currency.BTC(1),
      origin: currency.BTC(1),
    })
  })
})

describe('update', () => {
  test('fee', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({ fee: '2 BTC' })
    expect(b).not.toBe(a)
    expect(b.fee).toEqual(currency.BTC(2))
  })

  test('multiplier', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({ multiplier: 3 })
    expect(b.fee).toEqual(currency.BTC(3))
  })

  test('origin', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({ multiplier: 2 }).update({ multiplier: 3 })
    expect(b.fee).toEqual(currency.BTC(3))

    const c = a.update({ multiplier: 2 }).update({ fee: '2 BTC' })
    expect(c.fee).toEqual(currency.BTC(4))
  })

  test('max', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({ multiplier: 3, max: '2 BTC' })
    expect(b.fee).toEqual(currency.BTC(2))
  })

  test('min', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({ multiplier: 3, min: '10 BTC' })
    expect(b.fee).toEqual(currency.BTC(10))
  })

  test('empty', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update()
    expect(b).toBe(a)
  })

  test('empty mainkey', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: null, currency })
    const b = a.update({ multiplier: 2 })
    expect(b.fee).toEqual(a.fee)
  })

  test('memoized', () => {
    const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
    const b = a.update({
      fee: '1 BTC',
    })
    expect(b === a).toBeTrue()
    const c = b.update({
      fee: '2 BTC',
    })
    expect(b === c).toBeFalse()
  })
})

test('toJSON', () => {
  const a = new FeeData({ config: { fee: '1 BTC' }, mainKey: 'fee', currency })
  expect(a.toJSON()).toEqual({
    fee: '1 BTC',
    origin: '1 BTC',
  })
})
