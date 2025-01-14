/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
import { validateBaseAssetDef, validateTokenDef } from '@exodus/asset'
import { keyBy, mapValues, omit, pick } from '@exodus/basic-utils'
import { UnitType } from '@exodus/currency'
import assert from 'minimalistic-assert'

import { CT_UPDATEABLE_PROPERTIES } from './constants.js'
import { createCombined } from './create-combined.js'
import { assertNotAnObjectPrototypeProperty, validateCombinedAsset } from './validate-asset.js'

const connectProp = (asset, prop, value) => {
  if (asset[prop] === undefined && value !== undefined) asset[prop] = value
}

const defineAssetProps = ({ assets, asset }) => {
  Object.defineProperties(asset, {
    baseAsset: {
      get() {
        return assets[asset.baseAssetName || asset.name]
      },
      enumerable: true,
    },

    feeAsset: {
      get() {
        return assets[asset.feeAssetName || asset.baseAssetName || asset.name]
      },
      enumerable: true,
    },
  })

  if (asset.isCombined) {
    const combinedAssetNames = asset.combinedAssetNames.filter((assetName) => assets[assetName])
    Object.defineProperties(asset, {
      combinedAssetNames: {
        get() {
          return combinedAssetNames
        },
        enumerable: true,
      },
    })
    Object.defineProperties(asset, {
      combinedAssets: {
        get() {
          return combinedAssetNames.map((assetName) => assets[assetName])
        },
        enumerable: true,
      },
    })
  }

  // This will work as long as we only use createAssetRegistry({}).addCustomToken() to add non-builtin tokens
  asset.isBuiltIn = !asset.isCustomToken

  if (asset.isCustomToken) {
    coerceTokenProps(asset, asset.baseAsset)
  }
}

export function coerceTokenProps(asset, baseAsset) {
  const { units, properName, properTicker, ticker, color } = asset
  connectProp(asset, 'currency', UnitType.create(units))
  connectProp(asset, 'displayName', properName)
  connectProp(asset, 'displayTicker', properTicker || ticker)
  connectProp(asset, 'primaryColor', color || '#FFFFFF')
  connectProp(asset, 'chainBadgeColors', baseAsset.chainBadgeColors)
  connectProp(asset, 'displayNetworkName', baseAsset.displayNetworkName || baseAsset.displayName)
  connectProp(
    asset,
    'displayNetworkTicker',
    baseAsset.displayNetworkTicker || baseAsset.displayTicker
  )
  connectProp(asset, 'blockExplorer', baseAsset.blockExplorer) // this is OK in most cases
  connectProp(asset, 'gradientCoords', { x1: '0%', y1: '0%', x2: '100%', y2: '100%' })
  connectProp(asset, 'gradientColors', ['#EAEAEA', '#FFF'])

  // force proper{Name,Ticker} to be identical to display{Name,Ticker}
  const { displayName, displayTicker } = asset
  asset.properName = displayName
  asset.properTicker = displayTicker

  return asset
}

export const getListWithTokensLast = (assets) =>
  Object.values(assets).sort(
    (a, b) => Number(b.baseAssetName === b.name) - Number(a.baseAssetName === a.name)
  )

export function coerceAssetProps(asset, baseAsset) {
  // mock implementation
  return coerceTokenProps(asset, baseAsset)
}

export function assetsListToObject(assetsList) {
  return keyBy(assetsList, ({ name }) => name)
}

export function connectAssetsList(assetsList) {
  return connectAssets(assetsListToObject(assetsList))
}

export function connectAsset(asset) {
  return connectAssets({ [asset.name]: asset })[asset.name]
}

export function connectAssets(assets) {
  const _assets = mapValues(assets, (v) => ({ ...v }))
  getListWithTokensLast(_assets).forEach((asset) => defineAssetProps({ assets: _assets, asset }))
  return _assets
}

export function connectCombinedAssets({ combinedAssets, assets }) {
  const _combinedAssets = mapValues(combinedAssets, (v) => ({ ...v }))
  const _assets = { ..._combinedAssets, ...assets }
  Object.values(_combinedAssets).forEach((asset) => defineAssetProps({ assets: _assets, asset }))
  return _combinedAssets
}

export function addToken(assets, assetDef) {
  const { name, baseAssetName, info = Object.create(null) } = assetDef

  assertNotAnObjectPrototypeProperty(name)
  assert(name && !assets[name], `token ${name} already in registry`)
  assertNotAnObjectPrototypeProperty(baseAssetName)
  assert(
    baseAssetName && assets[baseAssetName],
    `base asset ${baseAssetName} not found for token ${name}`
  )
  assert(name !== baseAssetName, `token ${name} must be distinct from base asset`)

  const asset = { ...assetDef, toString: () => name, info }
  defineAssetProps({ assets, asset })
  validateTokenDef(asset)
  assets[name] = asset
  return asset
}

export function updateToken(assets, assetUpdate, updateableProps = CT_UPDATEABLE_PROPERTIES) {
  const { name } = assetUpdate

  assertNotAnObjectPrototypeProperty(name)
  assert(name && assets[name], `token ${name} not in the registry`)
  assert(name !== assets[name].baseAssetName, `token ${name} must be distinct from base asset`)
  assert(updateableProps, 'expected `updateableProps`')

  const asset = { ...assets[name], ...pick(assetUpdate, updateableProps) }
  validateTokenDef(asset)
  assets[name] = asset
  return asset
}

export function addNetwork(assets, baseAssetDef, tokenDefs = []) {
  const { name, info = Object.create(null) } = baseAssetDef
  assert(!assets[name], `asset ${name} already exists`)

  const asset = { ...baseAssetDef, toString: () => name, info }
  validateBaseAssetDef(asset)
  try {
    assets[name] = asset
    defineAssetProps({ assets, asset })
  } catch (e) {
    delete assets[name]
    throw e
  }

  // TODO: revert all if adding a token fails
  tokenDefs.forEach((token) => addToken(assets, token))
}

export function addCombinedAsset(assets, assetDef) {
  const { name, baseAssetName } = assetDef

  // check prerequisites in assetRegistry
  assertNotAnObjectPrototypeProperty(name)
  assert(name && !assets[name], `combined asset ${name} already in registry`)
  assertNotAnObjectPrototypeProperty(baseAssetName)
  assert(baseAssetName && name === baseAssetName, `combined asset ${name} invalid`)

  const asset = createCombined(assetDef, assets)
  try {
    assets[name] = asset
    defineAssetProps({ assets, asset })
    validateCombinedAsset(asset)
  } catch (e) {
    delete assets[name]
    throw e
  }

  return asset
}

export function updateCombinedAsset(
  assets,
  combinedAsset,
  { newMemberAsset } = Object.create(null)
) {
  const { name, isCombined } = combinedAsset
  assert(isCombined, `asset ${name} must be a combined asset`)
  assertNotAnObjectPrototypeProperty(name)
  assert(assets[name], `combined asset ${name} does not exist`)
  assert(assets[newMemberAsset.name], `asset ${newMemberAsset.name} does not exist`)
  assert(!newMemberAsset.isCombined, `asset ${newMemberAsset.name} must not be a combined asset`)

  const assetDef = omit(combinedAsset, ['baseAsset', 'feeAsset', 'combinedAssets'])
  assetDef.combinedAssetNames.push(newMemberAsset.name)

  const asset = createCombined(assetDef, assets)
  const orig = assets[name]
  try {
    assets[name] = asset
    defineAssetProps({ assets, asset })
    validateCombinedAsset(asset)
  } catch (e) {
    assets[name] = orig
    throw e
  }

  return asset
}
