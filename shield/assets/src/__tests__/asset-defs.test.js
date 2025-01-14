import { validateBaseAssetDef, validateCombinedAssetDef, validateTokenDef } from '@exodus/asset'
import assetsBase from '@exodus/assets-base'
import { keyBy, omit } from '@exodus/basic-utils'
import combinedAssetsList from '@exodus/combined-assets-meta'
import { strict as assert } from 'assert'
import lodash from 'lodash'

const { partition } = lodash

// TODO: move to @exodus/asset

const combinedAssets = keyBy(combinedAssetsList, ({ name }) => name)

// tokens _must_ have baseAssetName that is different from their name
const [tokens, baseAssets] = partition(
  assetsBase,
  (asset) => asset.baseAssetName && asset.name !== asset.baseAssetName
)

test('all base assets pass validation', () => {
  for (const asset of baseAssets) {
    assert.doesNotThrow(() => validateBaseAssetDef(asset))
  }
})

test('all tokens pass validation', () => {
  for (const asset of tokens) {
    assert.doesNotThrow(() => validateTokenDef(asset))
  }
})

test('all combined assets pass validation', () => {
  for (const asset of Object.values(combinedAssets)) {
    assert.doesNotThrow(() => validateCombinedAssetDef(asset))
  }
})

test('token validation fails without name', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['name'])),
    /^Error: asset name required$/
  )
})

test('token validation fails without displayName', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['displayName'])),
    /^Error: asset display name required for weth$/
  )
})

test('token validation fails without ticker', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['ticker'])),
    /^Error: ticker name required for weth$/
  )
})

test('token validation fails without units', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['units'])),
    /^Error: units required for weth$/
  )
})

test('token validation fails without assetType', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['assetType'])),
    /^Error: asset type required for weth$/
  )
})

test('token validation fails without info', () => {
  assert.throws(
    () => validateTokenDef(omit(assetsBase.weth, ['info'])),
    /^Error: info missing for weth$/
  )
})

test('token validation fails with isCombined', () => {
  assert.throws(
    () => validateTokenDef({ ...assetsBase.weth, isCombined: true }),
    /^Error: combined asset is not supported for token weth$/
  )
})

test('token validation fails with invalid base asset name', () => {
  assert.throws(
    () => validateTokenDef({ ...assetsBase.weth, baseAssetName: 'weth' }),
    /^Error: base asset name weth is not valid for token weth$/
  )
})

test('base asset validation fails with invalid base asset name', () => {
  assert.throws(
    () => validateBaseAssetDef({ ...assetsBase.ethereum, baseAssetName: 'weth' }),
    /^Error: base asset name weth is not valid for asset ethereum$/
  )
})

test('base asset validation fails with isCombined', () => {
  assert.throws(
    () => validateBaseAssetDef({ ...assetsBase.ethereum, isCombined: true }),
    /^Error: combined asset is not supported for base asset ethereum$/
  )
})

test('base asset validation fails without blockExplorer', () => {
  assert.throws(
    () => validateBaseAssetDef(omit(assetsBase.ethereum, ['blockExplorer'])),
    /^Error: invalid "blockExplorer" for ethereum$/
  )
})

test('combined asset validation fails without isCombined', () => {
  assert.throws(
    () => validateCombinedAssetDef(omit(combinedAssets._usdcoin, ['isCombined'])),
    /^Error: isCombined missing for _usdcoin$/
  )
})

test('combined asset validation fails without combinedAssetNames', () => {
  assert.throws(
    () => validateCombinedAssetDef(omit(combinedAssets._usdcoin, ['combinedAssetNames'])),
    /^Error: at least one combined asset name expected for _usdcoin$/
  )
})
