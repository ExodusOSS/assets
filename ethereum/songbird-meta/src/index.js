import { createMetaDef } from '@exodus/asset'

const name = 'evm0x13'
const displayName = 'Songbird'
const ticker = 'EVM0X13'
const displayTicker = 'SGB'
const displayNetworkTicker = 'SGB'
const displayNetworkName = 'Songbird'
const primaryColor = '#E61E57'
const gradientColors = ['#E61E57', '#FF5485']
const gradientCoords = { x1: '0%', y1: '0%', x2: '20%', y2: '20%' }
const chainBadgeColors = ['#E61E57', '#E61E57']
const chainId = 19

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  EVM0X13: 18,
}

const assetType = 'ETHEREUM_LIKE'
const tokenAssetType = 'EVM_0X13_TOKEN'
const blockExplorer = {
  addressUrl: (address) => `https://songbird.flarescan.com/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://songbird.flarescan.com/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    "Songbird is the canary network for Flare, the blockchain built for universal connectivity. The first new blockchain interoperability primitive, Flare's State Connector, brings better bridging, full cross-chain composability and seamless decentralized integration with Web2 data.",
  twitter: 'https://twitter.com/FlareNetworks',
  discord: 'https://discord.com/invite/XqNa7Rq',
  reddit: 'https://reddit.com/r/FlareNetworks',
  telegram: 'https://t.me/FlareNetwork',
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
})

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
  tokenOverrides,
})

export default assetsList
