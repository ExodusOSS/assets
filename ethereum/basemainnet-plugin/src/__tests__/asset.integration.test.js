import { runEvmIntegrationTestSuite } from '@exodus/ethereum-api/src/__tests__/asset.integration.testsuite.js'

import assetPlugin from '../index.js'

describe(`basemainnet general integration tests`, () => {
  runEvmIntegrationTestSuite({ assetPlugin, eip1559Enabled: true })
})
