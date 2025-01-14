import { UnitType } from '@exodus/currency'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { cloneDeep } = lodash

const ensureField = (key, assetDef, assets) => {
  const primaryAssetDef = assets[assetDef.combinedAssetNames[0]]
  return !assetDef[key] && primaryAssetDef[key]
    ? { [key]: cloneDeep(primaryAssetDef[key]) }
    : Object.create(null)
}

export function createCombined(assetDef, assets) {
  const { name, ticker, displayName, displayTicker, assetType, units, combinedAssetNames } =
    assetDef
  assert(
    name && ticker && displayName && displayTicker && assetType && units && combinedAssetNames,
    `mandatory filed missing for combined asset ${JSON.stringify(assetDef)}`
  )

  const cloned = cloneDeep(assetDef)
  return {
    ...cloned,
    // name,
    // ticker,
    // displayName,
    // displayTicker,
    // assetType
    // units,
    // combinedAssetNames,
    baseAssetName: name,
    blockExplorer: Object.create(null),
    currency: UnitType.create(units),
    displayNetworkName: cloned.displayNetworkName || displayName,
    displayNetworkTicker: cloned.displayNetworkTicker || ticker,
    toString: () => name,
    isCombined: true,
    ...ensureField('chainBadgeColors', cloned, assets),
    ...ensureField('gradientColors', cloned, assets),
    ...ensureField('gradientCoords', cloned, assets),
    ...ensureField('info', cloned, assets),
    ...ensureField('primaryColor', cloned, assets),

    properName: displayName, // deprecated,
    properTicker: displayTicker, // deprecated,
  }
}
