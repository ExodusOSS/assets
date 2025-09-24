export const DEFAULT_ORDINAL_POSTAGE = 10_000

// What's the taproot chain index to use as the default ordinal address (as in purpose 86, m/2/0).
// Note that it's recommended for exodus wallets to not use 0 as it can hold regular btc  (as in purpose 86, m/0/0).
// If a user syncs an ordinal Wallet (BE) with a non-ordinal Wallet (old Desktop), the non-ordinal wallet may burn ordinals as regular BTC
export const DEFAULT_ORDINAL_CHAIN_INDEX = 2
