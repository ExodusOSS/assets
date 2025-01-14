import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('bitcointestnet')
    expect(asset.ticker).toBe('BTCT')
    expect(asset.displayTicker).toBe('BTCT')
    expect(asset.units.BTCT).toBe(8)
    expect(asset.assetType).toBe('BITCOIN_LIKE')
  })

  it(`Asset bitcointestnet has no tokens`, () => {
    expect(tokens).not.toBeDefined()
  })
})
