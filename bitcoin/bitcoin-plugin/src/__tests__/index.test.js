import { chainIndexTestSuite } from '@exodus/assets-testing'

import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const baseAsset = assetPlugin.createAsset({ assetClientInterface })

describe(`${baseAsset.name} index.js test`, () => {
  chainIndexTestSuite({
    baseAsset,
    moreKeys: [
      'coinInfo',
      'insightClient',
      'useBip84',
      'useBip86',
      'useMultipleAddresses',
      'canBumpTx',
    ],
  })
})

describe('bitcoin addresses', () => {
  it('is valid segway address ', () => {
    expect(baseAsset.address.validate('bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn')).toBe(true) // mainnet
    expect(baseAsset.address.validate('tb1qh3v7p0gu6s5xeucy9qrq92khl8av3agxru8x0y')).toBe(false) // testnet
    expect(baseAsset.address.validate('bcrt1qucwdfncdxavhqkxa3zyk66w5786kt3dcvqhruf')).toBe(false) // regtest
  })

  it('is valid taproot address', () => {
    expect(
      baseAsset.address.validate('bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew')
    ).toBe(true) // mainnet
    expect(
      baseAsset.address.validate('tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey')
    ).toBe(false) // testnet
    expect(
      baseAsset.address.validate('bcrt1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqauu7v7')
    ).toBe(false) // regtest

    expect(
      baseAsset.address.isP2TR(
        baseAsset.keys.encodePublic(
          Buffer.from('021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1', 'hex'),
          { purpose: 86 }
        )
      )
    ).toBe(true)
  })

  it('is valid legacy address', () => {
    expect(baseAsset.address.validate('1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3')).toBe(true) // mainnet
    expect(baseAsset.address.validate('mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA')).toBe(false) // testnet and regtest
  })
})
