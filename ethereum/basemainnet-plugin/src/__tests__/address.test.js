import { runEvmAddressTestSuite } from '@exodus/ethereum-api/src/__tests__/address.testsuite.js'

import assetPlugin from '../index.js'

describe(`basemainnet address vector tests`, () => {
  runEvmAddressTestSuite({ assetPlugin })
})
