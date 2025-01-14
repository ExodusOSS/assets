import { UnitType } from '@exodus/currency'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { extractUnits } from './utils.js'
import { validateBaseAssetDef, validateTokenDef } from './validation.js'

const { isNumber } = lodash

const defaultChainBadgeColors = ['#EAEAEA', '#FFF']
const defaultGradientColors = defaultChainBadgeColors
const defaultGradientCoords = { x1: '0%', y1: '0%', x2: '100%', y2: '100%' }

const assertPresence = (obj, list) => {
  return list.every((field) =>
    assert(Object.prototype.hasOwnProperty.call(obj, field), `"${field}" is missing`)
  )
}

/**
 * Create an asset metadata definition
 * @param {String} name unique asset name (mandatory)
 * @param {String} displayName asset display name (mandatory)
 * @param {String} ticker unique asset ticker (mandatory)
 * @param {Object} units asset units object (mandatory). e.g. `{ base: 0, FOO: 18 }`
 * @param {String} assetType asset type (mandatory)
 * @param {Object} blockExploreer block explorer functions (mandatory) e.g. `{ txUrl: (txId) => 'xxx', addressUrl(addr) => 'yyy' }`
 * @param {String} displayTicker
 * @param {String} displayNetworkName
 * @param {String} displayNetworkTicker
 * @param {Array} chainBadgeColors
 * @param {Array} gradientColors
 * @param {Object} gradientCoords
 * @param {Object} info
 * @param {String} primaryColor
 * @param {String} tokenAssetType the `assetType` assigned to tokens
 * @returns {Object} asset definition
 */
export const createBaseAssetDef = (params) => {
  assertPresence(params, ['name', 'displayName', 'ticker', 'units', 'assetType'])

  const { name, displayName, ticker, units, ...rest } = params

  const currency = UnitType.create(units)
  const displayTicker = rest.displayTicker || ticker
  const displayNetworkName = rest.displayNetworkName || displayName
  const displayNetworkTicker = rest.displayNetworkTicker || displayTicker
  const chainBadgeColors = rest.chainBadgeColors || defaultChainBadgeColors
  const gradientColors = rest.gradientColors || defaultGradientColors
  const gradientCoords = rest.gradientCoords || defaultGradientCoords
  const primaryColor = rest.primaryColor || '#EAEAEA'
  const info = rest.info || Object.create(null)

  const assetDef = {
    ...rest,
    // assetType
    baseAssetName: name,
    // blockExplorer
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
    properName: displayName, // deprecated
    properTicker: displayTicker, // deprecated
    ticker,
    toString: () => name,
    units,
  }

  validateBaseAssetDef(assetDef)

  return assetDef
}

/**
 * Create a token metadata definition
 * @param {Object} asset the base asset of this token, created with createBaseAssetDef
 * @param {String} token.name unique asset name (mandatory)
 * @param {String} token.displayName asset display name (mandatory)
 * @param {String} token.ticker unique asset ticker (mandatory)
 * @param {Object} token.units asset units object (mandatory unless decimals is supplied). e.g. `{ base: 0, FOO: 18 }`
 * @param {Number} token.decimals asset decimal places (mandatory unless units is supplied).
 * @param {String} token.assetType asset type (mandatory)
 * @param {Object} token.blockExploreer
 * @param {String} token.displayTicker
 * @param {Array} token.chainBadgeColors
 * @param {Array} token.gradientColors
 * @param {Object} token.gradientCoords
 * @param {Object} token.info
 * @param {String} token.primaryColor
 * @param {Function} tokenOverrides
 * @param {Object} options
 * @returns {Object} asset definition
 */
export const createTokenDef = ({ asset, token, tokenOverrides = (t) => t, options = {} }) => {
  assertPresence(token, ['name', 'displayName', 'ticker'])
  assert(token.units || isNumber(token.decimals), 'token requires either "units" or "decimals"')

  const { displayName } = token
  const { baseUnitName } = options

  const units = extractUnits({ token, baseUnitName })
  const currency = UnitType.create(units)
  const displayTicker = token.displayTicker || token.ticker
  const chainBadgeColors = token.chainBadgeColors || token.gradientColors || asset.chainBadgeColors
  const gradientColors = token.gradientColors || asset.gradientColors
  const gradientCoords = token.gradientCoords || asset.gradientCoords
  const primaryColor = token.primaryColor || asset.primaryColor
  const info = token.info || Object.create(null)

  const tokenDef = tokenOverrides({
    ...token,
    assetType: asset.tokenAssetType || token.assetType, // fall-back to legacy token.assetType
    baseAssetName: asset.name,
    blockExplorer: asset.blockExplorer,
    chainBadgeColors,
    currency,
    // decimals,
    // displayName,
    displayNetworkName: asset.displayNetworkName,
    displayNetworkTicker: asset.displayNetworkTicker,
    displayTicker,
    gradientColors,
    gradientCoords,
    info,
    // name,
    primaryColor,
    properName: displayName, // deprecated
    properTicker: displayTicker, // deprecated
    // ticker,
    toString: () => token.name,
    units,
  })

  validateTokenDef(tokenDef)

  return tokenDef
}

export const createMetaDef = ({ assetParams, tokensParams = [], tokenOverrides, options }) => {
  const asset = createBaseAssetDef(assetParams)
  const tokens = tokensParams.map((token) =>
    createTokenDef({ asset, token, tokenOverrides, options })
  )
  return { asset, tokens, assetsList: [asset, ...tokens] }
}
