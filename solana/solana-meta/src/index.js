import { createMetaDef } from '@exodus/asset'
import { UnitType } from '@exodus/currency'

import tokensParams from './tokens.js'

const name = 'solana'
const displayName = 'Solana'
const ticker = 'SOL'
const displayTicker = 'SOL'
const displayNetworkTicker = displayTicker
const displayNetworkName = displayName
const baseAssetName = name
const primaryColor = '#14F195'
const gradientColors = ['#14F195', '#9BFFD7']
const gradientCoords = { x1: '12.519%', y1: '28.482%', x2: '27.289%', y2: '11.831%' }
const chainBadgeColors = ['#0CF3A8', '#D823FE']

const units = {
  Lamports: 0,
  SOL: 9,
}
const currency = UnitType.create(units)

const assetType = 'SOLANA_LIKE'
const tokenAssetType = 'SOLANA_TOKEN'

const blockExplorer = {
  addressUrl: (address) => `https://solscan.io/account/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://solscan.io/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    "Solana is a high-performance blockchain, taking on one of tech's biggest challenges: scaling blockchain for global adoption.",
  reddit: 'https://www.reddit.com/r/solana/',
  twitter: 'https://twitter.com/solana',
  website: 'https://solana.com/',
  telegram: 'https://t.me/solana',
}

const assetParams = {
  assetType,
  baseAssetName,
  blockExplorer,
  chainBadgeColors,
  currency,
  displayName,
  displayNetworkName,
  displayNetworkTicker,
  displayTicker,
  gradientColors,
  gradientCoords,
  tokenAssetType,
  info,
  name,
  primaryColor,
  ticker,
  units,
}

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
  tokensParams,
})

export default [asset, ...tokens]
