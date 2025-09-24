import { asset as baseAssetMeta } from '@exodus/ethereum-meta'
import { createNoHistoryServerDescribe } from '@exodus/evm-fork-testing'

import baseAssetPlugin from '../../index.js'

export const createEthereumNoHistoryServerDescribe = ({ port }) =>
  createNoHistoryServerDescribe({
    assetName: 'ethereum',
    baseAssetMeta,
    baseAssetPlugin,
    port,
    jsonRpcUrl: 'https://mainnet.infura.io/v3/9e5f438066854148a6a32ccfd2390529',
  })
