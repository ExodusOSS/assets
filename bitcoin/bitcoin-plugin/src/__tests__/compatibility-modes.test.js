import { WalletAccount } from '@exodus/models'

import { createGetSupportedPurposes } from '../compatibility-modes.js'

describe('createGetSupportedPurposes', () => {
  test('returns purposes', () => {
    const getSupportedPurposes = createGetSupportedPurposes()

    expect(getSupportedPurposes({ walletAccount: WalletAccount.DEFAULT })).toEqual([84, 86, 44])
  })

  test('returns purposes filtered by purposes to omit', () => {
    const getSupportedPurposes = createGetSupportedPurposes({ omitPurposes: [86] })

    expect(getSupportedPurposes({ walletAccount: WalletAccount.DEFAULT })).toEqual([84, 44])
  })
})
