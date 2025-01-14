import { UnitType } from '@exodus/currency'

const name = 'bitcoinregtest'
const displayName = 'Bitcoin Regtest'
const ticker = 'BTCR'
const displayTicker = 'BTCR'
const displayNetworkTicker = displayTicker
const displayNetworkName = displayName
const baseAssetName = name
const primaryColor = '#FE9D39'
const gradientColors = ['#FE9D39', '#FFC82D']
const gradientCoords = { x1: '115.077%', y1: '77.227%', x2: '27.227%', y2: '34.923%' }
const chainBadgeColors = ['#FFBB21', '#FF9400']

const units = {
  satoshis: 0,
  bits: 2,
  BTCR: 8,
}
const currency = UnitType.create(units)

const assetType = 'BITCOIN_LIKE'
const blockExplorer = {
  addressUrl: (address) => `https://exodus.com`,
  txUrl: (txId) => `https://exodus.com`,
}
const info = {}

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
}

export default [asset]
