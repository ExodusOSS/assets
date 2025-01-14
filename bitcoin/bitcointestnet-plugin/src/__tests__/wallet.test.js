import { getPrivateSeed, getTestingSeed, walletTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe(`bitcointestnet testing wallet test`, () => {
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    expectedAddresses: {
      bitcointestnet_44_exodus_0_0_0: 'msA3HREzNiuCyo1Es6P1R3KWX6jCKe8KY4',
      bitcointestnet_44_exodus_1_0_0: 'mz74bRnNvVmXy4V4xssbzgcaSzqx5FAd9t',
      bitcointestnet_44_exodus_2_0_0: 'n2pXqbP36EbWL2MZ5DDamB4cuhezHuHCk9',
      bitcointestnet_84_exodus_0_0_0: 'tb1qlrh635rpvps06d9klakf7k3lq4tlnd25nj2jz3',
      bitcointestnet_84_exodus_1_0_0: 'tb1q78ne29cynskvmx3r647m9dyhngsw5gjpn4rr57',
      bitcointestnet_84_exodus_2_0_0: 'tb1qcg9vcs203yv6t3z4tnkftsyx6hy6wj6fuac7ws',
      bitcointestnet_86_exodus_0_0_0:
        'tb1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fqxvrf40',
      bitcointestnet_86_exodus_1_0_0:
        'tb1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gqfv7lv6',
      bitcointestnet_86_exodus_2_0_0:
        'tb1pffcpm60f00ttg7mqz3zg9ale4fdqajqyr87jeswqs8uxnrc4yvgs37cjce',
    },
  })
})

describe(`bitcointestnet private wallet test`, () => {
  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    expectedAddresses: {
      bitcointestnet_44_exodus_0_0_0: 'mqWmyAVDSRZW4oqxhonyeiDofwHkmXrcZt',
      bitcointestnet_44_exodus_1_0_0: 'mpkHgZ1LxbetHytjQmjCKbNMNAVviZQ4UA',
      bitcointestnet_44_exodus_2_0_0: 'minj28gCRfP5vrgGGAmpVHPZ4fTFvqKg6j',
      bitcointestnet_84_exodus_0_0_0: 'tb1qz0p68ljq4xslgl09g8rdfzjse7dshm4ws5tyw5',
      bitcointestnet_84_exodus_1_0_0: 'tb1qgxz38crda20mlre427ygezgu67kqvqfrl3zwlq',
      bitcointestnet_84_exodus_2_0_0: 'tb1q80wm35xel29d2xd79e4uveudejwmh3jnn7hqyx',
      bitcointestnet_86_exodus_0_0_0:
        'tb1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkqs9kcey',
      bitcointestnet_86_exodus_1_0_0:
        'tb1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575ms6pcnrp',
      bitcointestnet_86_exodus_2_0_0:
        'tb1p22zuaxepunt587sfjjahmlr844qa99p4xsjgtfxzlhk2x2xjcu7sqdfa6n',
    },
  })
})
