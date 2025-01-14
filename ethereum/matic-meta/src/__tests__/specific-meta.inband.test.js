import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('matic')
    expect(asset.ticker).toBe('MATICNATIVE')
    expect(asset.displayTicker).toBe('POL')
    expect(asset.units.MATICNATIVE).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
    expect(asset.gasLimit).toBe(21_000)
    expect(asset.contractGasLimit).toBe(1_000_000)
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('MATIC_ERC20')
      expect(token.gasLimit).toBe(120_000)
      expect(token.contract).toBe(token.addresses)
    })
  }
})
