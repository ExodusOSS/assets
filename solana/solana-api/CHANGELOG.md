# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.13.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.13.1...@exodus/solana-api@3.13.2) (2025-01-09)


### Bug Fixes


* fix: solana missing txId of dexTxs (#4818)


### License


* license: re-license under MIT license (#4814)



## [3.13.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.13.0...@exodus/solana-api@3.13.1) (2025-01-09)


### Bug Fixes


* fix: missing token transaction when parsing solana transactions (#4788)



## [3.13.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.12.1...@exodus/solana-api@3.13.0) (2025-01-08)


### Features


* feat: add SOL waitForTransactionStatus method (#4800)



## [3.12.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.12.0...@exodus/solana-api@3.12.1) (2025-01-02)


### Bug Fixes


* fix: solana nft send (#4768)



## [3.12.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.9...@exodus/solana-api@3.12.0) (2025-01-02)


### Features


* feat: reduce call of Solana getTokenAccountsByOwner (#4762)



## [3.11.9](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.8...@exodus/solana-api@3.11.9) (2024-12-31)


### Bug Fixes


* fix: include rentExemptAmount in balance calculation (#4738)

* fix: integration tests (#4720)



## [3.11.8](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.6...@exodus/solana-api@3.11.8) (2024-12-10)


### Bug Fixes


* fix: prevent invalid account owner (#4485)

* fix: SOL rename deprecated methods (#4512)


### License


* license: re-license under MIT license (#4515)



## [3.11.7](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.6...@exodus/solana-api@3.11.7) (2024-11-06)


### Bug Fixes

* prevent invalid account owner ([#4485](https://github.com/ExodusMovement/assets/issues/4485)) ([ca9474c](https://github.com/ExodusMovement/assets/commit/ca9474c79ff81d120fcecc9e9c4087f594f45845))



## [3.11.6](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.5...@exodus/solana-api@3.11.6) (2024-10-24)


### Bug Fixes

* clean SOL stake activation ([#4358](https://github.com/ExodusMovement/assets/issues/4358)) ([f57a84d](https://github.com/ExodusMovement/assets/commit/f57a84d2b233c58dd100deba82c11d8225ec12d6))



## [3.11.5](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.4...@exodus/solana-api@3.11.5) (2024-10-24)


### Bug Fixes

* SOL activation state ([#4347](https://github.com/ExodusMovement/assets/issues/4347)) ([534a39c](https://github.com/ExodusMovement/assets/commit/534a39c4210eedce70736e70753902cce2e25565))



## [3.11.4](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.3...@exodus/solana-api@3.11.4) (2024-10-24)


### Bug Fixes

* solana monitor tokenAssetType ([#4349](https://github.com/ExodusMovement/assets/issues/4349)) ([e69b4f8](https://github.com/ExodusMovement/assets/commit/e69b4f81e0e6950f512de93effce7da6974bd94a))



## [3.11.3](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.2...@exodus/solana-api@3.11.3) (2024-10-23)


### Bug Fixes

* solana-api to use the right tokenAssetType ([#4331](https://github.com/ExodusMovement/assets/issues/4331)) ([d8f0be9](https://github.com/ExodusMovement/assets/commit/d8f0be9be29f286a75a6fdc2c112f004d7816842))



## [3.11.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.1...@exodus/solana-api@3.11.2) (2024-10-10)


### Bug Fixes

* SOL doc old references ([#4168](https://github.com/ExodusMovement/assets/issues/4168)) ([73e5516](https://github.com/ExodusMovement/assets/commit/73e5516109f9a3c2012198ef8aa68fc0a5032d5d))



## [3.11.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.11.0...@exodus/solana-api@3.11.1) (2024-09-11)


### Bug Fixes

* disable unused SOL ws connection ([#3571](https://github.com/ExodusMovement/assets/issues/3571)) ([c7c790c](https://github.com/ExodusMovement/assets/commit/c7c790c0c710c3d46b5fb653713e7b4cd3c05e0c))



## [3.11.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.10.1...@exodus/solana-api@3.11.0) (2024-09-11)


### Features

* switch solana to ESM ([#3412](https://github.com/ExodusMovement/assets/issues/3412)) ([c1d30ce](https://github.com/ExodusMovement/assets/commit/c1d30ce752c9d2aa0667f98a8b90a55396fec286))


### Bug Fixes

* exodus/asset-json-rpc is cjs exporting an object with 'default' ([#3312](https://github.com/ExodusMovement/assets/issues/3312)) ([d6fee86](https://github.com/ExodusMovement/assets/commit/d6fee8693517859fc445c062c0cf97c618da0fad))
* solana socket id collisions ([#3422](https://github.com/ExodusMovement/assets/issues/3422)) ([d6df7d5](https://github.com/ExodusMovement/assets/commit/d6df7d5ca08dd707dc52d8726802d5fc9bbd17a2))
* **solana-api:** websocket fixes and performance ([#3419](https://github.com/ExodusMovement/assets/issues/3419)) ([664dacd](https://github.com/ExodusMovement/assets/commit/664dacdcefe68e84ae10b9beeffea8b1af6074a0))



## [3.10.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.10.0...@exodus/solana-api@3.10.1) (2024-08-26)


### Bug Fixes

* update exodus/timer ([#3134](https://github.com/ExodusMovement/assets/issues/3134)) ([e977be5](https://github.com/ExodusMovement/assets/commit/e977be5280c214c1b814409d9461ce6628bb19be))



## [3.10.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.9.4...@exodus/solana-api@3.10.0) (2024-08-08)


### Features

* move ME solana monitor to the ME codebase ([#3117](https://github.com/ExodusMovement/assets/issues/3117)) ([6e2b25c](https://github.com/ExodusMovement/assets/commit/6e2b25c15d5c43a775b0ab53792882f69aa5c30d))


### Reverts

* Revert "chore: skip ws test" (#3078) ([072f542](https://github.com/ExodusMovement/assets/commit/072f542dbe1adca57703da680508bbf21b412e3a)), closes [#3078](https://github.com/ExodusMovement/assets/issues/3078)



## [3.9.4](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.9.3...@exodus/solana-api@3.9.4) (2024-08-01)


### Bug Fixes

* revert object.defineProperty usage ([#3056](https://github.com/ExodusMovement/assets/issues/3056)) ([493a486](https://github.com/ExodusMovement/assets/commit/493a4865ed07c816167b96a5d01ba0f154b077c8))
* SOL lint ([#2953](https://github.com/ExodusMovement/assets/issues/2953)) ([3f1b3b8](https://github.com/ExodusMovement/assets/commit/3f1b3b8c9a1544ca7d41ac883c06e465d6928b32))



## [3.9.3](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.9.2...@exodus/solana-api@3.9.3) (2024-07-23)

**Note:** Version bump only for package @exodus/solana-api





## [3.9.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.9.1...@exodus/solana-api@3.9.2) (2024-07-18)


### Bug Fixes

* match correct solana dex swap amount ([#2878](https://github.com/ExodusMovement/assets/issues/2878)) ([24d8d13](https://github.com/ExodusMovement/assets/commit/24d8d138a99d80d36088b89ff1f5d8a04308a2ec))



## [3.9.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.9.0...@exodus/solana-api@3.9.1) (2024-07-15)


### Bug Fixes

* **solana:** harden objects against prototype pollution ([#2838](https://github.com/ExodusMovement/assets/issues/2838)) ([3374c58](https://github.com/ExodusMovement/assets/commit/3374c58de898aa38f96d6a4e30bc1fec3b48c691))



## [3.9.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.8.3...@exodus/solana-api@3.9.0) (2024-07-08)


### Features

* reuse SOL API results for getAccount and getTokenAccounts ([#2666](https://github.com/ExodusMovement/assets/issues/2666)) ([4e96f4c](https://github.com/ExodusMovement/assets/commit/4e96f4c66d7783b113f0cbdf73d30bb605ae0534))


### Bug Fixes

* update SOL staking info on balance change ([#2672](https://github.com/ExodusMovement/assets/issues/2672)) ([bc2043c](https://github.com/ExodusMovement/assets/commit/bc2043ce226128d3e321937a325e20382f12f874))



## [3.8.3](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.8.2...@exodus/solana-api@3.8.3) (2024-06-27)

**Note:** Version bump only for package @exodus/solana-api





## [3.8.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.8.1...@exodus/solana-api@3.8.2) (2024-06-27)

**Note:** Version bump only for package @exodus/solana-api





## [3.8.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.8.0...@exodus/solana-api@3.8.1) (2024-06-24)


### Bug Fixes

* solana transaction simulation ([#2661](https://github.com/ExodusMovement/assets/issues/2661)) ([b97ad7e](https://github.com/ExodusMovement/assets/commit/b97ad7e955526c9421f98e5618aa80e585717bcd))



## [3.8.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.7.2...@exodus/solana-api@3.8.0) (2024-06-20)


### Features

* **solana:** Add pending to stake balance ([#2632](https://github.com/ExodusMovement/assets/issues/2632)) ([6a4973a](https://github.com/ExodusMovement/assets/commit/6a4973a33c5ba482d786a3fd5656107110dcf929))



## [3.7.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.7.1...@exodus/solana-api@3.7.2) (2024-06-19)


### Bug Fixes

* me monitor empty accounts error ([#2606](https://github.com/ExodusMovement/assets/issues/2606)) ([4997039](https://github.com/ExodusMovement/assets/commit/4997039a2128dd8281da8aac919075704f4a0e1f))



## [3.7.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.7.0...@exodus/solana-api@3.7.1) (2024-06-14)


### Bug Fixes

* load staking for solana when useMeMonitor === false ([#2576](https://github.com/ExodusMovement/assets/issues/2576)) ([d456333](https://github.com/ExodusMovement/assets/commit/d456333bc31618f0bb5c7bac4b0781b667671d6c))



## [3.7.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.6.2...@exodus/solana-api@3.7.0) (2024-06-13)


### Features

* use ME API for SOL fungible assets ([#2490](https://github.com/ExodusMovement/assets/issues/2490)) ([8234222](https://github.com/ExodusMovement/assets/commit/82342222f57949da4d7128f7f92baf6a0bc1781e))



## [3.6.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.6.1...@exodus/solana-api@3.6.2) (2024-06-11)

**Note:** Version bump only for package @exodus/solana-api





## [3.6.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.6.0...@exodus/solana-api@3.6.1) (2024-06-06)


### Bug Fixes

* set solana pool address ([#2494](https://github.com/ExodusMovement/assets/issues/2494)) ([1307021](https://github.com/ExodusMovement/assets/commit/13070218d33476ea1c9603dc01cb1852dd89d701))



## [3.6.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.5.0...@exodus/solana-api@3.6.0) (2024-05-31)


### Features

* add SOL staking provider client ([#2420](https://github.com/ExodusMovement/assets/issues/2420)) ([a39413d](https://github.com/ExodusMovement/assets/commit/a39413db095f12f9f8dfb757a56052561d399616))



## [3.5.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.4.2...@exodus/solana-api@3.5.0) (2024-05-29)


### Features

* **solana:** add getFeeForMessage to Solana API ([#2203](https://github.com/ExodusMovement/assets/issues/2203)) ([26bf824](https://github.com/ExodusMovement/assets/commit/26bf82496932c7d1f183afaeb75e224f831571e2))



## [3.4.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.4.1...@exodus/solana-api@3.4.2) (2024-05-28)


### Bug Fixes

* add recommended option to getPriorityFeeEstimate rpc ([#2402](https://github.com/ExodusMovement/assets/issues/2402)) ([d010996](https://github.com/ExodusMovement/assets/commit/d010996a05833d0517559a6697af02fba7fe6b2b))



## [3.4.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.4.0...@exodus/solana-api@3.4.1) (2024-04-22)

**Note:** Version bump only for package @exodus/solana-api





## [3.4.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.3.2...@exodus/solana-api@3.4.0) (2024-04-20)


### Features

* add compute budget instruction ([#2006](https://github.com/ExodusMovement/assets/issues/2006)) ([f1479ac](https://github.com/ExodusMovement/assets/commit/f1479aca619370da573f442ef4526e6d21db14d2))



## [3.3.2](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.3.1...@exodus/solana-api@3.3.2) (2024-04-17)

### Bug Fixes

* support solana spl -> sol dex txs ([#2045](https://github.com/ExodusMovement/assets/issues/2045)) ([d48bd85](https://github.com/ExodusMovement/assets/commit/d48bd85d2b52e1daaa92a1c00ce6c9d6309ebbf7))



## [3.3.1](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.3.0...@exodus/solana-api@3.3.1) (2024-04-12)


### Bug Fixes

* add fetch polyfill with exodus user-agent ([#1983](https://github.com/ExodusMovement/assets/issues/1983)) ([4dc0e23](https://github.com/ExodusMovement/assets/commit/4dc0e23f397a9bc257ccb5589077d80c29172abe))
* **solana:** send transaction changes ([#2027](https://github.com/ExodusMovement/assets/issues/2027)) ([0047303](https://github.com/ExodusMovement/assets/commit/0047303b72e76620617a119f845bb4f26074912f))



## [3.3.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.2.0...@exodus/solana-api@3.3.0) (2024-04-04)


### Features

* implement helius priority fee ([#1799](https://github.com/ExodusMovement/assets/issues/1799)) ([e681ee7](https://github.com/ExodusMovement/assets/commit/e681ee7f52526bc8a77ab9917d57fb5c2fca2fd4))



## [3.2.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.1.0...@exodus/solana-api@3.2.0) (2024-03-29)


### Features

* solana new balances ([#1913](https://github.com/ExodusMovement/assets/issues/1913)) ([f83c5f7](https://github.com/ExodusMovement/assets/commit/f83c5f7b3e450df9fcd6790a6b40a6797e42dc2e))



## [3.1.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@3.0.0...@exodus/solana-api@3.1.0) (2024-03-27)


### Features

* add new Solana token 2022 program ([#1808](https://github.com/ExodusMovement/assets/issues/1808)) ([90747bc](https://github.com/ExodusMovement/assets/commit/90747bc97fba0e629a1eaba5878dd06f834b0d72))


### Bug Fixes

* support token-2022 program for metaplex transfer ([#1894](https://github.com/ExodusMovement/assets/issues/1894)) ([31f712a](https://github.com/ExodusMovement/assets/commit/31f712a8fda681969b1c3dbe6f4c5e3d250f3062))



## [3.0.0](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@2.5.34...@exodus/solana-api@3.0.0) (2024-03-21)


### ⚠ BREAKING CHANGES

* expose account state factory function (#1832)

### Features

* **solana-api:** pass feeData to createUnsignedTx ([#1815](https://github.com/ExodusMovement/assets/issues/1815)) ([3c6fe2a](https://github.com/ExodusMovement/assets/commit/3c6fe2a529b362025482c858cf0c0a102291b62e))


### Code Refactoring

* expose account state factory function ([#1832](https://github.com/ExodusMovement/assets/issues/1832)) ([1879d7b](https://github.com/ExodusMovement/assets/commit/1879d7ba060e5c7f08316711df5b94448e7bcea6))



## [2.5.34](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@2.5.33...@exodus/solana-api@2.5.34) (2024-03-18)


### Bug Fixes

* pass in txsLimit to solana monitor ([#1792](https://github.com/ExodusMovement/assets/issues/1792)) ([7283048](https://github.com/ExodusMovement/assets/commit/7283048c56b239a690064d14ff9b4d0228c078a9))





## [2.5.33](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@2.5.32...@exodus/solana-api@2.5.33) (2024-03-18)


### Bug Fixes

* prefer on-chain data over account state calculation ([#1781](https://github.com/ExodusMovement/assets/issues/1781)) ([aa5cbcf](https://github.com/ExodusMovement/assets/commit/aa5cbcf81c3e5d0ee29a8650d74ab928e1317724))





## [2.5.32](https://github.com/ExodusMovement/assets/compare/@exodus/solana-api@2.5.30...@exodus/solana-api@2.5.32) (2024-03-16)


### Features

* limit SOL txs to latest 100 ([#1688](https://github.com/ExodusMovement/assets/issues/1688)) ([6b24ac5](https://github.com/ExodusMovement/assets/commit/6b24ac57c1e3d0f2eccb1efdaad9b9a1759d3a7c))
* solana monitor history refactor to use fewer transaction rpc calls ([#1559](https://github.com/ExodusMovement/assets/issues/1559)) ([8933aa6](https://github.com/ExodusMovement/assets/commit/8933aa61d712faf9665de87bdc1a1c5cabd2d403))
* **solana:** migrate some implementations and remove `@exodus/solana-spl-tokan` usage. ([#1669](https://github.com/ExodusMovement/assets/issues/1669)) ([ee75e1f](https://github.com/ExodusMovement/assets/commit/ee75e1fbf5c276aafc91260dee9ad6e44e5c8b8b))


### Bug Fixes

* solana set stake amount when in tx on tx-send ([#1752](https://github.com/ExodusMovement/assets/issues/1752)) ([7c09616](https://github.com/ExodusMovement/assets/commit/7c0961624df39bbb57a5c3bce395f8f31f3be141))
