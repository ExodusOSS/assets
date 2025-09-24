import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'rootstock'
const displayName = 'Rootstock BTC'
const ticker = 'RSK'
const displayTicker = 'RBTC'
const displayNetworkTicker = 'RSK'
const displayNetworkName = 'Rootstock'
const primaryColor = '#FF9931'
const gradientColors = ['#FF9931', '#7CDB9A']
const chainBadgeColors = ['#FF9931', '#7CDB9A']
const chainId = 30

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  RSK: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'RSK_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://explorer.rsk.co/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://explorer.rsk.co/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'RBTC is used to pay transaction fees on the Rootstock network, an open-source sidechain that brings Bitcoin and DeFi together with smart contracts. RBTC is pegged 1:1 with Bitcoin.',
  website: 'https://rootstock.io/',
  twitter: 'https://twitter.com/rootstock_io',
  reddit: 'https://www.reddit.com/r/rootstock/',
  telegram: 'https://t.me/RSKsmart',
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
