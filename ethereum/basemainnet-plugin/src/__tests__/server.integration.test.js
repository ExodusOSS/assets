import { runEvmServerTestSuite } from '@exodus/ethereum-api/src/__tests__/server.testsuite.js'

import assetPlugin from '../index.js'

describe(`basemainnet server integration tests`, () => {
  const walletAddress = '0x1e7dCC21013C060B091040f6C3eb70a6221DB3b7'
  const contractAddress = '0x50c5725949a6f0c72e6c4a641f24049a917db0cb'

  runEvmServerTestSuite({ assetPlugin, walletAddress, contractAddress })
})
