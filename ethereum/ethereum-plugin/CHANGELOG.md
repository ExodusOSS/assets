# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.14.2](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.14.1...@exodus/ethereum-plugin@2.14.2) (2025-08-19)


### Bug Fixes


* fix: remove unused isExchange (#6301)



## [2.14.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.14.0...@exodus/ethereum-plugin@2.14.1) (2025-08-12)


### Bug Fixes


* fix: exchange compatibility (#6230)



## [2.14.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.13.0...@exodus/ethereum-plugin@2.14.0) (2025-08-04)


### Features


* feat: demote batch of ETH tokens (#6159)



## [2.13.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.12.1...@exodus/ethereum-plugin@2.13.0) (2025-08-01)


### Features


* feat: tx send split, tx-create (#5854)

* feat: use hydra modules in memory-wallet testing  (#6157)


### Bug Fixes


* fix: include assetName in txMeta (#6113)



## [2.12.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.12.0...@exodus/ethereum-plugin@2.12.1) (2025-07-11)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.12.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.11.0...@exodus/ethereum-plugin@2.12.0) (2025-07-10)


### Features


* feat: add supersim optimistic fork testing (#5924)

* feat: set ethereum to use clarity v2 monitor (#5836)



## [2.11.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.10.1...@exodus/ethereum-plugin@2.11.0) (2025-07-01)


### Features


* feat: transaction bundles and private server gas estimation (#5953)



## [2.10.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.10.0...@exodus/ethereum-plugin@2.10.1) (2025-06-26)


### Bug Fixes


* fix: activate `currentTipGasPrice` for bumped transactions in `tx-send` (#5950)



## [2.10.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.9.0...@exodus/ethereum-plugin@2.10.0) (2025-06-20)


### Features


* feat: add `isPrivate` flag to `txSend` and export `transactionPrivacy` feature (#5906)

* feat: enable evm transaction privacy (#5869)



## [2.9.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.8.0...@exodus/ethereum-plugin@2.9.0) (2025-06-12)


### Features


* feat: remote config feeData.gasLimits (#5830)



## [2.8.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.6...@exodus/ethereum-plugin@2.8.0) (2025-06-11)


### Features


* feat: ethereum api use balances and nonces data (#5727)


### Bug Fixes


* fix: ethereum api cleaning up (#5832)

* fix: improve evm gas estimation when using arbitrary addresses (#5842)

* fix: prevent the isSendAll invariant from applying to smart contract to addresses (#5658)



## [2.7.6](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.5...@exodus/ethereum-plugin@2.7.6) (2025-05-07)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.7.5](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.4...@exodus/ethereum-plugin@2.7.5) (2025-04-29)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.7.4](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.3...@exodus/ethereum-plugin@2.7.4) (2025-04-03)


### Bug Fixes


* fix: populate the activeStakedBalance for matic and polygon staking (#5374)



## [2.7.3](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.2...@exodus/ethereum-plugin@2.7.3) (2025-03-06)


### Bug Fixes


* fix: ethereum and matic staking service improvements (#5109)



## [2.7.2](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.1...@exodus/ethereum-plugin@2.7.2) (2025-02-20)


### Bug Fixes


* fix: ETH pending staking balance (#4816)



## [2.7.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.7.0...@exodus/ethereum-plugin@2.7.1) (2024-12-19)


### Bug Fixes


* fix: use gasPriceMultiplier when setting up min/max/recommended (#4700)


### License


* license: re-license under MIT license (#4694)



## [2.7.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.6.0...@exodus/ethereum-plugin@2.7.0) (2024-12-09)


### Features


* feat: customFees api (#4653)


### Bug Fixes


* fix: remove gasPriceEconomicalRate (#4659)

* fix: use multipled gasPrice when sending (#4628)



## [2.6.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.5.0...@exodus/ethereum-plugin@2.6.0) (2024-12-02)


### Features


* feat: gasPriceMaximumRate in evm fee data (#4578)


### Bug Fixes


* fix: polygon staking rewards typo (#4481)



## [2.5.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.4.2...@exodus/ethereum-plugin@2.5.0) (2024-11-05)


### Features

* introduce exodus/ethereumjs ([#4339](https://github.com/ExodusMovement/assets/issues/4339)) ([e81d577](https://github.com/ExodusMovement/assets/commit/e81d5771c4956a22cfcf434a999310bbb5be81a3))


### Bug Fixes

* ethereum create asset config initialization ([#4483](https://github.com/ExodusMovement/assets/issues/4483)) ([8a596d5](https://github.com/ExodusMovement/assets/commit/8a596d598c855203b6a5cac91c7fa36fb46f2842))



## [2.4.2](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.4.1...@exodus/ethereum-plugin@2.4.2) (2024-10-09)


### Bug Fixes

* hardening private methods ([#4165](https://github.com/ExodusMovement/assets/issues/4165)) ([cb04b39](https://github.com/ExodusMovement/assets/commit/cb04b39ee3a70abf9a13697e0998e1d55196aac7))
* staking splitIn32BytesArray hardening and improvements ([#4170](https://github.com/ExodusMovement/assets/issues/4170)) ([2a178ae](https://github.com/ExodusMovement/assets/commit/2a178aefc590186ee699e746d8e71bac1ab8198e))



## [2.4.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.4.0...@exodus/ethereum-plugin@2.4.1) (2024-09-12)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.4.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.3.0...@exodus/ethereum-plugin@2.4.0) (2024-09-11)


### Features

* switch ethereum to ESM ([#3374](https://github.com/ExodusMovement/assets/issues/3374)) ([d3a86c3](https://github.com/ExodusMovement/assets/commit/d3a86c3202754a0e6ab988d454d3e006ec11d9e4))



## [2.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.2.3...@exodus/ethereum-plugin@2.3.0) (2024-08-24)


### Features

* **ethereum-plugin:** bump `@exodus/web3-ethereum-utils` ([#3234](https://github.com/ExodusMovement/assets/issues/3234)) ([07329be](https://github.com/ExodusMovement/assets/commit/07329beef080533a9ebf79e434b8a5d54151e669))


### Bug Fixes

* migrate to safe report matcher for cosmos and ethereum ([#3210](https://github.com/ExodusMovement/assets/issues/3210)) ([da094a1](https://github.com/ExodusMovement/assets/commit/da094a12d3013933e03ca484d472fb84505b57b2))



## [2.2.3](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.2.2...@exodus/ethereum-plugin@2.2.3) (2024-08-13)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.2.2](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.2.1...@exodus/ethereum-plugin@2.2.2) (2024-07-26)


### Bug Fixes

* lint for EVM assets ([#2969](https://github.com/ExodusMovement/assets/issues/2969)) ([16ca272](https://github.com/ExodusMovement/assets/commit/16ca272524ab1530800ca84f1df045293c08a3aa))



## [2.2.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.2.0...@exodus/ethereum-plugin@2.2.1) (2024-07-09)


### Bug Fixes

* **ethereum:** false dropped tx check ([#2707](https://github.com/ExodusMovement/assets/issues/2707)) ([d05a8c8](https://github.com/ExodusMovement/assets/commit/d05a8c895563fb13120956c0081db7ebe86195d6))
* use proxied balance ([#2637](https://github.com/ExodusMovement/assets/issues/2637)) ([639ee0f](https://github.com/ExodusMovement/assets/commit/639ee0f55bc53a9e31c553865902ca3f0ad0f0b8))



## [2.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.1.2...@exodus/ethereum-plugin@2.2.0) (2024-06-25)


### Features

* add tokenAssetType to base asset ([#2298](https://github.com/ExodusMovement/assets/issues/2298)) ([80c9dc8](https://github.com/ExodusMovement/assets/commit/80c9dc8a4d2a8614f84b66d2c9649cdf19601443))


### Bug Fixes

* get fee async txInput ([#2665](https://github.com/ExodusMovement/assets/issues/2665)) ([20f9358](https://github.com/ExodusMovement/assets/commit/20f93587ade7291aff6a44872cbaead93b80d1f3))



## [2.1.2](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.1.1...@exodus/ethereum-plugin@2.1.2) (2024-06-14)


### Bug Fixes

* avax integration test ([#2372](https://github.com/ExodusMovement/assets/issues/2372)) ([0f614a2](https://github.com/ExodusMovement/assets/commit/0f614a2b9a41460af0124b628e83467a0a4b2d05))
* **ethereum:** duplicate 'confirmationsNumber' argument in createAsset() ([#2569](https://github.com/ExodusMovement/assets/issues/2569)) ([7472fe5](https://github.com/ExodusMovement/assets/commit/7472fe5476839f879bad4fc82a9085d84d6868e9))



## [2.1.1](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.1.0...@exodus/ethereum-plugin@2.1.1) (2024-05-20)

**Note:** Version bump only for package @exodus/ethereum-plugin





## [2.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@2.0.0...@exodus/ethereum-plugin@2.1.0) (2024-05-17)


### Features

* **ethereum-api:** expose `web3.simulateMessage` API ([#2302](https://github.com/ExodusMovement/assets/issues/2302)) ([fe97ec3](https://github.com/ExodusMovement/assets/commit/fe97ec3b6ae60d28b2f3ec2aed75aa228176b816))



## [2.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@1.3.0...@exodus/ethereum-plugin@2.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* evm chain data to be factory params (#2115)
* chain id param in create and sign tx (#2282)
* moved fee data to each EVM plugin (#2233)

### Features

* evm chain data to be factory params ([#2115](https://github.com/ExodusMovement/assets/issues/2115)) ([a2aeec1](https://github.com/ExodusMovement/assets/commit/a2aeec1b4da177b1e1bb85f92e93115fc97d5377))


### Code Refactoring

* chain id param in create and sign tx ([#2282](https://github.com/ExodusMovement/assets/issues/2282)) ([4d915ac](https://github.com/ExodusMovement/assets/commit/4d915ac60e49ebe9d4e36d2fcecf7c17777f13b9))
* moved fee data to each EVM plugin ([#2233](https://github.com/ExodusMovement/assets/issues/2233)) ([ec066c0](https://github.com/ExodusMovement/assets/commit/ec066c076bc36a4c7c05810e83cdd47a7a25384b))



## [1.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@1.2.0...@exodus/ethereum-plugin@1.3.0) (2024-05-10)


### Features

* **BTC:** only support purpose 86 for multisig wallet accounts ([#2214](https://github.com/ExodusMovement/assets/issues/2214)) ([adac906](https://github.com/ExodusMovement/assets/commit/adac906c22d9a183531070015a7d5ff65a39b581))



## [1.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/ethereum-plugin@1.1.0...@exodus/ethereum-plugin@1.2.0) (2024-05-01)


### Features

* eth unconfirmed receive/sent ([#2146](https://github.com/ExodusMovement/assets/issues/2146)) ([6b750c7](https://github.com/ExodusMovement/assets/commit/6b750c7d1f0ac633d72c285eaa31428a01cd1543))


### Bug Fixes

* **ethereum-api:** set ZERO fee if not supplied ([#2201](https://github.com/ExodusMovement/assets/issues/2201)) ([be11417](https://github.com/ExodusMovement/assets/commit/be1141792882a7f0ffbb754d51970b30b15923ea))



## 1.1.0 (2024-04-17)


### Features

* ethereum-plugin (EVM 4) ([#2023](https://github.com/ExodusMovement/assets/issues/2023)) ([3c897c5](https://github.com/ExodusMovement/assets/commit/3c897c572e423e54d53a5737415481ec4e3cd654))
* generic evm fee monitors ([#2104](https://github.com/ExodusMovement/assets/issues/2104)) ([70ef5fd](https://github.com/ExodusMovement/assets/commit/70ef5fdb8d87b67957eb56878868145867797af5))
