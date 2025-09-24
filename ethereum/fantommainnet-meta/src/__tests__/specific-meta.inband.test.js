import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('fantommainnet')
    expect(asset.ticker).toBe('FTMMAINNET')
    expect(asset.displayTicker).toBe('FTM')
    expect(asset.units.FTMMAINNET).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('FTM_ERC20')
      expect(token.contract).toBe(token.addresses)
    })
  }
})
