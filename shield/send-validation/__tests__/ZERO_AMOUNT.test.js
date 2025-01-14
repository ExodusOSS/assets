import ZERO_AMOUNT from '../src/validations/ZERO_AMOUNT.js'

describe('ZERO_AMOUNT', () => {
  describe('isValid()', () => {
    it('should return false if no sendAmount send', () => {
      expect(ZERO_AMOUNT.isValid({})).toBe(false)
    })

    it('should return true if sendAmount is not zero', () => {
      expect(ZERO_AMOUNT.isValid({ sendAmount: { isZero: false } })).toBe(true)
    })

    it('should return true if sendAmount is zero', () => {
      expect(ZERO_AMOUNT.isValid({ sendAmount: { isZero: true } })).toBe(false)
    })
  })
})
