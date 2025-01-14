// Marks TX input as Final although this doesn't guarantee
// the transaction wouldn't be replaceable
export const FINAL_SEQUENCE = 0xff_ff_ff_ff
// https://github.com/bitcoin/bitcoin/pull/6871/files#diff-7ec3c68a81efff79b6ca22ac1f1eabbaR859
// Signals Transaction is Replaceable
export const RBF_SEQUENCE = FINAL_SEQUENCE - 2

// Enables RBF support for these assets.
export const RBF_ASSET_NAMES = ['bitcoin']

export const RBF_FEE_MULTIPLIER = 0.7
export const RBF_FEE_BUMP_MULTIPLIER = 1.3
