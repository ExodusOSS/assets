# Exodus Assets

[![npm][npm-image]][npm-url]]
[npm-image]: https://img.shields.io/npm/v/@exodus/assets.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@exodus/assets

## Install

    yarn add @exodus/assets

## Usage

```js
import { connectAssetsList } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import combinedAssetsList from '@exodus/combined-assets-meta'

const assets = connectAssetsList([...combinedAssetsList, ...Object.values(assetsBase)])

for (const [key, val] of Object.entries(assets)) {
  console.log(`${key}: ${val.displayName}`) // bitcoin: Bitcoin
}
```

Example for single asset:

```js
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { connectAsset } from '@exodus/assets'

const assets = { bitcoin: connectAsset(bitcoin) }

for (const [key, val] of Object.entries(assets)) {
  console.log(`${key}: ${val.displayName}`) // bitcoin: Bitcoin
}
```

Example for network:

```js
import assetsList from '@exodus/ethereum-meta'
import { connectAssetsList } from '@exodus/assets'

const assets = connectAssetsList(assetsList)

for (const [key, val] of Object.entries(assets)) {
  console.log(`${key}: ${val.displayName}`) // bitcoin: Bitcoin
}
```
