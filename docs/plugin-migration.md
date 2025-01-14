# Plugin Migration

This document outlines the process for integrating code from wallets into the assets repository in the form of an asset plugin.

## Asset Plugin

An asset plugin encapsulates all aspects of a network in a package that can be installed in any wallet, such as Exodus or Titan. It must be compatible with all wallets, although some variations may exist due to different modules being used. These differences are expected to diminish as the platform team works towards hydra-fication of the modules.

The concept is inspired by the `_local_modules/assets/some-network` folders in the wallets. Ideally, installing the plugin should suffice to add a network to a wallet, but currently, this is not entirely the case. Some wallet code updates and API additions are necessary, as detailed below.

## Process to Create a Plugin

Follow these steps to consolidate code from wallets into the assets repository. Each step might constitute a PR or a commit within a PR, depending on its complexity.

1. [ ] Create `some-asset-plugin` folder next to `some-asset-meta`, `some-asset-lib`, etc. Add `package.json` and `jest.config.js` files.
2. [ ] Decouple the wallet from the asset code as much as possible. [Example decoupling tx send](https://github.com/ExodusMovement/exodus-mobile/pull/16648).
3. [ ] Move the best wallet candidate from `_local_modules/assets/some-network` to `some-asset-plugin/src` folder. Mobile is most likely the best one.
4. [ ] Replace any dangling import from the wallet with a local implementation. Most likely `../balances.js`
5. [ ] Revisit `createAsset` default object export. Remove `connectAsset`, this is done at platform side
6. [ ] Revisit/add `api.getFee` and `api.getFeeAsync`. The logic to be ported should be coded in the wallet `getFee` selector
7. [ ] Revisit `api.getBalances`, the logic to be ported should be coded in the wallet `getSpendableBalance` and other balance related selectors. It must include at least asset and token `total` (ex. `balance`) and `spendable` (ex `spendableBalance`). Revisit the `fixBalances` case, where balance is affected by the tx-log unconfirmed fees/amounts. [Balance spec](https://github.com/ExodusMovement/assets/blob/main/docs/balances-model.md).
8. [ ] Revisit the tx-log monitor, migrate any wallet import (they should not be too many)
9. [ ] Revisit tx-send, replace actions and flux with aci get and set calls (most likely address, account state, txLogs). Revisit `receiver` param when calling `aci.signTransaction` (used in Trezor confirm screen atm).
10. [ ] Add `currencies` when creating/patch txLogs items in tx-logs monitor and tx-send.
11. [ ] Fix vector tests imports in `api.tests.js` and `keys.tests.js`
12. [ ] Add as many unit and integration tests as possible. Examples are in the different plugin's `__tests__` folders. Stellar [example](https://github.com/ExodusMovement/assets/tree/main/stellar/packages/stellar-plugin/src/__tests__)
13. [ ] Create `asset.api.moveFunds` and migrate logic from private key import in Desktop. Create unit tests if possible.
14. [ ] Revisit the other apis, although the most problematic are describe above.
15. [ ] Compare `/index`, `tx-send`, `tx-log`, `features` from other wallets, for example desktop. Check for any possible incompatibility or required migration.
16. [ ] Search for the network in the wallet different folders. Is there any feature missing? Is the network or tick string hardcoded somewhere?
17. [ ] Smoke test the plugin in the candidate wallet (most likely mobile). Remove the code `_local_modules/assets/some-network` and import the new createAsset from the plugin package. You can use yalc or an `0.0.1-alpha` publish for local development. Hopefully, most of the basic testing has been done in unit/integration testing.
18. [ ] Create a wallet PR in the candidate wallet
19. [ ] Integrate the plugin in the other wallets (Desktop/BE). On desktop, double check Trezor and private key import. Adapt and upgrade the plugin if required.

Wallet PRs should include a comprehensive test plan covering sending, receiving, private key export/import, exchange, monitor refresh, fiat on-ramp, etc.

PR Examples:

- https://github.com/ExodusMovement/assets/pull/1426 Stellar flow removal
- https://github.com/ExodusMovement/assets/pull/1427 Stellar build improvement
- https://github.com/ExodusMovement/assets/pull/1430 Stellar plugin creation
- https://github.com/ExodusMovement/assets/pull/1434 Stellar error handing for desktop
- https://github.com/ExodusMovement/assets/pull/1439 Solana move funds for desktop
- https://github.com/ExodusMovement/exodus-mobile/pull/17469 Solana Mobile integration
- https://github.com/ExodusMovement/exodus-desktop/pull/15040 Solana Desktop integration

## Asset Code Currently Required in the Wallet

Some APIs are not fully unified yet. As a result, you may still encounter `someNetwork` naming in wallets. The objective is to minimize this. Such discrepancies currently block the hydra-fication of affected modules, features, or selectors.

- Balances API, especially concerning unconfirmed, reserved, locked, reward, and other types of balances.
- Memo API.
- Staking API
- Asset installation via supported asset list
- Icon generation
- Web3
- Token contract calls
- Others?
