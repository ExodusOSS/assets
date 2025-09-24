import { updateToken } from '../index.js'
import assets from './_assets.js'

const expectedOriginal = {
  name: 'ach_ethereum_fbad19a6',
  displayName: 'Alchemy Pay',
  displayTicker: 'ACH',
  ticker: 'ACHethereumFBAD19A6',
  decimals: 8,
  addresses: { current: '0xed04915c23f00a313a544955524eb7dbd823143d' },
  info: {
    description:
      'ACH is the utility token that powers Alchemy Pay, a payments platform that supports transactions with a wide variety of fiat and cryptocurrencies. It connects developers, sellers, and organizations to Web3 in many ways, such as allowing payments to be made in crypto but received in fiat.',
    reddit: 'https://reddit.com/r/AlchemyPay/',
    twitter: 'https://twitter.com/AlchemyPay',
    website: 'https://alchemypay.org/',
  },
  primaryColor: '#4471ED',
  gradientColors: ['#0D48EA', '#4471ED'],
}

const expectedUpdated = {
  name: 'ach_ethereum_fbad19a6',
  displayName: 'Alchemy Pay Foo',
  displayTicker: 'ACHOO',
  ticker: 'ACHethereumFBAD19A6',
  decimals: 8,
  addresses: { current: '0xed04915c23f00a313a544955524eb7dbd823143d' },
  info: {
    description: 'SNAFU',
    reddit: 'https://reddit.com/r/SNAFU/',
    twitter: 'https://twitter.com/SNAFU',
    website: 'https://alchemypay.org/',
  },
  primaryColor: '#FFFFFF',
  gradientColors: ['#0D48EA', '#FFFFFF'],
}

test('update token', () => {
  expect(assets.ach_ethereum_fbad19a6).toMatchObject(expectedOriginal)
  const assetUpdate = {
    name: expectedUpdated.name,
    displayName: expectedUpdated.displayName,
    displayTicker: expectedUpdated.displayTicker,
    ticker: 'ACHethereumFBAD19A6FF', // will not be updated (see expectedUpdated.ticker)
    decimals: 16, // will not be updated (see expectedUpdated.decimals)
    info: { ...expectedUpdated.info },
    primaryColor: expectedUpdated.primaryColor,
    gradientColors: expectedUpdated.gradientColors,
  }
  updateToken(assets, assetUpdate)
  expect(assets.ach_ethereum_fbad19a6).toMatchObject(expectedUpdated)
})
