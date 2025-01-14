# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.3.2](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@2.3.1...@exodus/basemainnet-plugin@2.3.2) (2024-12-12)


### Bug Fixes


* fix: remove gasPriceEconomicalRate (#4659)


### License


* license: re-license under MIT license (#4580)



## [2.3.1](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@2.3.0...@exodus/basemainnet-plugin@2.3.1) (2024-12-03)


### Bug Fixes


* fix: increase gasLimit estimation when from or to address are unknown (#4594)



## [2.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@2.2.0...@exodus/basemainnet-plugin@2.3.0) (2024-12-02)


### Features


* feat: gasPriceMaximumRate in evm fee data (#4578)



## [2.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@2.1.0...@exodus/basemainnet-plugin@2.2.0) (2024-09-11)


### Features

* add tokenAssetType to base asset ([#2298](https://github.com/ExodusMovement/assets/issues/2298)) ([80c9dc8](https://github.com/ExodusMovement/assets/commit/80c9dc8a4d2a8614f84b66d2c9649cdf19601443))
* switch ethereum to ESM ([#3374](https://github.com/ExodusMovement/assets/issues/3374)) ([d3a86c3](https://github.com/ExodusMovement/assets/commit/d3a86c3202754a0e6ab988d454d3e006ec11d9e4))


### Bug Fixes

* lint for EVM assets ([#2969](https://github.com/ExodusMovement/assets/issues/2969)) ([16ca272](https://github.com/ExodusMovement/assets/commit/16ca272524ab1530800ca84f1df045293c08a3aa))



## [2.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@2.0.0...@exodus/basemainnet-plugin@2.1.0) (2024-05-23)


### Features

* evm getFeeAsync ([#2216](https://github.com/ExodusMovement/assets/issues/2216)) ([fe47657](https://github.com/ExodusMovement/assets/commit/fe476577793d06267b698eee1e0fd7ebd60fb366))



## [2.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@1.2.0...@exodus/basemainnet-plugin@2.0.0) (2024-05-17)


### ⚠ BREAKING CHANGES

* evm chain data to be factory params (#2115)
* moved fee data to each EVM plugin (#2233)

### Features

* **BTC:** only support purpose 86 for multisig wallet accounts ([#2214](https://github.com/ExodusMovement/assets/issues/2214)) ([adac906](https://github.com/ExodusMovement/assets/commit/adac906c22d9a183531070015a7d5ff65a39b581))
* evm baseFeePerGas fee monitor ([#2194](https://github.com/ExodusMovement/assets/issues/2194)) ([0739c97](https://github.com/ExodusMovement/assets/commit/0739c97568741394d1eb542332a4ccbbc6eaccb9))
* evm chain data to be factory params ([#2115](https://github.com/ExodusMovement/assets/issues/2115)) ([a2aeec1](https://github.com/ExodusMovement/assets/commit/a2aeec1b4da177b1e1bb85f92e93115fc97d5377))


### Bug Fixes

* enable Base eip1559 ([#2210](https://github.com/ExodusMovement/assets/issues/2210)) ([8b7e807](https://github.com/ExodusMovement/assets/commit/8b7e807907e961aae47d3beb50cd69502e5a04e2))


### Code Refactoring

* moved fee data to each EVM plugin ([#2233](https://github.com/ExodusMovement/assets/issues/2233)) ([ec066c0](https://github.com/ExodusMovement/assets/commit/ec066c076bc36a4c7c05810e83cdd47a7a25384b))



## [1.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@1.2.0...@exodus/basemainnet-plugin@1.3.0) (2024-05-04)


### Features

* evm baseFeePerGas fee monitor ([#2194](https://github.com/ExodusMovement/assets/issues/2194)) ([0739c97](https://github.com/ExodusMovement/assets/commit/0739c97568741394d1eb542332a4ccbbc6eaccb9))


### Bug Fixes

* enable Base eip1559 ([#2210](https://github.com/ExodusMovement/assets/issues/2210)) ([8b7e807](https://github.com/ExodusMovement/assets/commit/8b7e807907e961aae47d3beb50cd69502e5a04e2))



## [1.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@1.1.0...@exodus/basemainnet-plugin@1.2.0) (2024-04-24)


### Features

* EVM l1 gas estimation ([#2159](https://github.com/ExodusMovement/assets/issues/2159)) ([c23584e](https://github.com/ExodusMovement/assets/commit/c23584e04e2ba47538e5134c73ecba3d337cda0f))



## [1.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/basemainnet-plugin@1.0.0...@exodus/basemainnet-plugin@1.1.0) (2024-04-17)


### Features

* generic evm fee monitors ([#2104](https://github.com/ExodusMovement/assets/issues/2104)) ([70ef5fd](https://github.com/ExodusMovement/assets/commit/70ef5fdb8d87b67957eb56878868145867797af5))
