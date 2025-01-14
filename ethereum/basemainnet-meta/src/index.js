import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'basemainnet'
const displayName = 'Ethereum'
const ticker = 'BASE'
const displayTicker = 'ETH'
const displayNetworkTicker = 'BASE'
const displayNetworkName = 'Base'
const primaryColor = '#8C93AF'
const gradientColors = ['#474A73', '#8C93AF']
const gradientCoords = { x1: '17.71%', y1: '-46.968%', x2: '98.837%', y2: '152.777%' }
const chainBadgeColors = ['#0052FF', '#3A7AFF']
const chainId = 8453

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  BASE: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'BASE_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://basescan.org/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://basescan.org/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Base is an Ethereum Layer 2 (L2) chain that offers a safe, low-cost, developer-friendly way to build on-chain. Base is an L2 built on OP Stack in collaboration with Optimism.',
  website: 'https://base.org/',
  twitter: 'https://twitter.com/buildonbase',
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
