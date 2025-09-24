# @exodus/solana-plugin &middot; [![npm version](https://img.shields.io/badge/npm-public-blue.svg?style=flat)](https://www.npmjs.com/package/@exodus/solana-plugin)

**solana-plugin** is a standalone package that provides a unified public interface for integrating Solana assets into wallet applications. It consolidates blockchain communication, transaction handling, cryptographic operations, and asset metadata—into one cohesive API.

The `createAsset` factory function returns an object that integrates components from:

- **solana-api**: Blockchain communication, transaction monitoring, staking info and broadcasting.
- **solana-lib**: Transaction serialization, encoding/decoding, fee estimation, and cryptography.
- **solana-meta**: Asset metadata, including logos, color schemas, and block explorer links.

---

## Installation

Install the package via yarn:

```bash
yarn add @exodus/solana-plugin
```

## Usage

To use the `@exodus/solana-plugin`, you need to import the necessary modules and create an asset using the `createAsset` factory function. Below is an example of how to set up and use the plugin with the other solana packages:

```javascript
import { createAsset } from '@exodus/solana-plugin'
import ms from 'ms'

const DEFAULT_ACCOUNT_RESERVE = 0.01
const DEFAULT_LOW_BALANCE = 0.01
const DEFAULT_MIN_STAKING_AMOUNT = 0.01

const asset = createAsset({
  assetClientInterface,
  config: {
    stakingFeatureAvailable: true,
    includeUnparsed: false,
    monitorInterval: ms('30s'),
    shouldUpdateBalanceBeforeHistory: true,
    defaultAccountReserve: DEFAULT_ACCOUNT_RESERVE,
    defaultLowBalance: DEFAULT_LOW_BALANCE,
    defaultMinStakingAmount: DEFAULT_MIN_STAKING_AMOUNT,
    ticksBetweenHistoryFetches,
    ticksBetweenStakeFetches,
    txsLimit,
    signWithSigner: true,
  },
})

console.log(asset)
```

## API

### `createAsset({ assetClientInterface, config })`

Creates a factory function for creating Solana assets.

#### Parameters

- `assetClientInterface` (Object): Interface for the asset client.
- `config` (Object): Configuration settings for the asset.
  - `stakingFeatureAvailable` (Boolean): Indicates if staking feature is available.
  - `includeUnparsed` (Boolean): Whether to include unparsed transactions.
  - `monitorInterval` (String): Interval for monitoring transactions, e.g., '30s'.
  - `shouldUpdateBalanceBeforeHistory` (Boolean): Indicates if we should update balance independently from history.
  - `defaultAccountReserve` (Number): Default reserve amount for accounts.
  - `defaultLowBalance` (Number): Default low balance threshold.
  - `defaultMinStakingAmount` (Number): Default minimum staking amount.
  - `ticksBetweenHistoryFetches` (Number): Number of ticks between history fetches.
  - `ticksBetweenStakeFetches` (Number): Number of ticks between stake fetches.
  - `txsLimit` (Number): Limit for the number of transactions.
  - `signWithSigner` (Boolean): Whether to sign transactions with a signer.

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software under the terms of the MIT License.
For more details, see the [LICENSE](LICENSE) file.
