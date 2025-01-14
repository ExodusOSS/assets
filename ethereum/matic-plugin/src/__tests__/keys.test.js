import { runEvmKeysTestSuite } from '@exodus/ethereum-api/src/__tests__/keys.testsuite.js'

import assetPlugin from '../index.js'

describe(`ethereum-classic address vector tests`, () => {
  runEvmKeysTestSuite({ assetPlugin })
})
