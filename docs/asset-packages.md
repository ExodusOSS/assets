# Asset Packages

An asset in this monorepo typically consists of several packages:

## `<asset>-meta`

Constants like name, displayName, ticker, currency, colors, icons.

## `<asset>-lib`

Internal asset utils, such as for cryptography, address encoding/decoding, etc. These are NOT necessarily exported under the same names and same interfaces for every asset. The cardinal rules for this package are that there must NOT be any networking code and that it should have as few dependencies as possible.

## `<asset>-api`

Transaction and fee monitors, RPC with the blockchain node, other networking code.

## `<asset>-plugin`

This is the ONLY PACKAGE that makes public interface guarantees. It exports a `createAsset` factory function for a wallet to instantiate and inject with an `assetClientInterface`, which returns a uniform asset interface that hides asset specifics.
