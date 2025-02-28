import { ECPair } from '@exodus/bitcoinjs'
import { tiny_secp256k1_compat as ecc } from '@exodus/crypto/secp256k1'

export * from './account-state.js'
export * from './balances.js'
export * from './btc-address.js'
export * from './btc-like-address.js'
export * from './btc-like-keys.js'
export { default as InsightAPIClient } from './insight-api-client/index.js'
export { default as InsightWSClient } from './insight-api-client/ws.js'
export { default as bip44Constants } from './constants/bip44.js'
export * from './tx-send/index.js'
export * from './tx-sign/index.js'
export * from './fee/index.js'
export * from './utxos-utils.js'
export * from './tx-log/index.js'
export * from './unconfirmed-ancestor-data.js'
export * from './parse-unsigned-tx.js'
export { getCreateBatchTransaction } from './tx-send/batch-tx.js'
export { createPsbtToUnsignedTx } from './psbt-utils.js'
export * from './insight-api-client/util.js'
export * from './move-funds.js'
export { createEncodeMultisigContract } from './multisig-address.js'
export { toAsyncSigner } from './tx-sign/taproot.js'
export * from './ordinals-utils.js'
export { signMessage } from './sign-message.js'

// TODO: remove these, kept for compat
export { scriptClassify } from '@exodus/bitcoinjs'
export { tiny_secp256k1_compat as ecc } from '@exodus/crypto/secp256k1'
export const eccFactory = () => ecc
export const getECPair = () => ECPair
export const toXOnly = (publicKey) => publicKey.slice(1, 33)
