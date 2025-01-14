import serverApi from '@exodus/solana-api'
import assetList from '@exodus/solana-meta'

import { createSolanaAssetFactory } from './create-asset.js'

export * from './create-asset.js' // for solanatestnet and solanadevnet

const createAsset = createSolanaAssetFactory({ assetList, serverApi })

const defaultExport = { createAsset }

export default defaultExport
