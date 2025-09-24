import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'fantommainnet'
const displayName = 'Fantom'
const ticker = 'FTMMAINNET'
const displayTicker = 'FTM'
const primaryColor = '#13B5EC'
const gradientColors = ['#A0E7FF', '#13B5EC']
const chainBadgeColors = gradientColors
const chainId = 250

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  FTMMAINNET: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'FTM_ERC20'
const blockExplorer = {
  addressUrl: (accountId) =>
    `https://explorer.fantom.network/address/${encodeURIComponent(accountId)}`,
  txUrl: (txId) => `https://explorer.fantom.network/transactions/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Fantom is a high-performance, scalable, customizable, and secure smart-contract platform. Fantom is permissionless, decentralized, and open-source.',
  reddit: 'https://reddit.com/r/FantomFoundation',
  twitter: 'https://twitter.com/FantomFDN',
  website: 'https://fantom.foundation/',
  telegram: 'https://t.me/Fantom_English',
  discord: 'http://chat.fantom.network/',
}

const assetParams = {
  assetType,
  blockExplorer,
  chainBadgeColors,
  chainId,
  displayName,
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
