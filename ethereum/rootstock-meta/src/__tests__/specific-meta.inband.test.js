import { asset } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('rootstock')
    expect(asset.ticker).toBe('RSK')
    expect(asset.displayTicker).toBe('RBTC')
    expect(asset.units.RSK).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
    expect(asset.gasLimit).toBe(21_000)
    expect(asset.contractGasLimit).toBe(1_000_000)
  })
})
