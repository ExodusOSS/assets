import { UnitType } from '@exodus/currency'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { cloneDeep } = lodash

export function createCombined(assetDef) {
  const {
    name,
    ticker,
    displayName,
    displayTicker,
    assetType,
    units,
    combinedAssetNames,
    info,
    primaryColor,
    gradientColors,
    chainBadgeColors,
  } = assetDef

  assert(
    name &&
      ticker &&
      displayName &&
      displayTicker &&
      assetType &&
      units &&
      combinedAssetNames &&
      info &&
      primaryColor &&
      gradientColors &&
      chainBadgeColors,
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

    properName: displayName, // deprecated,
    properTicker: displayTicker, // deprecated,
  }
}
