import { validateBaseAssetDef, validateCombinedAssetDef, validateTokenDef } from '@exodus/asset'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { isArray, isString, isObject } = lodash

export function validateAsset(asset) {
  // a token _must_ have baseAssetName
  // a combined asset _must_ have isCombined === true
  // anything else is a base asset
  asset.baseAssetName && asset.name !== asset.baseAssetName
    ? validateToken(asset)
    : asset.isCombined === true
      ? validateCombinedAsset(asset)
      : validateBaseAsset(asset)
}

function _validateCommon(asset) {
  assert(isObject(asset.baseAsset), `base asset missing for ${asset.name}`)
  assert(isObject(asset.feeAsset), `fee asset missing for ${asset.name}`)
  assert(isObject(asset.currency), `currency missing for ${asset.name}`)
  assert(
    asset.properTicker && isString(asset.properTicker),
    `properTicker asset missing for ${asset.name}`
  )
  assert(
    asset.displayNetworkName && isString(asset.displayNetworkName),
    `displayNetworkName missing for ${asset.name}`
  )
  assert(
    asset.displayNetworkTicker && isString(asset.displayNetworkTicker),
    `displayNetworkTicker missing for ${asset.name}`
  )
}

export function validateToken(asset) {
  validateTokenDef(asset)
  _validateCommon(asset)
}

export function validateBaseAsset(asset) {
  validateBaseAssetDef(asset)
  _validateCommon(asset)
}

export function validateCombinedAsset(asset) {
  validateCombinedAssetDef(asset)
  _validateCommon(asset)
  assert(isArray(asset.combinedAssets), `combined assets missing for ${asset.name}`)
}

export const assertNotAnObjectPrototypeProperty = (name) => {
  // Property names that exist in Object.prototype are problematic:
  //  * A[name] checks can return "false positives" - when treating as a map, the key might have not been set
  //  * hasOwn(A, name) checks can return "false negatives" - assigning A[name] can hit a setter, i.e. __proto__
  //  * `toString`, `hasOwnProperty`, etc could be overwritten and cause unexpected breakage

  // The list of forbidden property names: Object.getOwnPropertyNames(Object.prototype)
  // All of them are truthy (i.e. non-falsy), all except __proto__ are functions

  // Ideally, all code needing this should be rewritten to Map() instead

  // NOTE: if this gets refactored into an array/set of properties check, the `name` must be stringified: (`${name}`)

  assert(!{}[name], `property ${name} conflicts with object prototype`)
}
