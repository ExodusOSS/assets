import lodash from 'lodash'

import { isValidCustomToken, validateCustomToken } from '../index.js'
import { CTR_TOKENS } from './fixtures.js'

const { omit, clone } = lodash

const expectedDeletedFields = ['parameters.hexName', 'parameters.policyId']

describe('Validate custom tokens schema', () => {
  CTR_TOKENS.valid.forEach((token) => {
    it(`${token.assetName}.returns true for custom tokens with valid schema`, () => {
      expect(() => validateCustomToken(clone(token))).not.toThrow()
      expect(isValidCustomToken(clone(token))).toBeTruthy()
      expect(validateCustomToken(clone(token))).toEqual(omit(token, expectedDeletedFields))
    })
  })

  CTR_TOKENS.invalid.forEach((token) => {
    it(`${token.assetName}. returns false for custom tokens with invalid schema`, () => {
      expect(isValidCustomToken(clone(token))).toBeFalsy()
      expect(() => validateCustomToken(clone(token))).toThrow()
    })
  })
  CTR_TOKENS.formerBuiltIn.forEach((token) => {
    it(`${token.assetName}.returns true for custom tokens that was built in tokens with valid schema `, () => {
      expect(isValidCustomToken(clone(token))).toBeTruthy()
      expect(validateCustomToken(clone(token))).toEqual(omit(token, expectedDeletedFields))
    })
  })
})
