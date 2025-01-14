import { getSizeFactory } from '@exodus/bitcoin-api/src/fee/fee-estimator.js'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const asset = assetPlugin.createAsset({ assetClientInterface })

const getSize = getSizeFactory({ defaultOutputType: 'P2WSH', addressApi: asset.address })
test('bitcoin - P2PKH + P2PKH => P2PKH + P2SH', () => {
  expect(
    getSize(asset, Array.from({ length: 2 }).fill(null), [
      'P2PKH',
      '3NTSXiKw32hs7rXzWhvdc5pWHRVojQjxtp',
    ])
  ).toBe(372)
})

test('bitcoin - P2WSH => P2WSH', () => {
  const inputs = Array.from({ length: 1 }).fill(null)
  expect(getSize(asset, inputs, ['P2WSH'])).toBe(201)
})

test('bitcoin - P2WSH + P2WSH => P2WSH + P2WSH', () => {
  const inputs = Array.from({ length: 2 }).fill(null)
  expect(getSize(asset, inputs, ['P2WSH', 'P2WSH'])).toBe(392)
})

test('bitcoin - P2WSH + P2WSH => P2WSH + P2WSH', () => {
  const inputs = Array.from({ length: 3 }).fill(null)
  expect(getSize(asset, inputs, ['P2WSH', 'P2WSH', 'P2WSH'])).toBe(583)
})

test('bitcoin - P2PKH + P2PKH + P2TR => P2PKH + P2SH', () => {
  const inputs = Array.from({ length: 3 }).fill(null)
  inputs[2] = '51201714e18f9b1291564dfa662247f7d528aaddd9f0be5024066f590f4d37c63657'
  // 41 (new input) + 17 (68/4 - new witness) + ceiling
  expect(getSize(asset, inputs, ['P2PKH', '3NTSXiKw32hs7rXzWhvdc5pWHRVojQjxtp'])).toBe(431)
})

test('bitcoin - P2PKH + P2PKH + P2TR => P2PKH + P2SH + P2TR', () => {
  const inputs = Array.from({ length: 3 }).fill(null)
  inputs[2] = '51201714e18f9b1291564dfa662247f7d528aaddd9f0be5024066f590f4d37c63657'
  // 41 (new input) + 17 (68/4 - new witness) + ceiling
  // 43 (new output)
  expect(getSize(asset, inputs, ['P2PKH', '3NTSXiKw32hs7rXzWhvdc5pWHRVojQjxtp', 'P2TR'])).toBe(474)
})

test('bitcoin - 10 x P2PKH => P2PKH + P2SH', () => {
  expect(getSize(asset, Array.from({ length: 10 }).fill(null), ['P2PKH', 'P2SH'])).toBe(1556)
})

test('bitcoin - 10 x P2TR => P2PKH + P2SH', () => {
  expect(
    getSize(
      asset,
      Array.from({ length: 10 }).fill(
        '51200d1a834713b73b2297d3069af035956c85c296a91783d3c4d63dba6b74a69cc2'
      ),
      ['P2PKH', 'P2SH']
    )
  ).toBe(652)
})

test('bitcoin - P2PKH + P2PKH => P2PKH', () => {
  expect(
    getSize(asset, [null, '76a914000000000000000000000000000000000000000088ac'], ['P2PKH'])
  ).toBe(340)
})

test('bitcoin - P2PKH + P2PKH => P2PTR', () => {
  expect(
    getSize(
      asset,
      [null, '512056f50a3a9555fff6669a24bdda21d709b44f287b96bf42cc0dbef9a7ff1e6705'],
      ['P2PKH']
    )
  ).toBe(251)
})

test('bitcoin - uses P2WSH as default output - P2PKH + P2WPKH => P2WSH + P2WPKH', () => {
  expect(
    getSize(asset, [null, '00140000000000000000000000000000000000000000'], [null, 'P2WPKH'])
  ).toBe(301)
})

test('bitcoin - uncompressed public key - P2PKH + P2PKH => P2PKH', () => {
  expect(
    getSize(asset, [null, '76a914000000000000000000000000000000000000000088ac'], ['P2PKH'], {
      compressed: false,
    })
  ).toBe(404)
})
