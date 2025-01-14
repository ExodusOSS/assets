import {
  createGetKeyIdentifier as _createGetKeyIdentifier,
  unhardenDerivationIndex,
} from '@exodus/key-utils'
import assert from 'minimalistic-assert'

export const getSupportedPurposes = () => [44]

export const createGetKeyIdentifier =
  ({ bip44, assetName } = {}) =>
  (partialParams = {}) => {
    assert(typeof bip44 === 'number', 'bip44 must be a number')

    const params = {
      chainIndex: 0,
      addressIndex: 0,
      ...partialParams,
    }
    const unhardenedBip44 = unhardenDerivationIndex(bip44)
    const { compatibilityMode, purpose, accountIndex, addressIndex } = params

    const allowedPurposes = getSupportedPurposes()
    assert(
      allowedPurposes.includes(purpose),
      `purpose was ${purpose}, which is not allowed. Can be one of the following: ${allowedPurposes.join(
        ', '
      )}`
    )

    switch (compatibilityMode) {
      case 'phantom':
        // Phantom doesn't use chainIndex (normal vs change address)
        return {
          assetName,
          derivationAlgorithm: 'SLIP10',
          derivationPath: `m/${purpose}'/${unhardenedBip44}'/${accountIndex}'/${addressIndex}'`,
          keyType: 'nacl',
        }
      case 'ledger':
      case 'trust':
        return {
          assetName,
          derivationAlgorithm: 'SLIP10',
          derivationPath: `m/${purpose}'/${unhardenedBip44}'/${accountIndex}'`,
          keyType: 'nacl',
        }
      case 'mathwallet':
        return {
          assetName,
          derivationAlgorithm: 'BIP32',
          derivationPath: `m/${purpose}'/${unhardenedBip44}'/${accountIndex}'/${addressIndex}`,
          keyType: 'nacl',
        }
      default:
        return _createGetKeyIdentifier({ bip44, keyType: 'nacl', assetName })(params)
    }
  }
