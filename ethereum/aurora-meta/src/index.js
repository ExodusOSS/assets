import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'aurora'
const displayName = 'Ethereum'
const ticker = 'AURORA'
const displayTicker = 'ETH'
const displayNetworkTicker = 'AURORA'
const displayNetworkName = 'Aurora'
const primaryColor = '#8C93AF'
const gradientColors = ['#474A73', '#8C93AF']
const chainBadgeColors = ['#5deb5a', '#8AFF88']
const chainId = 1_313_161_554

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  AURORA: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'AURORA_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://explorer.aurora.dev/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://explorer.aurora.dev/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'AURORA is the governance token for the Aurora protocol, an Ethereum Virtual Machine that runs on the NEAR blockchain. Aurora helps Ethereum projects move to NEAR, plus powers new products with low fees, scalability, and compatibility.',
  website: 'https://aurora.dev/',
  twitter: 'https://twitter.com/auroraisnear',
  reddit: 'https://www.reddit.com/r/auroraisnear/',
  telegram: 'https://t.me/auroraisnear',
}

const assetParams = {
  assetType,
  blockExplorer,
  chainBadgeColors,
  chainId,
  displayName,
  displayNetworkName,
  displayNetworkTicker,
  displayTicker,
  gradientColors,
  info,
  name,
  primaryColor,
  ticker,
  tokenAssetType,
  units,
}

const tokenOverrides = (token) => ({
  ...token,
  assetId: token.addresses.current.toLowerCase(),
  contract: token.addresses,
})

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
  tokensParams,
  tokenOverrides,
})

export default assetsList
