import { keyBy } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'

import assetsList, { asset, tokens } from '../index.js'

const assets = keyBy(assetsList, 'name')

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('ethereum')
    expect(asset.ticker).toBe('ETH')
    expect(asset.displayTicker).toBe('ETH')
    expect(asset.units.ETH).toBe(18)
    expect(asset.assetType).toBe('ETHEREUM_LIKE')
    expect(asset.gasLimit).toBe(21_000)
    expect(asset.contractGasLimit).toBe(1_000_000)

    expect(asset.blockExplorer.addressUrl('0x12345')).toEqual(
      'https://etherscan.io/address/0x12345'
    )

    expect(asset.blockExplorer.txUrl('0x456')).toEqual('https://etherscan.io/tx/0x456')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('ETHEREUM_ERC20')
      expect(token.gasLimit).toBe(120_000)
      expect(token.contract).toBe(token.addresses)
      expect(token.blockExplorer.addressUrl('0x12345')).toEqual(
        `https://etherscan.io/token/${token.addresses.current}?a=0x12345`
      )
    })
  }

  // ticker alias tests

  it('ticker alias is the middle one', () => {
    expect(Object.keys(assets.aragon.units)).toStrictEqual(['base', 'ANT', 'ANTv1'])
    expect(Object.keys(assets.augur.units)).toStrictEqual(['base', 'REP', 'REPv1'])
  })

  it('ticker alias is not used as the default unit', () => {
    expect(
      UnitType.create(assets.aragon.units).defaultUnit(1).toDefaultString({ unit: true })
    ).toBe('1 ANTv1')
    expect(UnitType.create(assets.augur.units).defaultUnit(1).toDefaultString({ unit: true })).toBe(
      '1 REPv1'
    )
  })
})
