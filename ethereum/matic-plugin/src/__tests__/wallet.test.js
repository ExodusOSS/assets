import { getPrivateSeed, getTestingSeed, walletTester } from '@exodus/assets-testing'

import baseAssetPlugin from '../index.js'

const config = { allowMetaMaskCompat: true }

const assetPlugin = { ...baseAssetPlugin, config }
describe(`matic wallet test using testing seed`, () => {
  walletTester({
    assetPlugin,
    assetName: 'matic',
    seed: getTestingSeed(),
    expectedAddresses: {
      matic_44_exodus_0_0_0: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
      matic_44_exodus_1_0_0: '0x55e60F7531a5c701F526f224FCC071EFCf3fFF61',
      matic_44_exodus_2_0_0: '0x72ad0eB30188481269C98CF3316b73Ac6Bc9b176',
    },
  })
})

describe(`ethereum wallet test using private seed`, () => {
  walletTester({
    assetPlugin,
    assetName: 'matic',
    seed: getPrivateSeed(),
    expectedAddresses: {
      matic_44_exodus_0_0_0: '0x90E481d9A664ebbE4Be180d9501962255463036d',
      matic_44_exodus_1_0_0: '0xf6c138C36341138dDFC314a11038dA8264B7Ef09',
      matic_44_exodus_2_0_0: '0xb04FFa8a0E97A326EA9BBc9369622F757F2c5AD1',
    },
  })
})
