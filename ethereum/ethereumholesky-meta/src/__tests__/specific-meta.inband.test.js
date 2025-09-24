import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('ethereumholesky')
    expect(asset.ticker).toBe('HOETH')
    expect(asset.displayTicker).toBe('ETH')
    expect(asset.units.HOETH).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('ETHEREUM_HOLESKY_ERC20')
      expect(token.contract).toBe(token.addresses)
    })
  }
})
