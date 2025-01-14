import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'fantommainnet'
const displayName = 'Fantom'
const ticker = 'FTMMAINNET'
const displayTicker = 'FTM'
const primaryColor = '#13B5EC'
const gradientColors = ['#A0E7FF', '#13B5EC']
const gradientCoords = { x1: '119.625%', y1: '113.067%', x2: '0%', y2: '0%' }
const chainBadgeColors = gradientColors
const chainId = 250

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

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
  addressUrl: (accountId) => `https://ftmscan.com/address/${encodeURIComponent(accountId)}`,
  txUrl: (txId) => `https://ftmscan.com/tx/${encodeURIComponent(txId)}`,
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
  contractGasLimit,
  displayName,
  displayTicker,
  gasLimit,
  gradientColors,
  gradientCoords,
  info,
  name,
  primaryColor,
  ticker,
  tokenAssetType,
  units,
}

const tokenOverrides = (token) => ({
  ...token,
  contract: token.addresses,
  gasLimit: 120e3,
})

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
  tokensParams,
  tokenOverrides,
})

export default assetsList
