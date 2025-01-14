import { PublicKey } from '@exodus/solana-web3.js'

import {
  condensePublicKey,
  deserializePublicKey,
  serializePublicKey,
} from './keys.js'

const publicKey = new PublicKey('A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH')

describe('condensePublicKey', () => {
  it('returns a condensed version of the public key for display', () => {
    expect(condensePublicKey(publicKey)).toBe('A5Eo..AWHH')
  })
})

describe('serializePublicKey & deserializePublicKey', () => {
  it('serializes the public key for transport', () => {
    expect(serializePublicKey(publicKey)).toBe(
      'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH',
    )
  })

  it('deserializes to the same value', () => {
    expect(deserializePublicKey(serializePublicKey(publicKey))).toEqual(
      publicKey,
    )
  })
})
