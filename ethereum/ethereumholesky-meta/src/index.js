import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'ethereumholesky'
const displayName = 'Ethereum Holesky'
const ticker = 'HOETH'
const displayTicker = 'ETH'
const displayNetworkTicker = 'HOETH'
const displayNetworkName = 'Holesky'
const primaryColor = '#8C93AF'
const gradientColors = ['#EAEAEA', '#FFF']
const gradientCoords = { x1: '19.031%', y1: '-66.682%', x2: '123.324%', y2: '91.487%' }
const chainBadgeColors = gradientColors
const chainId = 17_000

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  HOETH: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'ETHEREUM_HOLESKY_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://holesky.etherscan.io/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://holesky.etherscan.io/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description: 'ETH testnet asset for the Holesky network.',
  website: 'https://github.com/eth-clients/holesky/',
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
      `https://arbiscan.io/token/${encodeURIComponent(token.addresses.current)}?a=${encodeURIComponent(address)}`,
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
