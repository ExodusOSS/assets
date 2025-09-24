# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.3.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@5.3.0...@exodus/send-validation@5.3.1) (2025-09-17)


### Bug Fixes


* fix: drop isAccountBased param from INVALID_ADDRESS validation (#6499)



## [5.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@5.2.0...@exodus/send-validation@5.3.0) (2025-09-15)


### Features


* feat: algorand new address details validation (#6446)


### Bug Fixes


* fix: remove deprecated xmrValidators and monero validation code (#6459)



## [5.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@5.1.0...@exodus/send-validation@5.2.0) (2025-09-10)


### Features


* feat: move address validation to plugins and add validation model (#6402)



## [5.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@5.0.0...@exodus/send-validation@5.1.0) (2025-08-04)


### Features


* feat: memo send validation (#6174)



## [5.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.2.0...@exodus/send-validation@5.0.0) (2025-07-16)

### ⚠ BREAKING CHANGES


* move send validation to each asset plugin (#6076)


### Features


* feat!: move send validation to each asset plugin (#6076)



## [4.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.5...@exodus/send-validation@4.2.0) (2025-07-16)


### Features


* feat: send-validation-model (#6100)



## [4.1.5](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.4...@exodus/send-validation@4.1.5) (2025-07-14)


### Bug Fixes


* fix: update bitcoin-api v3 (#6075)



## [4.1.4](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.3...@exodus/send-validation@4.1.4) (2025-07-04)


### Bug Fixes


* fix: SOL send validation with no amount provided (#5999)



## [4.1.3](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.2...@exodus/send-validation@4.1.3) (2025-06-30)


### Bug Fixes


* fix: remove stray neo-lib dep (#5972)



## [4.1.2](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.1...@exodus/send-validation@4.1.2) (2025-05-13)


### Bug Fixes


* fix: update send all gas warning copy, no warning when < 1 usd (#5631)



## [4.1.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.1.0...@exodus/send-validation@4.1.1) (2025-05-09)


### Bug Fixes


* fix: validate fees when sending nft (#5583)



## [4.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.0.1...@exodus/send-validation@4.1.0) (2025-05-08)


### Features


* feat: add cpfp and tax warnings to send-validation (#5579)



## [4.0.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@4.0.0...@exodus/send-validation@4.0.1) (2025-05-08)


### Bug Fixes


* fix: send-validation improvements (#5575)



## [4.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.1.1...@exodus/send-validation@4.0.0) (2025-05-06)


### ⚠ BREAKING CHANGES

* new send validation api (#5407)

### Features


* feat!: new send validation api (#5407)



## [3.1.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.1.0...@exodus/send-validation@3.1.1) (2025-04-08)


### Bug Fixes


* fix: solanaRentExemptAmountSenderValidator field (#5409)



## [3.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.7...@exodus/send-validation@3.1.0) (2025-04-08)


### Features


* feat: Solana rent except sender validation (#5394)


### Bug Fixes


* fix: xrpTooEarlyToDeleteValidator will now use the correct address details (#5404)



## [3.0.7](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.6...@exodus/send-validation@3.0.7) (2025-03-26)


### Bug Fixes


* fix: SOL validation rent (#5331)



## [3.0.6](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.5...@exodus/send-validation@3.0.6) (2025-03-25)


### Bug Fixes


* fix: ADA validation fee failback to zero (#4988)

* fix: SOL insufficient funds for rent (#5308)



## [3.0.5](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.4...@exodus/send-validation@3.0.5) (2025-01-09)


### Bug Fixes


* fix: send-validations invalid address update (#4803)



## [3.0.4](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.3...@exodus/send-validation@3.0.4) (2024-12-02)


### License


* license: re-license under MIT license (#4586)



## [3.0.3](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.2...@exodus/send-validation@3.0.3) (2024-11-18)


### Bug Fixes


* fix: remaining ADA balance validation when sending token (#4538)



## [3.0.2](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.1...@exodus/send-validation@3.0.2) (2024-10-28)


### Bug Fixes

* ADA token sending validation ([#4362](https://github.com/ExodusMovement/assets/issues/4362)) ([ee1ec21](https://github.com/ExodusMovement/assets/commit/ee1ec215ac87111993bf3d1283941c7e13a836e2))



## [3.0.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@3.0.0...@exodus/send-validation@3.0.1) (2024-10-16)


### Bug Fixes

* Cardano token sending validators ([#4265](https://github.com/ExodusMovement/assets/issues/4265)) ([f82e69d](https://github.com/ExodusMovement/assets/commit/f82e69dd37379d50d975e64afbce4f6c0ca6de15))



## [3.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@2.5.0...@exodus/send-validation@3.0.0) (2024-10-07)


### ⚠ BREAKING CHANGES

* remove `createValidationHook` (#4181). Use `createAsyncValidationHook` instead.

### Features

* remove `createValidationHook` ([#4181](https://github.com/ExodusMovement/assets/issues/4181)) ([a5d7876](https://github.com/ExodusMovement/assets/commit/a5d787675e6038198574e21639b0cd50d6ec17bd))


### Bug Fixes

* update solana pay validator ([#4178](https://github.com/ExodusMovement/assets/issues/4178)) ([00421a9](https://github.com/ExodusMovement/assets/commit/00421a9e90012f15fa8dd29c0affcdc3d5d457a9))



## [2.5.0](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@2.4.1...@exodus/send-validation@2.5.0) (2024-10-07)


### Features

* extract asset validations ([#4115](https://github.com/ExodusMovement/assets/issues/4115)) ([f0504a8](https://github.com/ExodusMovement/assets/commit/f0504a8e75a506485c08567c5de89c7df886efbb))



## [2.4.1](https://github.com/ExodusMovement/assets/compare/@exodus/send-validation@2.4.0...@exodus/send-validation@2.4.1) (2024-09-24)


### Bug Fixes

* validator assertion ([#3967](https://github.com/ExodusMovement/assets/issues/3967)) ([89f0e7e](https://github.com/ExodusMovement/assets/commit/89f0e7e388676b672e1193657b4ebe9d2bcb4a02))



## 2.4.0 (2024-09-24)


### Features

* add btc validators ([#3948](https://github.com/ExodusMovement/assets/issues/3948)) ([ce5e817](https://github.com/ExodusMovement/assets/commit/ce5e817314dac015fcf0876e4c19935f233a16fa))
* add send-validation ([#3945](https://github.com/ExodusMovement/assets/issues/3945)) ([594b0e6](https://github.com/ExodusMovement/assets/commit/594b0e60d9ed7b577399c8d97520642aed6ea17c))


### Bug Fixes

* test ([#3962](https://github.com/ExodusMovement/assets/issues/3962)) ([3c9046e](https://github.com/ExodusMovement/assets/commit/3c9046e4721ec4d87af010c920f9adb394556d19))



## [2.3.3](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.3.2...@exodus/send-validation@2.3.3) (2024-09-09)

**Note:** Version bump only for package @exodus/send-validation

## [2.3.2](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.3.1...@exodus/send-validation@2.3.2) (2024-08-23)

### Bug Fixes

- add null/undefined check on wrongAddressTypeValidator ([#8639](https://github.com/ExodusMovement/exodus-hydra/issues/8639)) ([2bbfe69](https://github.com/ExodusMovement/exodus-hydra/commit/2bbfe69b8a5487ac749cca3e54f29bb03b4b91a1))

## [2.3.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.3.0...@exodus/send-validation@2.3.1) (2024-08-13)

### Bug Fixes

- return undefined when validation doesnt' exist ([#8397](https://github.com/ExodusMovement/exodus-hydra/issues/8397)) ([578baf5](https://github.com/ExodusMovement/exodus-hydra/commit/578baf57ea75543a0f97529f92a8deeb2d6bf503))

## [2.3.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.2.0...@exodus/send-validation@2.3.0) (2024-07-05)

### Features

- label 2 more packages as type=module ([#7642](https://github.com/ExodusMovement/exodus-hydra/issues/7642)) ([3072942](https://github.com/ExodusMovement/exodus-hydra/commit/3072942bf6881dcf76660cdf53c4c7a07ca4e73f))

## [2.2.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.1.1...@exodus/send-validation@2.2.0) (2024-06-14)

### Features

- async validation hook ([#7384](https://github.com/ExodusMovement/exodus-hydra/issues/7384)) ([348d601](https://github.com/ExodusMovement/exodus-hydra/commit/348d60171dac032f3d9c1811cacaabeff63b90cc))

## [2.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.1.0...@exodus/send-validation@2.1.1) (2024-02-13)

**Note:** Version bump only for package @exodus/send-validation

## [2.1.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.0.0...@exodus/send-validation@2.1.0) (2023-09-28)

### Features

- dont break all validations if one is faulty ([#4259](https://github.com/ExodusMovement/exodus-hydra/issues/4259)) ([3254cef](https://github.com/ExodusMovement/exodus-hydra/commit/3254cef41a1aa09acaf3ed588fc91da29b766589))

### Bug Fixes

- createValidationHook ([#4194](https://github.com/ExodusMovement/exodus-hydra/issues/4194)) ([ff7ea4c](https://github.com/ExodusMovement/exodus-hydra/commit/ff7ea4c50bd4cbafb0f324090f0f279fcc719366))

## [2.0.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@2.0.0...@exodus/send-validation@2.0.1) (2023-09-22)

### Bug Fixes

- createValidationHook ([#4194](https://github.com/ExodusMovement/exodus-hydra/issues/4194)) ([ff7ea4c](https://github.com/ExodusMovement/exodus-hydra/commit/ff7ea4c50bd4cbafb0f324090f0f279fcc719366))

## [2.0.0](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@1.1.1...@exodus/send-validation@2.0.0) (2023-09-19)

### ⚠ BREAKING CHANGES

- improve send validations (#4120)

### Features

- improve send validations ([#4120](https://github.com/ExodusMovement/exodus-hydra/issues/4120)) ([1c4f218](https://github.com/ExodusMovement/exodus-hydra/commit/1c4f218403e9182b5c87db21fd50441a8fe3b0a5))

## [1.1.1](https://github.com/ExodusMovement/exodus-hydra/compare/@exodus/send-validation@1.1.0...@exodus/send-validation@1.1.1) (2023-09-15)

### Bug Fixes

- **@exodus/send-validation:** documentation, cycling loop and js errors ([#4043](https://github.com/ExodusMovement/exodus-hydra/issues/4043)) ([9a2f1c1](https://github.com/ExodusMovement/exodus-hydra/commit/9a2f1c136a3d9a048565bfc57e89c4863d6976b4))

## 1.1.0 (2023-09-01)

### Features

- **@exodus/send-validation:** send screen validation library ([#3322](https://github.com/ExodusMovement/exodus-hydra/issues/3322)) ([e4fed92](https://github.com/ExodusMovement/exodus-hydra/commit/e4fed9225e03021c9c183c7339ee88e7acdc2264))
