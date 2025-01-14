import { FeeData } from '@exodus/asset-lib'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as bitcoinregtest } from '@exodus/bitcoinregtest-meta'
import { asset as bitcointestnet } from '@exodus/bitcointestnet-meta'

import { _defaults, bitcoinFeeDataFactory } from '../fee-data.js'

describe('bitcoin fee data', () => {
  const assertBitcoinFeeData = (feeData, defaults = _defaults) => {
    test(`${feeData.currency} feeData should we complete`, () => {
      expect(feeData).toBeDefined()
      expect(feeData instanceof FeeData).toBe(true)
      expect(feeData.currency).toBeDefined()
      expect(Object.entries(defaults).length).toEqual(11)
      Object.entries(defaults).forEach(([field, value]) => {
        if (typeof value === 'string')
          expect(feeData[field].equals(feeData.currency.parse(value))).toEqual(true)
        else {
          expect(feeData[field]).toEqual(value)
        }
      })
    })
  }

  const overrideFields = (feeData) => {
    test(`${feeData.currency} feeData update fields`, () => {
      expect(feeData).toBeDefined()
      expect(feeData instanceof FeeData).toBe(true)
      expect(feeData.currency).toBeDefined()
      const newFeeData = feeData.update({
        maxExtraCpfpFee: 500_000,
        rbfBumpFeeBlocks: 10,
        rbfBumpFeeThreshold: 0.9,
        iDotExist: 66,
      })
      expect(newFeeData).toBeDefined()
      expect(newFeeData.currency).toBeDefined()
      expect(newFeeData instanceof FeeData).toBe(true)
      expect(newFeeData.maxExtraCpfpFee).toEqual(500_000)
      expect(newFeeData.rbfBumpFeeBlocks).toEqual(10)
      expect(newFeeData.rbfBumpFeeThreshold).toEqual(0.9)
      expect(newFeeData.iDotExist).toEqual(66) // still updated
    })
  }

  describe('bitcoin feeData should be complete', () => {
    const feeData = bitcoinFeeDataFactory({ currency: bitcoin.currency })
    assertBitcoinFeeData(feeData)
    overrideFields(feeData)
  })

  describe('bitcoin feeData should be complete when override', () => {
    const feeData = bitcoinFeeDataFactory({
      currency: bitcoin.currency,
      overrideDefaults: { utxoDustValue: 600 },
    })
    assertBitcoinFeeData(feeData, { ..._defaults, utxoDustValue: 600 })
    overrideFields(feeData)
    expect(feeData.utxoDustValue).toEqual(600)
  })

  describe('bitcoinregtest feeData should be complete', () => {
    const feeData = bitcoinFeeDataFactory({ currency: bitcoinregtest.currency })
    assertBitcoinFeeData(feeData)
    overrideFields(feeData)
  })
  describe('bitcointestnet feeData should be complete', () => {
    const feeData = bitcoinFeeDataFactory({ currency: bitcointestnet.currency })
    assertBitcoinFeeData(feeData)
    overrideFields(feeData)
  })
})
