import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('bitcoin')
    expect(asset.ticker).toBe('BTC')
    expect(asset.displayTicker).toBe('BTC')
    expect(asset.units.BTC).toBe(8)
    expect(asset.assetType).toBe('BITCOIN_LIKE')
    expect(asset.displayName).toBe('Bitcoin')
    expect(asset.displayName).toEqual(asset.properName)
  })

  it(`Asset bitcoin has no tokens`, () => {
    expect(tokens).not.toBeDefined()
  })
})
