# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.1.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@2.1.0...@exodus/bitcoin-plugin@2.1.1) (2025-08-06)


### Bug Fixes


* fix: bump bitcoin-api to v4 (#6208)



## [2.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@2.0.0...@exodus/bitcoin-plugin@2.1.0) (2025-07-16)


### Features


* feat: move send validation to each asset plugin (#6076)



## [2.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.35.1...@exodus/bitcoin-plugin@2.0.0) (2025-07-11)


### ⚠ BREAKING CHANGES

* remove deprecated asset.getSpendableBalance and asset.getAvailableBalance  (#6013)


* refactor!: remove deprecated asset.getSpendableBalance and asset.getAvailableBalance  (#6013)



## [1.35.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.35.0...@exodus/bitcoin-plugin@1.35.1) (2025-07-04)


### Bug Fixes


* fix: use fee data from balances (#6018)



## [1.35.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.34.0...@exodus/bitcoin-plugin@1.35.0) (2025-07-03)


### Features


* feat: use get-activity-txs in bitcoin and litecoin (#6010)



## [1.34.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.33.1...@exodus/bitcoin-plugin@1.34.0) (2025-05-09)


### Features


* feat: make multipleAddresses support configurable (#5585)



## [1.33.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.33.0...@exodus/bitcoin-plugin@1.33.1) (2025-04-21)


### Bug Fixes


* fix: prevent app crash by adding null checks for toBaseNumber method (#5376)



## [1.33.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.32.2...@exodus/bitcoin-plugin@1.33.0) (2025-04-01)


### Features


* feat(bitcoin): allow message signing with external signer (#5365)



## [1.32.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.32.1...@exodus/bitcoin-plugin@1.32.2) (2025-03-19)


### Bug Fixes


* fix: remove brc20 dead code (#5286)

* fix: spelling (#5284)



## [1.32.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.32.0...@exodus/bitcoin-plugin@1.32.1) (2025-01-27)


### Bug Fixes


* fix: ETH web3 assert typo (#4826)



## [1.32.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.31.1...@exodus/bitcoin-plugin@1.32.0) (2025-01-10)


### Features


* feat: bitcoin dust fee display (#4789)



## [1.31.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.31.0...@exodus/bitcoin-plugin@1.31.1) (2025-01-08)


### Bug Fixes


* fix: reduce bitcoin change dust to 1500 (#4795)



## [1.31.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.30.2...@exodus/bitcoin-plugin@1.31.0) (2024-12-13)


### Features


* feat: add activity index (#4708)



## [1.30.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.30.1...@exodus/bitcoin-plugin@1.30.2) (2024-12-13)


### Bug Fixes


* fix: allow uncompressed private key import (#4705)



## [1.30.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.30.0...@exodus/bitcoin-plugin@1.30.1) (2024-12-12)


### License


* license: re-license under MIT license (#4580)



## [1.30.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.29.2...@exodus/bitcoin-plugin@1.30.0) (2024-12-09)


### Features


* feat: customFees api (#4653)



## [1.29.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.29.1...@exodus/bitcoin-plugin@1.29.2) (2024-12-04)


### Bug Fixes


* fix: bitcoin use utxo.derivationPath path to resolve purpose (#4541)

* fix: fetch and require raw txs for segwit inputs (#4399)



## [1.29.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.29.0...@exodus/bitcoin-plugin@1.29.1) (2024-10-31)


### Bug Fixes

* stringify sent amount NU's ([#4433](https://github.com/ExodusMovement/assets/issues/4433)) ([f2886a8](https://github.com/ExodusMovement/assets/commit/f2886a85060f5e347df9bb2bf892bb52257ece6b)), closes [#4437](https://github.com/ExodusMovement/assets/issues/4437)



## [1.29.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.28.0...@exodus/bitcoin-plugin@1.29.0) (2024-10-17)


### Features

* **bitcoin-api:** switch from ecpair to plain keys ([#4043](https://github.com/ExodusMovement/assets/issues/4043)) ([dac115d](https://github.com/ExodusMovement/assets/commit/dac115daadbb2e2f8933eef152ba3c3c0a5f9fce))
* **bitcoin-plugin:** switch to exodus/crypto for secp256k1 ([#4073](https://github.com/ExodusMovement/assets/issues/4073)) ([73f2e19](https://github.com/ExodusMovement/assets/commit/73f2e19dcb055527c410c705558b04f090947d1a))
* btc-like unconfirmed received ([#4277](https://github.com/ExodusMovement/assets/issues/4277)) ([70d4b73](https://github.com/ExodusMovement/assets/commit/70d4b73811acd87265ad2c1fcf984afb5a89df73))


### Bug Fixes

* reduce max pubkeys for multisig to 16 ([#4108](https://github.com/ExodusMovement/assets/issues/4108)) ([8c4c33b](https://github.com/ExodusMovement/assets/commit/8c4c33b08c5dc0786d601887e08b413a780b32a7))
* remove stray direct dependencies ([#4176](https://github.com/ExodusMovement/assets/issues/4176)) ([c4f93fa](https://github.com/ExodusMovement/assets/commit/c4f93fad5a930b40d326d7add1093b2d4f243f2a))



## [1.28.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.27.0...@exodus/bitcoin-plugin@1.28.0) (2024-09-25)


### Features

* make secp256k1 ecc dependency explicit in bitcoin-plugin ([#3991](https://github.com/ExodusMovement/assets/issues/3991)) ([048f06e](https://github.com/ExodusMovement/assets/commit/048f06e05f23f23cabc6c6540c578ac73886bb4a))
* move ec-pair and script-classify to bitcoinjs ([#4001](https://github.com/ExodusMovement/assets/issues/4001)) ([adb759b](https://github.com/ExodusMovement/assets/commit/adb759be5b264194f216b6a8f65d370f63555d81))
* unfork bitcoinjs-lib ([#3968](https://github.com/ExodusMovement/assets/issues/3968)) ([287ba8f](https://github.com/ExodusMovement/assets/commit/287ba8f4e7dacb0f4eb91f31090b74a67eb78733))
* use a single secp256k1 impl in bitcoin-plugin ([#3992](https://github.com/ExodusMovement/assets/issues/3992)) ([b37ee99](https://github.com/ExodusMovement/assets/commit/b37ee99f684ee164bb872be7b1ee3d5bd1f72276))



## [1.27.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.26.1...@exodus/bitcoin-plugin@1.27.0) (2024-09-24)


### Features

* **bitcoin-plugin:** normalize secp256k1 usage ([#3959](https://github.com/ExodusMovement/assets/issues/3959)) ([40bd79d](https://github.com/ExodusMovement/assets/commit/40bd79d78d3865e5148f3c448ac293669a5f14b0))



## [1.26.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.26.0...@exodus/bitcoin-plugin@1.26.1) (2024-09-13)


### Bug Fixes

* **BTC:** allow internal pubkey and sort xonly for multisig ([#3634](https://github.com/ExodusMovement/assets/issues/3634)) ([808bf65](https://github.com/ExodusMovement/assets/commit/808bf65f05576e2758bb32ad5654143577db7c38))



## [1.26.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.25.2...@exodus/bitcoin-plugin@1.26.0) (2024-09-11)


### Features

* switch bitcoin to ESM ([#3433](https://github.com/ExodusMovement/assets/issues/3433)) ([8a2740f](https://github.com/ExodusMovement/assets/commit/8a2740f19401777e3333b89a2b7ac15febcb6bb8)), closes [#3286](https://github.com/ExodusMovement/assets/issues/3286)


### Bug Fixes

* **bitcoin-plugin:** unpin key-utils dep ([#3309](https://github.com/ExodusMovement/assets/issues/3309)) ([90bb480](https://github.com/ExodusMovement/assets/commit/90bb4806cef9050f2754bc5aa0f1c09af21536ac))
* change regtest tests to bitcoin ([#3283](https://github.com/ExodusMovement/assets/issues/3283)) ([c530339](https://github.com/ExodusMovement/assets/commit/c53033980f56681d647d55f1b01e1caaae9420db))



## [1.25.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.25.1...@exodus/bitcoin-plugin@1.25.2) (2024-08-18)


### Bug Fixes

* pass allowUnconfirmed option through in batch-tx ([#3177](https://github.com/ExodusMovement/assets/issues/3177)) ([d8e073b](https://github.com/ExodusMovement/assets/commit/d8e073b4c66c79dae5808877f5c4d4cc98d93444))



## [1.25.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.25.0...@exodus/bitcoin-plugin@1.25.1) (2024-08-13)

**Note:** Version bump only for package @exodus/bitcoin-plugin





## [1.25.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.24.0...@exodus/bitcoin-plugin@1.25.0) (2024-08-12)


### Features

* bitcoin-likes plugin default export ([#3148](https://github.com/ExodusMovement/assets/issues/3148)) ([68460e1](https://github.com/ExodusMovement/assets/commit/68460e15fae473c96c1d4239449524fe6fd5658d))



## [1.24.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.23.0...@exodus/bitcoin-plugin@1.24.0) (2024-08-08)


### Features

* move ME BTC  monitor to the ME codebase ([#3118](https://github.com/ExodusMovement/assets/issues/3118)) ([2610e96](https://github.com/ExodusMovement/assets/commit/2610e966f5d078e6b9d87a08c4d86ad090400583))



## [1.23.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.22.3...@exodus/bitcoin-plugin@1.23.0) (2024-08-08)


### Features

* **bitcoin-plugin:** bump `@exodus/web3-bitcoin-utils` ([#3037](https://github.com/ExodusMovement/assets/issues/3037)) ([1d565ad](https://github.com/ExodusMovement/assets/commit/1d565adae0551936470b045b0e51c4ce94c0c76d))



## [1.22.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.22.2...@exodus/bitcoin-plugin@1.22.3) (2024-08-05)


### Bug Fixes

* always add inputs to txLog data ([#3071](https://github.com/ExodusMovement/assets/issues/3071)) ([68b5339](https://github.com/ExodusMovement/assets/commit/68b53397b78ed11a94babd821fc8fe2625558ef5))



## [1.22.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.22.1...@exodus/bitcoin-plugin@1.22.2) (2024-07-31)


### Bug Fixes

* pass compatibility mode to getKeyIdentifier ([#3048](https://github.com/ExodusMovement/assets/issues/3048)) ([61066f9](https://github.com/ExodusMovement/assets/commit/61066f958cafb59ab3b9be9234e9c8360ea51841))



## [1.22.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.22.0...@exodus/bitcoin-plugin@1.22.1) (2024-07-26)


### Bug Fixes

* btc like lint ([#2978](https://github.com/ExodusMovement/assets/issues/2978)) ([cfb0b91](https://github.com/ExodusMovement/assets/commit/cfb0b914b469728349c39673d268ad58b9f90f6f))
* disable multi address scanning in `multiAddressMode` is false ([#2984](https://github.com/ExodusMovement/assets/issues/2984)) ([37bab79](https://github.com/ExodusMovement/assets/commit/37bab79ec9bcb8e08850402dd5f71df823eddd3b))



## [1.22.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.21.1...@exodus/bitcoin-plugin@1.22.0) (2024-07-19)


### Features

* **BTC:** create batch tx from array of recipients ([#2881](https://github.com/ExodusMovement/assets/issues/2881)) ([440d5d5](https://github.com/ExodusMovement/assets/commit/440d5d5879c902ef10ff7644c92a5092bb868872))



## [1.21.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.21.0...@exodus/bitcoin-plugin@1.21.1) (2024-07-15)

**Note:** Version bump only for package @exodus/bitcoin-plugin





## [1.21.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.20.0...@exodus/bitcoin-plugin@1.21.0) (2024-07-09)


### Features

* **BTC:** add changeAddressType to createAsset config ([#2772](https://github.com/ExodusMovement/assets/issues/2772)) ([d8e38dd](https://github.com/ExodusMovement/assets/commit/d8e38dddfbe59b3e8ff9fc2432049bb512a91c22))



## [1.20.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.19.0...@exodus/bitcoin-plugin@1.20.0) (2024-07-05)


### Features

* **BTC:** add taprootInputWitnessSize for tx size estimation ([#2737](https://github.com/ExodusMovement/assets/issues/2737)) ([13f727a](https://github.com/ExodusMovement/assets/commit/13f727a836f9fc620628abb6a94a49c1a6774ca5))



## [1.19.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.18.1...@exodus/bitcoin-plugin@1.19.0) (2024-06-20)


### Features

* Remove ordinals wallet BTC from total balance ([#2524](https://github.com/ExodusMovement/assets/issues/2524)) ([3674bb1](https://github.com/ExodusMovement/assets/commit/3674bb1852aa50f8a8195da276a5b106d3ae1606))


### Bug Fixes

* bitcoinjs-lib bump, ecc cleanup ([#2634](https://github.com/ExodusMovement/assets/issues/2634)) ([96d47a5](https://github.com/ExodusMovement/assets/commit/96d47a508657389ba766bfd44feef7365eb0de9b))



## [1.18.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.18.0...@exodus/bitcoin-plugin@1.18.1) (2024-06-04)


### Bug Fixes

* pass all opts to getSupportedPurposes in factory ([#2445](https://github.com/ExodusMovement/assets/issues/2445)) ([c213d74](https://github.com/ExodusMovement/assets/commit/c213d741e35492a12755317c9b88170dee4a29c6))



## [1.18.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.17.3...@exodus/bitcoin-plugin@1.18.0) (2024-05-28)


### Features

* add xverseNotMerged ([#2349](https://github.com/ExodusMovement/assets/issues/2349)) ([2e82254](https://github.com/ExodusMovement/assets/commit/2e82254ebe32524dfd92488481e6856f9715deb8))



## [1.17.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.17.2...@exodus/bitcoin-plugin@1.17.3) (2024-05-23)

**Note:** Version bump only for package @exodus/bitcoin-plugin





## [1.17.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.17.1...@exodus/bitcoin-plugin@1.17.2) (2024-05-17)


### Bug Fixes

* manually merge updated Tx properties ([#2311](https://github.com/ExodusMovement/assets/issues/2311)) ([8046c5e](https://github.com/ExodusMovement/assets/commit/8046c5eaa2c9b67f7c531fdf2c82d85a1d8000c7))



## [1.17.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.17.0...@exodus/bitcoin-plugin@1.17.1) (2024-05-14)


### Bug Fixes

* bump `@exodus/web3-bitcoin-utils` to 1.12.2 ([#2275](https://github.com/ExodusMovement/assets/issues/2275)) ([2a8b629](https://github.com/ExodusMovement/assets/commit/2a8b629b56d4f4c64ddccc84a3c123dd0389d66e))
* rename to plural ([#2266](https://github.com/ExodusMovement/assets/issues/2266)) ([954e79b](https://github.com/ExodusMovement/assets/commit/954e79ba25ae43a917ebfdec7d08714e34966d4f))



## [1.17.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.5...@exodus/bitcoin-plugin@1.17.0) (2024-05-10)


### Features

* buffer signing for BTC ([#2059](https://github.com/ExodusMovement/assets/issues/2059)) ([4616324](https://github.com/ExodusMovement/assets/commit/46163247b24d130318b4cd69814a3b4863e89ce1)), closes [#2234](https://github.com/ExodusMovement/assets/issues/2234)



## [1.16.5](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.4...@exodus/bitcoin-plugin@1.16.5) (2024-05-09)


### Bug Fixes

* brc20 fee estimation ([#2229](https://github.com/ExodusMovement/assets/issues/2229)) ([191c997](https://github.com/ExodusMovement/assets/commit/191c997dcd39fea82d4d79780eff200d8d81bc10))



## [1.16.4](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.3...@exodus/bitcoin-plugin@1.16.4) (2024-05-09)


### Bug Fixes

* **bitcoin-plugin:** simulation API calls ([#2237](https://github.com/ExodusMovement/assets/issues/2237)) ([03c01d7](https://github.com/ExodusMovement/assets/commit/03c01d7ab0493f0e78ec9d364c63d903482b10d7))



## [1.16.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.2...@exodus/bitcoin-plugin@1.16.3) (2024-05-08)


### Bug Fixes

* provide `assetName` to createGetKeyIdentifier ([#2191](https://github.com/ExodusMovement/assets/issues/2191)) ([55e5171](https://github.com/ExodusMovement/assets/commit/55e5171b142fd72ff88b645f02f0ad358b93ccf8))



## [1.16.2](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.1...@exodus/bitcoin-plugin@1.16.2) (2024-05-08)

**Note:** Version bump only for package @exodus/bitcoin-plugin





## [1.16.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.16.0...@exodus/bitcoin-plugin@1.16.1) (2024-05-07)


### Bug Fixes

* revert "support BTC legacy address on trezor (#1807)" ([#2212](https://github.com/ExodusMovement/assets/issues/2212)) ([30f9c79](https://github.com/ExodusMovement/assets/commit/30f9c794043704512da41abff6282a7aabd15517))


## [1.16.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.15.0...@exodus/bitcoin-plugin@1.16.0) (2024-05-07)


### Features

* **bitcoin-plugin:** add `web3.simulateTransaction` API ([#2220](https://github.com/ExodusMovement/assets/issues/2220)) ([a3f66bb](https://github.com/ExodusMovement/assets/commit/a3f66bb4e1ee2565a5cdf370de22577521944403))



## [1.15.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.13.0...@exodus/bitcoin-plugin@1.15.0) (2024-05-06)


### Features

* add option to omit supported purposes ([#2217](https://github.com/ExodusMovement/assets/issues/2217)) ([f0f2866](https://github.com/ExodusMovement/assets/commit/f0f286644eeb5a71a1645de0e8e7ce3a8143769e))
* **BTC:** only support purpose 86 for multisig wallet accounts ([#2214](https://github.com/ExodusMovement/assets/issues/2214)) ([adac906](https://github.com/ExodusMovement/assets/commit/adac906c22d9a183531070015a7d5ff65a39b581))



## [1.14.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.13.0...@exodus/bitcoin-plugin@1.14.0) (2024-05-06)


### Features

* add option to omit supported purposes ([#2217](https://github.com/ExodusMovement/assets/issues/2217)) ([f0f2866](https://github.com/ExodusMovement/assets/commit/f0f286644eeb5a71a1645de0e8e7ce3a8143769e))



## [1.13.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.12.1...@exodus/bitcoin-plugin@1.13.0) (2024-04-25)


### Features

* **bitcoin:** taproot multisig address creation and signing ([#2132](https://github.com/ExodusMovement/assets/issues/2132)) ([179a6e4](https://github.com/ExodusMovement/assets/commit/179a6e4fc875cfe1e616dcc67478ae473706e7c1))



## [1.12.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.12.0...@exodus/bitcoin-plugin@1.12.1) (2024-04-22)


### Bug Fixes

* bitcoin ordinals and brc20 fee calculation ([#2130](https://github.com/ExodusMovement/assets/issues/2130)) ([f43e7d3](https://github.com/ExodusMovement/assets/commit/f43e7d35030b8e093b8f9247b469377d53bc9ca8))



## [1.12.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.10.1...@exodus/bitcoin-plugin@1.12.0) (2024-04-16)


### Features

* add getPrepareSendTransaction and make it available in bitcoin api ([#2060](https://github.com/ExodusMovement/assets/issues/2060)) ([4891835](https://github.com/ExodusMovement/assets/commit/489183511f20e5bff59c4d3babe198d08e1bbef1))
* **bitcoin:** add `asset.api.signMessage` ([#1993](https://github.com/ExodusMovement/assets/issues/1993)) ([a3c53c8](https://github.com/ExodusMovement/assets/commit/a3c53c808bc68c524122e88c433083ccbb8691c2))



## [1.11.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.10.1...@exodus/bitcoin-plugin@1.11.0) (2024-04-15)


### Features

* add getPrepareSendTransaction and make it available in bitcoin api ([#2060](https://github.com/ExodusMovement/assets/issues/2060)) ([4891835](https://github.com/ExodusMovement/assets/commit/489183511f20e5bff59c4d3babe198d08e1bbef1))



## [1.10.1](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.10.0...@exodus/bitcoin-plugin@1.10.1) (2024-04-01)


### Bug Fixes

* do not require arg in `getDefaultAddressPath` ([#1914](https://github.com/ExodusMovement/assets/issues/1914)) ([0a44064](https://github.com/ExodusMovement/assets/commit/0a440649b568f9a3a31cb9172b8f1e8d087197f6))



## [1.10.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.9.0...@exodus/bitcoin-plugin@1.10.0) (2024-03-28)


### Features

* **bitcoin:** Increase time between BRC20 refresh ([#1858](https://github.com/ExodusMovement/assets/issues/1858)) ([190090c](https://github.com/ExodusMovement/assets/commit/190090c44c4a34da7a6347146814c832ea8f55b9))
* **bitcoin:** Port priority fee sorting ([#1885](https://github.com/ExodusMovement/assets/issues/1885)) ([e217547](https://github.com/ExodusMovement/assets/commit/e217547b0b4dbc92bf3e908acd42a6f26d4be1c6))
* **bitcoin:** Switch to brc20 v2 endpoint ([#1846](https://github.com/ExodusMovement/assets/issues/1846)) ([a1960b4](https://github.com/ExodusMovement/assets/commit/a1960b49926c721b0933368ddcd02f7e1133b2bb))



## [1.9.0](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.8.3...@exodus/bitcoin-plugin@1.9.0) (2024-03-25)


### Features

* add isTestnet flag ([#1887](https://github.com/ExodusMovement/assets/issues/1887)) ([7f6ac2b](https://github.com/ExodusMovement/assets/commit/7f6ac2ba9ce6a402214a60cf90888a37d1faac02))


### Bug Fixes

* support BTC legacy address on trezor ([#1807](https://github.com/ExodusMovement/assets/issues/1807)) ([0bffad2](https://github.com/ExodusMovement/assets/commit/0bffad20d6348fe461636372c5feb4f5a00f6e22))



## [1.8.3](https://github.com/ExodusMovement/assets/compare/@exodus/bitcoin-plugin@1.8.2...@exodus/bitcoin-plugin@1.8.3) (2024-03-18)


### Performance Improvements

* bitcoin unfork bitcoinjs and bolt11 dependencies ([#1730](https://github.com/ExodusMovement/assets/issues/1730)) ([94fd0b9](https://github.com/ExodusMovement/assets/commit/94fd0b94fab17a7876dac7fdf0b708bcda115403))


### Reverts

* Revert "Publish" ([adb8015](https://github.com/ExodusMovement/assets/commit/adb8015efd51a4fa36ad0c86c28cb2d94c52a578))
