import { getPrivateSeed, getTestingSeed, walletTester } from '@exodus/assets-testing'

import assetPlugin from '../index.js'

describe(`bitcoin testing seed wallet test`, () => {
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    testPurposes: [44, 49, 84, 86],
    compatibilityMode: 'ledger', // allows 49
    expectedAddresses: {
      bitcoin_44_exodus_0_0_0: '1Ce5zNA1ZhTxCgXd9XQdb87Bf78VR8zL8j',
      bitcoin_44_exodus_1_0_0: '1Kb7JNhQ7ULHBx1TFJuEAmQFb1FFAYYxhs',
      bitcoin_44_exodus_2_0_0: '1NJaYYJ4HDAFYuswMeFCwFrJ3i4HKfgzDC',
      bitcoin_49_exodus_0_0_0: '38J1QSqDKYdVBCpeL55NfrL67puokCojDn',
      bitcoin_49_exodus_1_0_0: '3LEatWBiKwRw7umdgLiGL4afxHuv93tRpC',
      bitcoin_49_exodus_2_0_0: '34mjb8ooyr9AqAyhMmuopP2kFG97kPg3x8',
      bitcoin_84_exodus_0_0_0: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
      bitcoin_84_exodus_1_0_0: 'bc1q78ne29cynskvmx3r647m9dyhngsw5gjpencs0d',
      bitcoin_84_exodus_2_0_0: 'bc1qcg9vcs203yv6t3z4tnkftsyx6hy6wj6fkmrd4r',
      bitcoin_86_exodus_0_0_0: 'bc1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fq3y4x0q',
      bitcoin_86_exodus_1_0_0: 'bc1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gq7ygsk4',
      bitcoin_86_exodus_2_0_0: 'bc1pffcpm60f00ttg7mqz3zg9ale4fdqajqyr87jeswqs8uxnrc4yvgsxkwazk',
    },
  })
})

describe(`bitcoin private seed wallet test`, () => {
  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    testPurposes: [44, 49, 84, 86],
    compatibilityMode: 'ledger', // allows 49
    testChainIndexes: [0, 1, 2],
    expectedAddresses: {
      bitcoin_44_exodus_0_0_0: '1Azpg7QEdQ8FHhNLzEpbpo1Uowh3t7B3Ex',
      bitcoin_44_exodus_0_1_0: '1HZ3g5qRpAMApVzeFhfyktH5mb8EVoGYdk',
      bitcoin_44_exodus_0_2_0: '1PRCUCV6AWsdE4d6TxtWYjAtmV2zAmKcNi',
      bitcoin_44_exodus_1_0_0: '1AELPVvN9aDdWsR7hCkpVgA2WAuDjuPDB3',
      bitcoin_44_exodus_1_1_0: '18d1c4KrXaxzCVkP1H3Ffbx58ADfDGX3d7',
      bitcoin_44_exodus_1_2_0: '1EgtiYgoyJ2ZcG472rXunfTUCCVAVqEg1E',
      bitcoin_44_exodus_2_0_0: '14Gmj5bDcdwq9kCeYboSfNBECfrZ59podu',
      bitcoin_44_exodus_2_1_0: '1PDWewrgceDenSAWQz5yGD9Luvvi1EPrrK',
      bitcoin_44_exodus_2_2_0: '1JDN9V98LD6PDDTbyxEi3AvuwZNUAWmeXD',
      bitcoin_49_exodus_0_0_0: '37PJ9gNHQy4t3DmHKHFwBQX7FPRKhK3U6Z',
      bitcoin_49_exodus_0_1_0: '3KpBXveJwCxvszYcsPk3MbgPR1z6f2T19z',
      bitcoin_49_exodus_0_2_0: '33dGUZzdarxjrBSfRSi7LGUKnEkrcUSUzC',
      bitcoin_49_exodus_1_0_0: '3EkvexGVww1FoG8gWemkxK6GPnmTxvW3Bg',
      bitcoin_49_exodus_1_1_0: '39prT6mCyZ5xTDTPCbX3Wzo1DiiFpRpPDm',
      bitcoin_49_exodus_1_2_0: '3DDLJQ9FwbWS8UMFhAGHP9siWEMS8zUMFJ',
      bitcoin_49_exodus_2_0_0: '3JEep74C7tjW1NwWrMdYpQujo1ycYsB5Rn',
      bitcoin_49_exodus_2_1_0: '34V44fdiU1oqhHhfSBvCmF6WaJcHcPVMyp',
      bitcoin_49_exodus_2_2_0: '39SSpE1YrmhcxKpcwJnAT6LPnw945CnR5L',
      bitcoin_84_exodus_0_0_0: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
      bitcoin_84_exodus_0_1_0: 'bc1q086jhvqmana3mzf8qvm0xzerxhngyklpcurfh6',
      bitcoin_84_exodus_0_2_0: 'bc1qdys7vkcu7cry55vk0n9x8dy8uhjrvxrvjzp6qf',
      bitcoin_84_exodus_1_0_0: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
      bitcoin_84_exodus_1_1_0: 'bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6',
      bitcoin_84_exodus_1_2_0: 'bc1qy6a50nuralc0vq97zacuhc4s037kprpxvz7xq9',
      bitcoin_84_exodus_2_0_0: 'bc1q80wm35xel29d2xd79e4uveudejwmh3jnecvnl4',
      bitcoin_84_exodus_2_1_0: 'bc1qcsxfqgs8khsj48lghz3vvpaf2ed92lk53uc364',
      bitcoin_84_exodus_2_2_0: 'bc1qlgpz5hysa420avkn9gq7gcew06ent5km9wj3wn',
      bitcoin_86_exodus_0_0_0: 'bc1pegpjkdt4mhexjw2k59jewegv2v6lxekapwjf6sk7euel03vnhfkq8dqhrt',
      bitcoin_86_exodus_0_1_0: 'bc1pgsujrfjjeqe53mt0y0fs5rq9v08dt0rg6ptzpvk539365adtwudq3tslxy',
      bitcoin_86_exodus_0_2_0: 'bc1plt3f50xhr8d5sxwz7z8ux4rp4nrsqwqysu7amlt0u0ygnlplrhqq4r0chr',
      bitcoin_86_exodus_1_0_0: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
      bitcoin_86_exodus_1_1_0: 'bc1pj083pf34whgnmwk59gxq08yfxkykqek7p2leh2xte59tfq032s7qruagux',
      bitcoin_86_exodus_1_2_0: 'bc1pe59l2tsfe6t5x6wrcgtsaxy3nrpnky8chq4cvf7zndat99f8t4xsetgm4w',
      bitcoin_86_exodus_2_0_0: 'bc1p22zuaxepunt587sfjjahmlr844qa99p4xsjgtfxzlhk2x2xjcu7sh9ljqu',
      bitcoin_86_exodus_2_1_0: 'bc1py4ax9fxjzp04lst2t6f8ul97zfgha6q6htuz8tjluwayjzzu9gaqs4kqfh',
      bitcoin_86_exodus_2_2_0: 'bc1pds3v9d2j8vd8pn5nsemgqf0r4z59exya2epdd2j8j4zggem7suqskejwa6',
    },
    expectedXpubs: {
      0: {
        bip44:
          'xpub6DViwn6qb7CJ959M3fwuNQC7sx2QY8XjmN5hvCDMLojHKFTc3srC5Ks22mJfTFcxmk1oEAFJRHGgxaLUANVZqPhVFP2xHNNjhJ5is26t5RE',
        bip49:
          'xpub6CJzy7NovEHTC32SPMFLXXbm4wMyRydMYqCySpi5ChbH295KhtM91CrjxKr6yNfWLfon8nGtGAF1sLcGR3LabxMyHKxf2daFckehGkrGR6B',
        bip84:
          'xpub6D9FsHkCpbBrs3XisKwnFDKwthPXJxdXHA4gEEpqrP87bnnaGq5kz3jJKWZ14MWMSucBMzXYHSUoHrQ631RaLBaKdw91tZuFH8xzMCyqs5K',
        bip86:
          'xpub6D8URMGDbYEURP1PnFcAkBfufUVNkvwNdnkxtmBShXtP1QRK7e6jsZoUGDmJ9YwZ3BvrGaa6JSiXP32mT2758AMMtvwcUdfLP29768J9Le8',
      },
      1: {
        bip44:
          'xpub6DViwn6qb7CJC34s9LFsSU8aEGVDnZKEzauuXWKdLryHeenKwBr46xhP2v1jyA2UXtSLnVe4wkkkLFeCH47Ab1tfCpNWDzPpZkh1uQ1sYVo',
        bip49:
          'xpub6CJzy7NovEHTFa3Qe2jKWzrTT4pyKnTVP3rU1LyjsnPHFmSRzn5md15PzbDBn1WNgk6RMa3XtLGLpbciGYsqTTFxv17LRpbf8Kbg9AwAwTa',
        bip84:
          'xpub6D9FsHkCpbBrvwKG1Au9p9PTdMB4agwMnePC2MHZrC2qrwiYYsm6Xmz6EcT5ETYvaypRSuGfUziy1dtLGuxgDsD9w6wPAU7Teg6K9DK265R',
        bip86:
          'xpub6D8URMGDbYEUSymZfvRsPM5Q1n3XRvwa7PAw8p4af97k19bLzfCi2AEVQviPgYv4P98o6ZRYvYfxJ9tVzQLFd2bURcciFfJChvh4XdinhWc',
      },
      2: {
        bip44:
          'xpub6DViwn6qb7CJEw8xakXX1hDjhZxFKmUBa8sDrHqEshAyE8EHAXJmK7dDaQxDrub2xRJsugUXqtNSQAbCrr3G1Vcw9N3rmWL6KSB4s8qi8qv',
        bip49:
          'xpub6CJzy7NovEHTHQptM3sHE7Kne7HeVTZVvaJztQjxKUGiyzFMYtKPEQVCSYJNWUcUqAQ1xXhSgn4CZDNGLSY6bGzmvbX5xYRitviWntnh1ks',
        bip84:
          'xpub6D9FsHkCpbBrxAgcp2tWE4YURismquwPCDMn3EZ6APMTr3kCCnCXK2SEeEsHJK6VfaHFWD82s3u4kNwT8CSezHhS75VCvLFBcXgUMyVEtJx',
        bip86:
          'xpub6D8URMGDbYEUWrPnk5iUpXwZs26oTg9ro5dtaryu4FQAQ8aMq84j85MhZNtbWvBSvF1SCMpmXW72jwRW9SZJ5Udj4jT2xamawzYFQhFhufD',
      },
    },
  })
})
