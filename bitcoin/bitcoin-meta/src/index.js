import { UnitType } from '@exodus/currency'

const name = 'bitcoin'
const displayName = 'Bitcoin'
const ticker = 'BTC'
const displayTicker = 'BTC'
const displayNetworkTicker = displayTicker
const displayNetworkName = displayName
const baseAssetName = name
const primaryColor = '#FFC82D'
const gradientColors = ['#FFC82D', '#FE9D39']
const gradientCoords = { x1: '115.077%', y1: '77.227%', x2: '27.227%', y2: '34.923%' }
const chainBadgeColors = ['#FFBB21', '#FF9400']

const units = {
  satoshis: 0,
  bits: 2,
  BTC: 8,
}
const currency = UnitType.create(units)

const useBip84 = true

const assetType = 'BITCOIN_LIKE'
const blockExplorer = {
  addressUrl: (address) => `https://mempool.space/address/${address}`,
  txUrl: (txId) => `https://mempool.space/tx/${txId}`,
}
const info = {
  description:
    'The cryptocurrency that started it all, Bitcoin is the first digital currency to solve the “double spending” or counterfeiting problem without the aid of a central authority, such as a bank or a government, making Bitcoin truly peer-to-peer.',
  reddit: 'https://www.reddit.com/r/Bitcoin/',
  website: 'https://www.bitcoin.org/',
}

export const tokens = undefined
export const asset = {
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
  info,
  name,
  primaryColor,
  properName: displayName, // deprecated,
  properTicker: displayTicker, // deprecated,
  ticker,
  toString: () => name,
  units,
  useBip84,
}

export default [asset]
