import { asset } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('aurora')
    expect(asset.ticker).toBe('AURORA')
    expect(asset.displayTicker).toBe('ETH')
    expect(asset.units.AURORA).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
    expect(asset.gasLimit).toBe(21_000)
    expect(asset.contractGasLimit).toBe(1_000_000)
  })
})
