import tokensParams from './tokens.js'

import { createMetaDef } from '@exodus/asset'

const name = 'aurora'
const displayName = 'Ethereum'
const ticker = 'AURORA'
const displayTicker = 'ETH'
const displayNetworkTicker = 'AURORA'
const displayNetworkName = 'Aurora'
const primaryColor = '#8C93AF'
const gradientColors = ['#474A73', '#8C93AF']
const gradientCoords = { x1: '17.71%', y1: '-46.968%', x2: '98.837%', y2: '152.777%' }
const chainBadgeColors = ['#5deb5a', '#8AFF88']
const chainId = 1_313_161_554

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

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
  contractGasLimit,
  displayName,
  displayNetworkName,
  displayNetworkTicker,
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
