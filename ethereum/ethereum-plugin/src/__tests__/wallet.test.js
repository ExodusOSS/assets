import { getPrivateSeed, getTestingSeed, walletTester } from '@exodus/assets-testing'

import baseAssetPlugin from '../index.js'

const config = { allowMetaMaskCompat: true }

const assetPlugin = { ...baseAssetPlugin, config }
describe(`ethereum wallet test using testing seed`, () => {
  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    seed: getTestingSeed(),
    expectedAddresses: {
      ethereum_44_exodus_0_0_0: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
      ethereum_44_exodus_1_0_0: '0x55e60F7531a5c701F526f224FCC071EFCf3fFF61',
      ethereum_44_exodus_2_0_0: '0x72ad0eB30188481269C98CF3316b73Ac6Bc9b176',
    },
  })
})

// Trezor is not supported https://github.com/ExodusMovement/exodus-hydra/blob/7ffeb66d51a0d34bcd13c89851ae52b8e91dce2a/features/wallet-compatibility-modes/module/config.js#L21-L49 !!!!
describe.skip(`ethereum wallet test using testing seed compatibilityMode = trezor`, () => {
  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    compatibilityMode: 'trezor',
    seed: getTestingSeed(),
    expectedAddresses: {
      ethereum_44_exodus_0_0_0: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
      ethereum_44_exodus_1_0_0: '0x780984e59eDdA8b1f4bB09dc297241f1Ed0Dcc17',
      ethereum_44_exodus_2_0_0: '0xfe84359D03e41fC6e231A9a0729D3071d9C8Dd37',
    },
  })
})

describe(`ethereum wallet test using testing seed compatibilityMode = metamask`, () => {
  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    compatibilityMode: 'metamask',
    seed: getTestingSeed(),
    expectedAddresses: {
      ethereum_44_exodus_0_0_0: '0xF3d46F0De925B28fDa1219BbD60F5ae2a0128F9F',
      ethereum_44_exodus_1_0_0: '0x780984e59eDdA8b1f4bB09dc297241f1Ed0Dcc17',
      ethereum_44_exodus_2_0_0: '0xfe84359D03e41fC6e231A9a0729D3071d9C8Dd37',
    },
  })
})

describe(`ethereum wallet test using private seed`, () => {
  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    seed: getPrivateSeed(),
    expectedAddresses: {
      ethereum_44_exodus_0_0_0: '0x90E481d9A664ebbE4Be180d9501962255463036d',
      ethereum_44_exodus_1_0_0: '0xf6c138C36341138dDFC314a11038dA8264B7Ef09',
      ethereum_44_exodus_2_0_0: '0xb04FFa8a0E97A326EA9BBc9369622F757F2c5AD1',
    },
  })
})
