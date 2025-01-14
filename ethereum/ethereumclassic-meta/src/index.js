import { createMetaDef } from '@exodus/asset'

const name = 'ethereumclassic'
const displayName = 'Ethereum Classic'
const ticker = 'ETC'
const primaryColor = '#58D98C'
const gradientColors = ['#58D98C', '#599270']
const gradientCoords = { x1: '102%', y1: '101%', x2: '0%', y2: '0%' }
const chainBadgeColors = gradientColors
const chainId = 61

const gasLimit = 21e3 // enough to send ETH to a normal address
const contractGasLimit = 1e6 // used when estimateGas fails

const units = {
  wei: 0,
  Kwei: 3,
  Mwei: 6,
  Gwei: 9,
  szabo: 12,
  finney: 15,
  ETC: 18,
}

const assetType = 'ETHEREUM_LIKE'
const blockExplorer = {
  addressUrl: (address) => `https://gastracker.io/addr/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://gastracker.io/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Ethereum Classic is another version of Ethereum that split from ETH when The DAO, a decentralized venture capital fund built on Ethereum, was hacked. Advocates of ETH voted to restore hacked funds to The DAO members while ETC decided to stay closer to the blockchain principle of immutability, or irreversible transactions.',
  reddit: 'https://www.reddit.com/r/EthereumClassic/',
  twitter: 'https://twitter.com/eth_classic',
  website: 'https://ethereumclassic.org/',
  telegram: 'https://telegram.me/ethclassic',
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
  units,
}

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
})

export default assetsList
