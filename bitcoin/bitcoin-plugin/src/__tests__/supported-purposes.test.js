import { getSupportedPurposes, ledger } from '../compatibility-modes.js'

describe('getSupportedPurposes tests', () => {
  test('multisig wallet account should only support purpose 86', () => {
    expect(getSupportedPurposes({ isMultisig: true, compatibilityMode: ledger })).toEqual([86])
  })
})
