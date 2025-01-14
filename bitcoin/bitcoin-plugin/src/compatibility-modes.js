import { WalletAccount } from '@exodus/models'
import lodash from 'lodash'

const { without } = lodash

export const ordinals84 = 'ordinals84'
export const ordinals86 = 'ordinals86'
export const trezor = 'trezor'
export const ledger = 'ledger'
export const xverse49 = 'xverse49'
export const xverse49NotMerged = 'xverse49NotMerged'

export const getDefaultAddressPath = ({ compatibilityMode } = Object.create(null)) => {
  if ([ordinals84, ordinals86].includes(compatibilityMode)) {
    return 'm/0'
  }

  return 'm/0/0'
}

export const getSupportedPurposes = ({ compatibilityMode, isMultisig, walletAccount }) => {
  if (isMultisig) {
    return [86]
  }

  if (walletAccount?.source === WalletAccount.TREZOR_SRC || compatibilityMode === trezor) {
    return [84, 49]
  }

  if (compatibilityMode === ledger) {
    return [84, 86, 49, 44]
  }

  if (compatibilityMode === ordinals84) {
    return [84, 86, 44]
  }

  if (compatibilityMode === ordinals86) {
    return [86, 84, 44]
  }

  if (compatibilityMode === xverse49) {
    return [49, 84, 86, 44]
  }

  if (compatibilityMode === xverse49NotMerged) {
    return [49, 86]
  }

  return [84, 86, 44]
}

export const createGetSupportedPurposes = ({ omitPurposes = [] } = {}) => {
  return ({ compatibilityMode, walletAccount, isMultisig }) => {
    const purposes = getSupportedPurposes({ compatibilityMode, walletAccount, isMultisig })
    return without(purposes, ...omitPurposes)
  }
}
