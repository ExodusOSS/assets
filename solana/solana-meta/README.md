# @exodus/solana-meta &middot; [![npm version](https://img.shields.io/badge/npm-public-blue.svg?style=flat)](https://www.npmjs.com/package/@exodus/solana-meta)

The **solana-meta** package provides a collection of metadata for Solana blockchain assets, including the native SOL asset
and a set of built-in tokens. This metadata includes visual elements (such as logos, primary colors, and gradient schemes),
display names, tickers, blockchain explorer URLs, and descriptive information.

---

## Installation

Install the package via `yarn`:

```bash
yarn add @exodus/solana-meta
```

## Usage

Below is an example of how to import and use the metadata:

```javascript
import assetList from '@exodus/solana-meta'

// Example: Get metadata for a specific asset (Solana or some SPL built-in token)
const solanaAsset = assetList.find((asset) => asset.name === 'solana')

console.log(solanaAsset)

// Output:
// {
//   name: 'Solana',
//   ticker: 'SOL',
//   displayTicker: 'SOL',
//   blockExplorer: 'https://explorer.solana.com',
//   description: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today.'
//   units: { ... }
//   ...
// }
```

You can use this metadata to display asset information in your application, such as logos, colors, and explorer URLs.

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software under the terms of the MIT License.
For more details, see the [LICENSE](LICENSE) file.
