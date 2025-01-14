import { runEvmIndexTestSuite } from '@exodus/ethereum-api/src/__tests__/index.testsuite.js'

import assetPlugin from '../index.js'

describe(`matic index.js test`, () => {
  runEvmIndexTestSuite({ assetPlugin })
})
