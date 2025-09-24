import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('matic')
    expect(asset.ticker).toBe('MATICNATIVE')
    expect(asset.displayTicker).toBe('POL')
    expect(asset.displayNetworkTicker).toBe('POL')
    expect(asset.units.MATICNATIVE).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('MATIC_ERC20')
      expect(token.contract).toBe(token.addresses)
    })
  }
})
