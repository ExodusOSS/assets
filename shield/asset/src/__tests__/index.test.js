import lodash from 'lodash'

import { createBaseAssetDef, createTokenDef } from '../create-defs.js'
import assetSample from './fixtures/asset.js'
import assetResult from './fixtures/asset-result.js'
import tokensSample from './fixtures/tokens.js'
import tokensResult from './fixtures/tokens-result.js'

const { omit } = lodash

describe('create asset definitions', () => {
  test('createBaseAssetDef', () => {
    const asset = createBaseAssetDef(assetSample)

    expect(asset.gasLimit).toBe(21_000)
    expect(asset.toString()).toBe(asset.name)
    expect(asset.currency.toJSON()).toEqual(asset.units)
    expect(typeof asset.blockExplorer.txUrl).toBe('function')
    expect(typeof asset.blockExplorer.addressUrl).toBe('function')
    expect(omit(asset, ['blockExplorer', 'currency', 'toString'])).toStrictEqual(assetResult)
  })

  test.each(tokensSample)('createTokenDef', (tokenSample) => {
    const tokenOverrides = (token) => ({
      ...token,
      contract: token.addresses,
      gasLimit: 120e3,
    })

    const asset = createBaseAssetDef(assetSample)
    const token = createTokenDef({ asset, token: tokenSample, tokenOverrides })
    const tokenResult = tokensResult.shift()

    expect(token.gasLimit).toBe(120_000)
    expect(token.toString()).toBe(token.name)
    expect(token.currency.toJSON()).toEqual(token.units)
    expect(typeof token.blockExplorer.txUrl).toBe('function')
    expect(typeof token.blockExplorer.addressUrl).toBe('function')
    expect(omit(token, ['blockExplorer', 'currency', 'toString'])).toStrictEqual(tokenResult)
  })
})
