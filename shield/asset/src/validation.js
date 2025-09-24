import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { isArray, isString, isObject, isEmpty, isFunction } = lodash

const assetNameRe = /^[\d_a-z]+$/
const tickerRe = /^\w+$/

function _validateCommonDef(asset) {
  const {
    name,
    displayName,
    ticker,
    units,
    assetType,
    info,
    chainBadgeColors,
    gradientColors,
    primaryColor,
  } = asset

  assert(name && isString(name) && name.match(assetNameRe), 'asset name required')
  assert(displayName && isString(displayName), `asset display name required for ${name}`)
  assert(ticker && isString(ticker) && ticker.match(tickerRe), `ticker name required for ${name}`)
  assert(isObject(units) && !isEmpty(units), `units required for ${name}`)
  assert(assetType && isString(assetType), `asset type required for ${name}`)
  assert(isFunction(asset.toString), `isString required for ${name}`)
  assert(asset.toString() === name, `isString must return ${name}`)
  assert(isObject(info), `info missing for ${name}`)
  assert(
    isArray(chainBadgeColors) &&
      chainBadgeColors.length === 2 &&
      chainBadgeColors.every((item) => isString(item)),
    `invalid "chainBadgeColors" for ${name}`
  )
  assert(
    isArray(gradientColors) &&
      gradientColors.length === 2 &&
      gradientColors.every((item) => isString(item)),
    `invalid "gradientColors" for ${name}`
  )
  assert(isString(primaryColor), `invalid "primaryColor" for ${name}`)
}

function _validateCommonDef2(asset) {
  const { name, blockExplorer } = asset

  assert(
    isObject(blockExplorer) &&
      ['addressUrl', 'txUrl'].every((item) => isFunction(blockExplorer[item])),
    `invalid "blockExplorer" for ${name}`
  )
}

export function validateBaseAssetDef(asset) {
  _validateCommonDef(asset)
  _validateCommonDef2(asset)
  assert(
    asset.baseAssetName && asset.name === asset.baseAssetName,
    `base asset name ${asset.baseAssetName} is not valid for asset ${asset.name}`
  )
  assert(!asset.isCombined, `combined asset is not supported for base asset ${asset.name}`)
}

export function validateTokenDef(asset) {
  _validateCommonDef(asset)
  _validateCommonDef2(asset)
  assert(
    asset.baseAssetName && asset.name !== asset.baseAssetName,
    `base asset name ${asset.baseAssetName} is not valid for token ${asset.name}`
  )
  assert(!asset.isCombined, `combined asset is not supported for token ${asset.name}`)
}

export function validateCombinedAssetDef(asset) {
  _validateCommonDef(asset)
  assert(asset.isCombined, `isCombined missing for ${asset.name}`)
  assert(
    isArray(asset.combinedAssetNames) && asset.combinedAssetNames.length > 0,
    `at least one combined asset name expected for ${asset.name}`
  )
}
