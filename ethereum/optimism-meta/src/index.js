import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'optimism'
const displayName = 'Ethereum'
const ticker = 'OPETH'
const displayTicker = 'ETH'
const displayNetworkTicker = 'OP'
const displayNetworkName = 'Optimism'
const primaryColor = '#8C93AF'
const gradientColors = ['#474A73', '#8C93AF']
const gradientCoords = { x1: '17.71%', y1: '-46.968%', x2: '98.837%', y2: '152.777%' }
const chainBadgeColors = ['#FF0420', '#A10013']
const chainId = 10

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  OPETH: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'OPT_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://optimistic.etherscan.io/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://optimistic.etherscan.io/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description: 'Optimism is a low-cost and lightning-fast Ethereum L2 blockchain.',
  website: 'https://www.optimism.io/',
  twitter: 'https://twitter.com/optimismFND',
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
    addressUrl: (address) =>
      `https://optimistic.etherscan.io/token/${encodeURIComponent(token.addresses.current)}?a=${encodeURIComponent(address)}`,
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
