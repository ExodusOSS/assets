import { condenseAddress } from '../addresses.js'

const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'

describe('condenseAddress', () => {
  it('returns a condensed version of the address for display', () => {
    expect(condenseAddress(address)).toBe('0x71C7...976F')
  })
})
