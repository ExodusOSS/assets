import { getTestingSeed, walletTester } from '@exodus/assets-testing'

import solana from '../index.js'

const asset = solana.createAsset({ assetClientInterface: {} })

describe(`${asset.name} wallet test`, () => {
  walletTester({
    asset,
    seed: getTestingSeed(),
    testPurposes: [44],
    expectedAddresses: {
      solana_44_exodus_0_0_0: 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF',
      solana_44_exodus_1_0_0: '7SmaJ41gFZ1LPsZJfb57npzdCFuqBRmgj3CScjbmkQwA',
      solana_44_exodus_2_0_0: '54h9XV2d9RcSmSgmfU342c8bzhnakSwqdSZzTR9XoLVs',
    },
  })
})
