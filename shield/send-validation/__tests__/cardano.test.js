import cardanoPlugin from '@exodus/cardano-plugin'

import { adaRemainingBalanceValidator } from '../src/validations/cardano.js'

const baseAsset = cardanoPlugin.createAsset({ assetClientInterface: {} })
baseAsset.baseAsset = baseAsset

describe('cardano validations', () => {
  describe('adaRemainingBalanceValidator', () => {
    test('should not validate as not being cardano tokens', () => {
      const shouldValidate = adaRemainingBalanceValidator.shouldValidate({
        asset: {
          name: 'bitcoin',
        },
      })
      expect(shouldValidate).toBeFalsy()
    })

    test('send ADA: should be valid when remaining balance is zero', async () => {
      const isValid = await adaRemainingBalanceValidator.isValid({
        asset: baseAsset,
        remainingBalance: baseAsset.currency.ZERO,
        sendAmount: baseAsset.currency.baseUnit(10_000_000),
      })
      expect(isValid).toBeTruthy()
    })

    test('send ADA: should be valid when sending balance is zero', async () => {
      const isValid = await adaRemainingBalanceValidator.isValid({
        asset: baseAsset,
        remainingBalance: baseAsset.currency.baseUnit(1),
        sendAmount: baseAsset.currency.ZERO,
      })
      expect(isValid).toBeTruthy()
    })

    test('send ADA: should be invalid when remaining balance is less than 1 ADA', async () => {
      const isValid = await adaRemainingBalanceValidator.isValid({
        asset: baseAsset,
        remainingBalance: baseAsset.currency.defaultUnit(0.88),
        sendAmount: baseAsset.currency.defaultUnit(1),
      })
      expect(isValid).toBeFalsy()
    })

    test('send ADA token: should be invalid when remaining ADA balance is less than 1 ADA', async () => {
      const token = baseAsset.api
        .getTokens()
        .find(({ name }) => name === 'worldmobil_cardano_262abe57')

      token.baseAsset = baseAsset

      const isValid = await adaRemainingBalanceValidator.isValid({
        asset: token,
        remainingBalance: token.currency.ZERO, // send all
        sendAmount: token.currency.defaultUnit(100),
        baseAssetBalance: baseAsset.currency.defaultUnit(1.02),
        feeAmount: baseAsset.currency.defaultUnit(0.18),
      })
      expect(isValid).toBeFalsy()
    })

    test('send ADA token: should be invalid when remaining ADA balance is greater than 1 ADA', async () => {
      const token = baseAsset.api
        .getTokens()
        .find(({ name }) => name === 'worldmobil_cardano_262abe57')

      token.baseAsset = baseAsset

      const isValid = await adaRemainingBalanceValidator.isValid({
        asset: token,
        remainingBalance: token.currency.ZERO, // send all
        sendAmount: token.currency.defaultUnit(100),
        baseAssetBalance: baseAsset.currency.defaultUnit(13.02),
        feeAmount: baseAsset.currency.defaultUnit(0.18),
      })
      expect(isValid).toBeTruthy()
    })
  })
})
