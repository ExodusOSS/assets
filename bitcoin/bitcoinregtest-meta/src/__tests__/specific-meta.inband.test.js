import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('bitcoinregtest')
    expect(asset.ticker).toBe('BTCR')
    expect(asset.displayTicker).toBe('BTCR')
    expect(asset.units.BTCR).toBe(8)
    expect(asset.assetType).toBe('BITCOIN_LIKE')
  })

  it(`Asset bitcoinregtest has no tokens`, () => {
    expect(tokens).not.toBeDefined()
  })
})
