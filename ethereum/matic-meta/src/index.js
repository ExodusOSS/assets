import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'matic'
const displayName = 'Polygon'
const displayNetworkName = 'Polygon'
const ticker = 'MATICNATIVE'
const displayTicker = 'POL'
const displayNetworkTicker = 'POLYGON'
const primaryColor = '#9962f6'
const gradientColors = ['#5A63B8', '#C86DD7']
const gradientCoords = { x1: '19.031%', y1: '-66.682%', x2: '123.324%', y2: '91.487%' }
const chainBadgeColors = ['#904FFF', '#6A2FCC']
const chainId = 137

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  MATICNATIVE: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'MATIC_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://polygonscan.com/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://polygonscan.com/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Polygon (previously Matic Network) is a protocol and a framework for building and connecting Ethereum-compatible blockchain networks. Aggregating scalable solutions on Ethereum supporting a multi-chain Ethereum ecosystem.',
  reddit: 'https://www.reddit.com/r/0xPolygon/',
  twitter: 'https://twitter.com/0xPolygon',
  website: 'https://polygon.technology/',
  telegram: 'https://t.me/polygonofficial',
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
  blockExplorer: {
    ...token.blockExplorer,
    addressUrl: (address) => `https://polygonscan.com/address/${encodeURIComponent(address)}`,
  },
  contract: token.addresses,
  gasLimit: 120e3,
})

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
  tokensParams,
  tokenOverrides,
})

export default assetsList
