import { asset } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('evm0x13')
    expect(asset.ticker).toBe('EVM0X13')
    expect(asset.displayTicker).toBe('SGB')
    expect(asset.units.EVM0X13).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
    expect(asset.gasLimit).toBe(21_000)
    expect(asset.contractGasLimit).toBe(1_000_000)
  })
})
