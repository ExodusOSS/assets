# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.30.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.8...@exodus/bitcoin-api@2.30.0) (2025-01-10)


### Features


* feat: bitcoin dust fee display (#4789)



## [2.29.8](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.7...@exodus/bitcoin-api@2.29.8) (2025-01-08)


### Bug Fixes


* fix: reduce bitcoin change dust to 1500 (#4795)



## [2.29.7](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.6...@exodus/bitcoin-api@2.29.7) (2025-01-03)


### Bug Fixes


* fix: reduce btc send dust (#4780)



## [2.29.6](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.5...@exodus/bitcoin-api@2.29.6) (2025-01-01)


### Bug Fixes


* fix: remove exclude utxo from storage (#4764)



## [2.29.5](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.4...@exodus/bitcoin-api@2.29.5) (2024-12-19)


### License


* license: re-license under MIT license (#4694)



## [2.29.4](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.3...@exodus/bitcoin-api@2.29.4) (2024-12-13)


### Bug Fixes


* fix: allow uncompressed private key import (#4705)



## [2.29.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.2...@exodus/bitcoin-api@2.29.3) (2024-11-22)


### Bug Fixes


* fix: track coinbase confirmation depth until maturity (#4522)



## [2.29.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.1...@exodus/bitcoin-api@2.29.2) (2024-11-19)


### Bug Fixes


* fix: bitcoin use utxo.derivationPath path to resolve purpose (#4541)



## [2.29.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.29.0...@exodus/bitcoin-api@2.29.1) (2024-11-13)

**Note:** Update exports in fee module of package @exodus/bitcoin-api


## [2.29.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.28.0...@exodus/bitcoin-api@2.29.0) (2024-11-10)


### Features

* filter immature coinbase utxos in getUsableUtxos ([#4507](https://github.com/ExodusMovement/assets/issues/4507)) ([3774f66](https://github.com/ExodusMovement/assets/commit/3774f66ee733ca5a3f07a7556c349d08c2d217e9))


### Bug Fixes

* fetch and require raw txs for segwit inputs ([#4399](https://github.com/ExodusMovement/assets/issues/4399)) ([f5822cc](https://github.com/ExodusMovement/assets/commit/f5822cc60d6e542f9aea88c051e1a2dbe56da13d))



## [2.28.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.27.0...@exodus/bitcoin-api@2.28.0) (2024-10-31)


### Features

* update bip322-js to 2.0.0 ([#4414](https://github.com/ExodusMovement/assets/issues/4414)) ([da2a7dd](https://github.com/ExodusMovement/assets/commit/da2a7dd217a6664f02fa722968bf6ff16f53ea39))


### Bug Fixes

* stringify sent amount NU's ([#4433](https://github.com/ExodusMovement/assets/issues/4433)) ([f2886a8](https://github.com/ExodusMovement/assets/commit/f2886a85060f5e347df9bb2bf892bb52257ece6b)), closes [#4437](https://github.com/ExodusMovement/assets/issues/4437)



## [2.27.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.26.1...@exodus/bitcoin-api@2.27.0) (2024-10-17)


### Features

* **bitcoin-api:** remove bn.js dep ([#4150](https://github.com/ExodusMovement/assets/issues/4150)) ([70082ff](https://github.com/ExodusMovement/assets/commit/70082ffd5f1ffbd5537c7978f6fa1c4333cb8bc9))
* **bitcoin-api:** use 'sig' keychain enc ([#4154](https://github.com/ExodusMovement/assets/issues/4154)) ([4c9fe45](https://github.com/ExodusMovement/assets/commit/4c9fe454fdf9a1bda3bd683ccde2359ecdabf584))
* btc-like unconfirmed received ([#4277](https://github.com/ExodusMovement/assets/issues/4277)) ([70d4b73](https://github.com/ExodusMovement/assets/commit/70d4b73811acd87265ad2c1fcf984afb5a89df73))
* cleaner dogecoin bitcoinjs-lib ([#4111](https://github.com/ExodusMovement/assets/issues/4111)) ([5f21273](https://github.com/ExodusMovement/assets/commit/5f212734d9ea732fdf74f9affafb10facdc6a828))


### Bug Fixes

* harden derivation path map with null prototype ([#4067](https://github.com/ExodusMovement/assets/issues/4067)) ([6c900cf](https://github.com/ExodusMovement/assets/commit/6c900cf1e285d129f66c4aa98fdeb811d13a23c4))
* reduce max pubkeys for multisig to 16 ([#4108](https://github.com/ExodusMovement/assets/issues/4108)) ([8c4c33b](https://github.com/ExodusMovement/assets/commit/8c4c33b08c5dc0786d601887e08b413a780b32a7))
* remove stray direct dependencies ([#4176](https://github.com/ExodusMovement/assets/issues/4176)) ([c4f93fa](https://github.com/ExodusMovement/assets/commit/c4f93fad5a930b40d326d7add1093b2d4f243f2a))



## [2.26.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.26.0...@exodus/bitcoin-api@2.26.1) (2024-09-30)

**Note:** Version bump only for package @exodus/bitcoin-api





## [2.26.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.25.0...@exodus/bitcoin-api@2.26.0) (2024-09-30)


### Features

* **bitcoin-api:** switch to exodus/crypto for secp256k1 ([#4042](https://github.com/ExodusMovement/assets/issues/4042)) ([e462faf](https://github.com/ExodusMovement/assets/commit/e462faf83d430f9c5c109cc2f49edf5a1dcbd856))


### Bug Fixes

* add new balance properties ([#4018](https://github.com/ExodusMovement/assets/issues/4018)) ([7aec845](https://github.com/ExodusMovement/assets/commit/7aec8453be559211fa5ec75ec18c89f7823f3382))



## [2.25.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.24.0...@exodus/bitcoin-api@2.25.0) (2024-09-25)


### Features

* import secp256k1 impl directly in bitcoin-api ([#3980](https://github.com/ExodusMovement/assets/issues/3980)) ([5e7f014](https://github.com/ExodusMovement/assets/commit/5e7f014b957fe27e96548277c4ec6e3038045fd0))
* move ec-pair and script-classify to bitcoinjs ([#4001](https://github.com/ExodusMovement/assets/issues/4001)) ([adb759b](https://github.com/ExodusMovement/assets/commit/adb759be5b264194f216b6a8f65d370f63555d81))
* unfork bitcoinjs-lib ([#3968](https://github.com/ExodusMovement/assets/issues/3968)) ([287ba8f](https://github.com/ExodusMovement/assets/commit/287ba8f4e7dacb0f4eb91f31090b74a67eb78733))


### Bug Fixes

* bitcoin monitor unused addresses ([#3973](https://github.com/ExodusMovement/assets/issues/3973)) ([e133efc](https://github.com/ExodusMovement/assets/commit/e133efc5c9f472b9611e1b7b9ead78c7c366ba89))



## [2.24.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.23.0...@exodus/bitcoin-api@2.24.0) (2024-09-13)


### Features

* **BTC:** add multisig data to hardware wallet signing ([#3633](https://github.com/ExodusMovement/assets/issues/3633)) ([90293e9](https://github.com/ExodusMovement/assets/commit/90293e9b80799556df1c595558b1544c5a081d7b))


### Bug Fixes

* **BTC:** allow internal pubkey and sort xonly for multisig ([#3634](https://github.com/ExodusMovement/assets/issues/3634)) ([808bf65](https://github.com/ExodusMovement/assets/commit/808bf65f05576e2758bb32ad5654143577db7c38))



## [2.23.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.22.1...@exodus/bitcoin-api@2.23.0) (2024-09-11)


### Features

* switch bitcoin to ESM ([#3433](https://github.com/ExodusMovement/assets/issues/3433)) ([8a2740f](https://github.com/ExodusMovement/assets/commit/8a2740f19401777e3333b89a2b7ac15febcb6bb8)), closes [#3286](https://github.com/ExodusMovement/assets/issues/3286)


### Bug Fixes

* **bitcoin-api:** add a missing exodus/bip32 dep ([#3457](https://github.com/ExodusMovement/assets/issues/3457)) ([d8b3499](https://github.com/ExodusMovement/assets/commit/d8b34998c78a55d56cdf787c4805e363336efd2d))


### Reverts

* Revert "test(bitcoin-api): use dynamic import( instead of dynamic require( in createSignTestCases (#3286)" (#3300) ([92065cc](https://github.com/ExodusMovement/assets/commit/92065cc44a1ad02fe2330742810679f3594300bf)), closes [#3286](https://github.com/ExodusMovement/assets/issues/3286) [#3300](https://github.com/ExodusMovement/assets/issues/3300)



## [2.22.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.22.0...@exodus/bitcoin-api@2.22.1) (2024-08-18)


### Bug Fixes

* pass allowUnconfirmed option through in batch-tx ([#3177](https://github.com/ExodusMovement/assets/issues/3177)) ([d8e073b](https://github.com/ExodusMovement/assets/commit/d8e073b4c66c79dae5808877f5c4d4cc98d93444))
* update exodus/timer ([#3134](https://github.com/ExodusMovement/assets/issues/3134)) ([e977be5](https://github.com/ExodusMovement/assets/commit/e977be5280c214c1b814409d9461ce6628bb19be))



## [2.22.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.21.4...@exodus/bitcoin-api@2.22.0) (2024-08-08)


### Features

* move ME BTC  monitor to the ME codebase ([#3118](https://github.com/ExodusMovement/assets/issues/3118)) ([2610e96](https://github.com/ExodusMovement/assets/commit/2610e966f5d078e6b9d87a08c4d86ad090400583))



## [2.21.4](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.21.3...@exodus/bitcoin-api@2.21.4) (2024-08-05)


### Bug Fixes

* always add inputs to txLog data ([#3071](https://github.com/ExodusMovement/assets/issues/3071)) ([68b5339](https://github.com/ExodusMovement/assets/commit/68b53397b78ed11a94babd821fc8fe2625558ef5))



## [2.21.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.21.2...@exodus/bitcoin-api@2.21.3) (2024-07-31)


### Bug Fixes

* pass compatibility mode to getKeyIdentifier ([#3048](https://github.com/ExodusMovement/assets/issues/3048)) ([61066f9](https://github.com/ExodusMovement/assets/commit/61066f958cafb59ab3b9be9234e9c8360ea51841))



## [2.21.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.21.1...@exodus/bitcoin-api@2.21.2) (2024-07-26)


### Bug Fixes

* **bitcoin:** make asset config function optional on ACI ([#2983](https://github.com/ExodusMovement/assets/issues/2983)) ([0b45695](https://github.com/ExodusMovement/assets/commit/0b4569522c5a65da8109ae70e74ee75ba8111ce9))
* disable multi address scanning in `multiAddressMode` is false ([#2984](https://github.com/ExodusMovement/assets/issues/2984)) ([37bab79](https://github.com/ExodusMovement/assets/commit/37bab79ec9bcb8e08850402dd5f71df823eddd3b))



## [2.21.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.21.0...@exodus/bitcoin-api@2.21.1) (2024-07-24)


### Bug Fixes

* bump @exodus/bip322-js to remove warning ([#2929](https://github.com/ExodusMovement/assets/issues/2929)) ([74c20ad](https://github.com/ExodusMovement/assets/commit/74c20ad32ebed2df4eb0f498d11b7319e80b037a))
* retrieve `multiAddressMode` from config ([#2944](https://github.com/ExodusMovement/assets/issues/2944)) ([6bd70fb](https://github.com/ExodusMovement/assets/commit/6bd70fbc9e9ce6343ebf6bc8303bf13741cff307))



## [2.21.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.20.1...@exodus/bitcoin-api@2.21.0) (2024-07-19)


### Features

* **BTC:** create batch tx from array of recipients ([#2881](https://github.com/ExodusMovement/assets/issues/2881)) ([440d5d5](https://github.com/ExodusMovement/assets/commit/440d5d5879c902ef10ff7644c92a5092bb868872))


### Bug Fixes

* **bitcoin-api:** stop ws connection on monitor stop ([#2851](https://github.com/ExodusMovement/assets/issues/2851)) ([e52f4c2](https://github.com/ExodusMovement/assets/commit/e52f4c23e7635cc3116c876ad35fbbab4a70c32b))



## [2.20.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.20.0...@exodus/bitcoin-api@2.20.1) (2024-07-15)

**Note:** Version bump only for package @exodus/bitcoin-api





## [2.20.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.19.0...@exodus/bitcoin-api@2.20.0) (2024-07-09)


### Features

* **BTC:** add changeAddressType to createAsset config ([#2772](https://github.com/ExodusMovement/assets/issues/2772)) ([d8e38dd](https://github.com/ExodusMovement/assets/commit/d8e38dddfbe59b3e8ff9fc2432049bb512a91c22))



## [2.19.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.18.4...@exodus/bitcoin-api@2.19.0) (2024-07-05)


### Features

* **BTC:** add taprootInputWitnessSize for tx size estimation ([#2737](https://github.com/ExodusMovement/assets/issues/2737)) ([13f727a](https://github.com/ExodusMovement/assets/commit/13f727a836f9fc620628abb6a94a49c1a6774ca5))



## [2.18.4](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.18.3...@exodus/bitcoin-api@2.18.4) (2024-06-20)


### Bug Fixes

* bitcoinjs-lib bump, ecc cleanup ([#2634](https://github.com/ExodusMovement/assets/issues/2634)) ([96d47a5](https://github.com/ExodusMovement/assets/commit/96d47a508657389ba766bfd44feef7365eb0de9b))



## [2.18.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.18.2...@exodus/bitcoin-api@2.18.3) (2024-06-20)


### Bug Fixes

* **bitcoin:** skip adding redeem script ([#2630](https://github.com/ExodusMovement/assets/issues/2630)) ([bc92eb5](https://github.com/ExodusMovement/assets/commit/bc92eb596aebab78a796eb2b76b3bc5cbad05b87))



## [2.18.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.18.1...@exodus/bitcoin-api@2.18.2) (2024-06-18)


### Bug Fixes

* correctly sign psbts ([#2587](https://github.com/ExodusMovement/assets/issues/2587)) ([81e5cc5](https://github.com/ExodusMovement/assets/commit/81e5cc50773b392d5f126133c0f8a1ec8ebd7eb1))



## [2.18.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.18.0...@exodus/bitcoin-api@2.18.1) (2024-06-13)


### Bug Fixes

* allow undefined/null addressIndex for xverse compat ([#2553](https://github.com/ExodusMovement/assets/issues/2553)) ([5ff013e](https://github.com/ExodusMovement/assets/commit/5ff013e1129f027dfff58cacebefc76dbcebb401))



## [2.18.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.17.1...@exodus/bitcoin-api@2.18.0) (2024-06-13)


### Features

* Remove ordinals wallet BTC from total balance ([#2524](https://github.com/ExodusMovement/assets/issues/2524)) ([3674bb1](https://github.com/ExodusMovement/assets/commit/3674bb1852aa50f8a8195da276a5b106d3ae1606))



## [2.17.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.17.0...@exodus/bitcoin-api@2.17.1) (2024-06-12)


### Bug Fixes

* support signing taproot scripts from xverse payment addresses ([#2548](https://github.com/ExodusMovement/assets/issues/2548)) ([0597ba2](https://github.com/ExodusMovement/assets/commit/0597ba27a83071a8a0be41d44d8c0ca32cc5e6f6))



## [2.17.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.16.0...@exodus/bitcoin-api@2.17.0) (2024-06-12)


### Features

* allow signSchnorr for non-taproot ([#2545](https://github.com/ExodusMovement/assets/issues/2545)) ([5f459fd](https://github.com/ExodusMovement/assets/commit/5f459fd89e571a8e880a52dda93e8a7ead0012a5))



## [2.16.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.15.1...@exodus/bitcoin-api@2.16.0) (2024-05-28)


### Features

* allow address mocking in bitcoin monitor ([#2347](https://github.com/ExodusMovement/assets/issues/2347)) ([e11800d](https://github.com/ExodusMovement/assets/commit/e11800d2e8592580f837b4b272e44238230e8709))
* use asset config to override gap limit ([#2410](https://github.com/ExodusMovement/assets/issues/2410)) ([47f2840](https://github.com/ExodusMovement/assets/commit/47f2840e51c4f157a5bdbb72fce9423c2b733660))



## [2.15.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.15.0...@exodus/bitcoin-api@2.15.1) (2024-05-22)


### Bug Fixes

* async signing of bitcoin transaction ([#2343](https://github.com/ExodusMovement/assets/issues/2343)) ([6924e83](https://github.com/ExodusMovement/assets/commit/6924e832090737abce600393129e7e5b4f278f40))



## [2.15.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.14.1...@exodus/bitcoin-api@2.15.0) (2024-05-10)


### Features

* buffer signing for BTC ([#2059](https://github.com/ExodusMovement/assets/issues/2059)) ([4616324](https://github.com/ExodusMovement/assets/commit/46163247b24d130318b4cd69814a3b4863e89ce1)), closes [#2234](https://github.com/ExodusMovement/assets/issues/2234)



## [2.14.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.14.0...@exodus/bitcoin-api@2.14.1) (2024-05-09)


### Bug Fixes

* brc20 fee estimation ([#2229](https://github.com/ExodusMovement/assets/issues/2229)) ([191c997](https://github.com/ExodusMovement/assets/commit/191c997dcd39fea82d4d79780eff200d8d81bc10))



## [2.14.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.13.0...@exodus/bitcoin-api@2.14.0) (2024-05-07)


### Features

* **bitcoin-plugin:** add `web3.simulateTransaction` API ([#2220](https://github.com/ExodusMovement/assets/issues/2220)) ([a3f66bb](https://github.com/ExodusMovement/assets/commit/a3f66bb4e1ee2565a5cdf370de22577521944403))



## [2.13.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.12.1...@exodus/bitcoin-api@2.13.0) (2024-04-25)


### Features

* **bitcoin:** taproot multisig address creation and signing ([#2132](https://github.com/ExodusMovement/assets/issues/2132)) ([179a6e4](https://github.com/ExodusMovement/assets/commit/179a6e4fc875cfe1e616dcc67478ae473706e7c1))
* replace custom ecc with bitcoinerlab fork ([#1926](https://github.com/ExodusMovement/assets/issues/1926)) ([312374f](https://github.com/ExodusMovement/assets/commit/312374f350cabd46e460d5fa1790ee83b4b8d38b))



## [2.12.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.12.0...@exodus/bitcoin-api@2.12.1) (2024-04-22)


### Bug Fixes

* bitcoin ordinals and brc20 fee calculation ([#2130](https://github.com/ExodusMovement/assets/issues/2130)) ([f43e7d3](https://github.com/ExodusMovement/assets/commit/f43e7d35030b8e093b8f9247b469377d53bc9ca8))



## [2.12.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.10.1...@exodus/bitcoin-api@2.12.0) (2024-04-16)


### Features

* add getPrepareSendTransaction and make it available in bitcoin api ([#2060](https://github.com/ExodusMovement/assets/issues/2060)) ([4891835](https://github.com/ExodusMovement/assets/commit/489183511f20e5bff59c4d3babe198d08e1bbef1))
* **bitcoin:** add `asset.api.signMessage` ([#1993](https://github.com/ExodusMovement/assets/issues/1993)) ([a3c53c8](https://github.com/ExodusMovement/assets/commit/a3c53c808bc68c524122e88c433083ccbb8691c2))


### Bug Fixes

* add exodus user agent to headers in bitcoin websocket ([#1996](https://github.com/ExodusMovement/assets/issues/1996)) ([d553881](https://github.com/ExodusMovement/assets/commit/d553881a572847c787025d9ce92c73e52128e6a3))
* btc send refactoring missing params ([#2063](https://github.com/ExodusMovement/assets/issues/2063)) ([9d2ea7f](https://github.com/ExodusMovement/assets/commit/9d2ea7fcf6d322a121c83e4aed863eb13f89faa9))



## [2.11.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.10.1...@exodus/bitcoin-api@2.11.0) (2024-04-15)


### Features

* add getPrepareSendTransaction and make it available in bitcoin api ([#2060](https://github.com/ExodusMovement/assets/issues/2060)) ([4891835](https://github.com/ExodusMovement/assets/commit/489183511f20e5bff59c4d3babe198d08e1bbef1))


### Bug Fixes

* add exodus user agent to headers in bitcoin websocket ([#1996](https://github.com/ExodusMovement/assets/issues/1996)) ([d553881](https://github.com/ExodusMovement/assets/commit/d553881a572847c787025d9ce92c73e52128e6a3))
* btc send refactoring missing params ([#2063](https://github.com/ExodusMovement/assets/issues/2063)) ([9d2ea7f](https://github.com/ExodusMovement/assets/commit/9d2ea7fcf6d322a121c83e4aed863eb13f89faa9))



## [2.10.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.10.0...@exodus/bitcoin-api@2.10.1) (2024-04-01)


### Bug Fixes

* doge number unit private access ([#1929](https://github.com/ExodusMovement/assets/issues/1929)) ([9ebb009](https://github.com/ExodusMovement/assets/commit/9ebb009fd730659a14877dd3f7af709868e7bdac))



## [2.10.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.9.6...@exodus/bitcoin-api@2.10.0) (2024-03-28)


### Features

* **bitcoin:** Port priority fee sorting ([#1885](https://github.com/ExodusMovement/assets/issues/1885)) ([e217547](https://github.com/ExodusMovement/assets/commit/e217547b0b4dbc92bf3e908acd42a6f26d4be1c6))


### Bug Fixes

* Revert "fix: @noble/secp256k1 to use @noble/hashes ([#1850](https://github.com/ExodusMovement/assets/issues/1850))" ([#1915](https://github.com/ExodusMovement/assets/issues/1915)) ([a2d89ad](https://github.com/ExodusMovement/assets/commit/a2d89ad7892c33382c3754fe8a8eab247d311fb1))



## [2.9.6](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.9.5...@exodus/bitcoin-api@2.9.6) (2024-03-22)


### Bug Fixes

* @noble/secp256k1 to use @noble/hashes ([#1850](https://github.com/ExodusMovement/assets/issues/1850)) ([c7d64be](https://github.com/ExodusMovement/assets/commit/c7d64be1a3aca822d039572c9b89068777758643))



## [2.9.5](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.9.3...@exodus/bitcoin-api@2.9.5) (2024-03-18)


### Performance Improvements

* remove bip-schnorr custom implementation ([#1783](https://github.com/ExodusMovement/assets/issues/1783)) ([f07a177](https://github.com/ExodusMovement/assets/commit/f07a17740cf21b0945dd487ad37ee76c9a0ac2ac))


## [2.9.4](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.9.3...@exodus/bitcoin-api@2.9.4) (2024-03-18)


### Performance Improvements

* bitcoin unfork bitcoinjs and bolt11 dependencies ([#1730](https://github.com/ExodusMovement/assets/issues/1730)) ([94fd0b9](https://github.com/ExodusMovement/assets/commit/94fd0b94fab17a7876dac7fdf0b708bcda115403))





## [2.9.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-api@2.9.2...@exodus/bitcoin-api@2.9.3) (2024-02-28)


### Bug Fixes

* do not expose bitcoin private key in error message ([#1596](https://github.com/ExodusMovement/assets/issues/1596)) ([ea247b4](https://github.com/ExodusMovement/assets/commit/ea247b4295b9f96e379406c7574245a9934fd1b1))


### Reverts

* Revert "Publish" ([adb8015](https://github.com/ExodusMovement/assets/commit/adb8015efd51a4fa36ad0c86c28cb2d94c52a578))
