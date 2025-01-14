import { createMetaDef } from '@exodus/asset'

import tokensParams from './tokens.js'

const name = 'ethereum'
const displayName = 'Ethereum'
const ticker = 'ETH'
const primaryColor = '#8C93AF'
const gradientColors = ['#474A73', '#8C93AF']
const gradientCoords = { x1: '17.71%', y1: '-46.968%', x2: '98.837%', y2: '152.777%' }
const chainBadgeColors = ['#FFFFFF', '#D6DAFF']
const chainId = 1

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  ETH: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'ETHEREUM_ERC20'
const blockExplorer = {
  addressUrl: (address) => `https://etherscan.io/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://etherscan.io/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Ethereum is a decentralized computing platform that runs smart contracts, which are contracts that execute without human intervention. ETH popularized the idea of using the blockchain for programmable transactions instead of only for money transfers. The platform is used for crowdfunding (ICOs), the creation of new digital assets, and more.',
  reddit: 'https://www.reddit.com/r/ethereum/',
  twitter: 'https://twitter.com/ethereum',
  website: 'https://ethereum.org/',
}

const assetParams = {
  assetType,
  blockExplorer,
  chainBadgeColors,
  chainId,
  contractGasLimit,
  displayName,
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
      `https://etherscan.io/token/${encodeURIComponent(token.addresses.current)}?a=${encodeURIComponent(address)}`,
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
