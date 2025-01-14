import { createGetKeyIdentifier } from '@exodus/key-utils'
import assert from 'minimalistic-assert'

const keyIdentifierFactory =
  ({
    bip44,
    assetName,
    derivationAlgorithm = 'BIP32',
    keyType = 'secp256k1',
    ...validationRules
  }) =>
  (params = {}) => {
    const { accountIndex, addressIndex, compatibilityMode, purpose } = params
    const isXverse49NotMerged = compatibilityMode === 'xverse49NotMerged'
    assert(typeof bip44 === 'number', `bip44 must be a number. Received ${bip44}`)
    if (isXverse49NotMerged) {
      assert(
        addressIndex === 0 || addressIndex == null,
        'xverse49NotMerged compatibility does not support setting an addressIndex'
      )
      return {
        bip44,
        assetName,
        derivationAlgorithm,
        derivationPath: `m/${purpose}'/0'/0'/0/${accountIndex}`,
        keyType,
      }
    }

    return createGetKeyIdentifier({
      bip44,
      assetName,
      validationRules: {
        allowXPUB: true,
        allowMultipleAddresses: true,
        allowedChainIndices: [0, 1], // 0 is regular address, 1 is change address
        ...validationRules,
      },
    })(params)
  }

export default keyIdentifierFactory
