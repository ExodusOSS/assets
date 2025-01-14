import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('solana')
    expect(asset.ticker).toBe('SOL')
    expect(asset.displayTicker).toBe('SOL')
    expect(asset.units.SOL).toBe(9)
    expect(asset.assetType).toBe('SOLANA_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('SOLANA_TOKEN')
      expect(token.mintAddress).toBeDefined()
      expect(typeof token.mintAddress).toBe('string')
    })
  }

  // check that these urls exist!
  expect(asset.blockExplorer.addressUrl('CXPeim1wQMkcTvEHx9QdhgKREYYJD8bnaCCqPRwJ1to1')).toEqual(
    'https://solscan.io/account/CXPeim1wQMkcTvEHx9QdhgKREYYJD8bnaCCqPRwJ1to1'
  )
  expect(
    asset.blockExplorer.txUrl(
      '2HTM9c5vtjziwqRUt7U21kvCFzj1eepmAd58TBDgPXUrnvwWzctXZwhq4GLtEWuzH3mpsDXbDbfbECXVqsH2J7TT'
    )
  ).toEqual(
    'https://solscan.io/tx/2HTM9c5vtjziwqRUt7U21kvCFzj1eepmAd58TBDgPXUrnvwWzctXZwhq4GLtEWuzH3mpsDXbDbfbECXVqsH2J7TT'
  )
})
