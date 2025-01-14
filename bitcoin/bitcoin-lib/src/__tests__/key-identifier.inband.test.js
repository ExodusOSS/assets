import bip44Constants from '@exodus/bip44-constants/by-ticker.js'

import createGetKeyIdentifier from '../key-identifier.js'

describe('key-identifier', () => {
  test('can create the key identifier BTC', () => {
    const factory = createGetKeyIdentifier({ bip44: bip44Constants.BTC })
    expect(factory({ purpose: 44, accountIndex: 1, chainIndex: 0, addressIndex: 0 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/0'/1'/0/0",
      keyType: 'secp256k1',
    })
  })

  test('can create the key identifier BTC partial derivation path', () => {
    const factory = createGetKeyIdentifier({ bip44: bip44Constants.BTC })
    expect(factory({ purpose: 44, accountIndex: 1 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/0'/1'",
      keyType: 'secp256k1',
    })
  })

  test('can create the key identifier LTC', () => {
    const factory = createGetKeyIdentifier({
      bip44: bip44Constants.LTC,
      allowedChainIndices: [0, 3],
    })
    expect(factory({ purpose: 44, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/2'/1'/3/4",
      keyType: 'secp256k1',
    })
  })

  test('can create the key identifier with purpose 49, 84 and 86', () => {
    const factory = createGetKeyIdentifier({
      bip44: bip44Constants.BTC,
      allowedChainIndices: [0, 3],
      allowedPurposes: [44, 49, 84, 86],
    })

    expect(factory({ purpose: 44, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/44'/0'/1'/3/4",
      keyType: 'secp256k1',
    })

    expect(factory({ purpose: 49, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/49'/0'/1'/3/4",
      keyType: 'secp256k1',
    })

    expect(factory({ purpose: 84, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/84'/0'/1'/3/4",
      keyType: 'secp256k1',
    })

    expect(factory({ purpose: 86, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/86'/0'/1'/3/4",
      keyType: 'secp256k1',
    })

    expect(() =>
      factory({ purpose: 100, accountIndex: 1, chainIndex: 3, addressIndex: 4 })
    ).toThrow('purpose was 100, which is not allowed. Can be one of the following: 44, 49, 84, 86')
  })

  test('raises on invalid params', () => {
    const factory = createGetKeyIdentifier({ bip44: bip44Constants.BTC })
    expect(() => factory({ purpose: -1, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toThrow(
      'purpose was -1, which is not allowed. Can be one of the following: 44'
    )

    expect(() => factory({ accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toThrow(
      'purpose was undefined, which is not allowed. Can be one of the following: 44'
    )

    expect(() => factory({ purpose: 44, accountIndex: -1 })).toThrow(
      'accountIndex must be a non-negative integer'
    )

    expect(() =>
      factory({ purpose: 44, accountIndex: 1, chainIndex: -1, addressIndex: 4 })
    ).toThrow('chainIndex must be a non-negative integer')

    expect(() =>
      factory({ purpose: 44, accountIndex: 1, chainIndex: 0, addressIndex: -1 })
    ).toThrow('addressIndex must be a non-negative integer')
  })

  test('raises on invalid bip44', () => {
    const factory = createGetKeyIdentifier({
      bip44: 100,
      allowedChainIndices: [0, 3],
    })
    expect(() => factory({ purpose: 44, accountIndex: 1, chainIndex: 3, addressIndex: 4 })).toThrow(
      "derivationPath must contain only a number and optionally a hardening character '"
    )
  })

  test('should return in ordinals Taproot', () => {
    const factory = createGetKeyIdentifier({
      bip44: bip44Constants.BTC,
      allowedPurposes: [44, 49, 84, 86],
    })
    expect(
      factory({
        purpose: 86,
        accountIndex: 1,
      })
    ).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/86'/0'/1'",
      keyType: 'secp256k1',
    })
  })

  test('should return in ordinals Native SegWit', () => {
    const factory = createGetKeyIdentifier({
      bip44: bip44Constants.BTC,
      allowedPurposes: [44, 49, 84, 86],
    })
    expect(
      factory({
        purpose: 84,
        accountIndex: 1,
      })
    ).toEqual({
      derivationAlgorithm: 'BIP32',
      derivationPath: "m/84'/0'/1'",
      keyType: 'secp256k1',
    })
  })
})
