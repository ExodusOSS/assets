import { getTestingSeed, walletTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe(`bitcoinregtest wallet test`, () => {
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    expectedAddresses: {
      bitcoinregtest_44_exodus_0_0_0: 'msA3HREzNiuCyo1Es6P1R3KWX6jCKe8KY4',
      bitcoinregtest_44_exodus_1_0_0: 'mz74bRnNvVmXy4V4xssbzgcaSzqx5FAd9t',
      bitcoinregtest_44_exodus_2_0_0: 'n2pXqbP36EbWL2MZ5DDamB4cuhezHuHCk9',
      bitcoinregtest_84_exodus_0_0_0: 'bcrt1qlrh635rpvps06d9klakf7k3lq4tlnd253mnl4c',
      bitcoinregtest_84_exodus_1_0_0: 'bcrt1q78ne29cynskvmx3r647m9dyhngsw5gjp3u6wrh',
      bitcoinregtest_84_exodus_2_0_0: 'bcrt1qcg9vcs203yv6t3z4tnkftsyx6hy6wj6f75pnee',
      bitcoinregtest_86_exodus_0_0_0:
        'bcrt1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fqt4f0q4',
      bitcoinregtest_86_exodus_1_0_0:
        'bcrt1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gqy45eeq',
      bitcoinregtest_86_exodus_2_0_0:
        'bcrt1pffcpm60f00ttg7mqz3zg9ale4fdqajqyr87jeswqs8uxnrc4yvgsu8j5dr',
    },
  })
})
