const ordinalsQaSendBtc = {
  accountIndex: 0,
  rawTx:
    '02000000000104261afede7c4891e9f592b7e913cb7eb9e2eaa7bbaac9938f385f1a9e5d205e610100000000fdffffffce3ebd0d79415c584a4a5fa5e6a8fe47e6e275c6641bafb28bb40a5aea6122bd0000000000fdffffff72a1376d7913c4104c5918196cd4e7c483ef27bbcf8a1e01591ca3e0575372890000000000fdffffffce3ebd0d79415c584a4a5fa5e6a8fe47e6e275c6641bafb28bb40a5aea6122bd0600000000fdffffff033075000000000000160014c2b24fe7ea84a525c87e383b4657698d9d922531a086010000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f5371d5601000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae0247304402200deb1c3dc4746cc67d7dbed51d3ab49bb1db1128de49f406855ffab0706e961402201fb630c9a758a911a3efa0675be523f321e28b760e93f87cfbe7fe38361d1698012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c02483045022100c2639030bd6debe470d39454cfd14daaa3915268f3aed73f1f00380d6075e216022022ca07cea8c609417b34f9a62a4e5292b05934057be1eb346a4706ab77cf0a49012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c02483045022100aa99a016b9023980b38255a2680ca08d3f5d6def6f9b8b4870a1bcf0c1dfc54702205d1dbea2589c1de6e3210c55cf6147493191e9aa3de7647499650ab4284d2682012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c0247304402201e0e64aadd2f3ecd978fd8d686ac7e9ff477267c86033a14a0bf7444e4bc096c02201aece05203f0880556a313372ca7b72a553a41955b96f87a1c199516209d9896012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c00000000',
  txId: '9a62288a123f3e33c1b2023c8b79a0b28a84c052e0a60ce8cb267117e0889ccf',
  txLog: {
    coinAmount: '-0.0013 BTC',
    coinName: 'bitcoin',
    confirmations: 0,
    currencies: {
      bitcoin: {
        BTC: 8,
        bits: 2,
        satoshis: 0,
      },
    },
    data: {
      blockHeight: 768_520,
      blocksSeen: 0,
      changeAddress: {
        address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
        meta: {
          path: 'm/0/0',
          purpose: 84,
        },
      },
      feePerKB: 68_351,
      inputs: {
        bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48: {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          path: 'm/0/0',
          utxos: [
            {
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: 'bd2261ea5a0ab48bb2af1b64c675e2e647fea8e6a55f4a4a585c41790dbd3ece',
              value: '0.000012 BTC',
              vout: 0,
            },
            {
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: '89725357e0a31c59011e8acfbb27ef83c4e7d46c1918594c10c413796d37a172',
              value: '0.00006 BTC',
              vout: 0,
            },
            {
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: 'bd2261ea5a0ab48bb2af1b64c675e2e647fea8e6a55f4a4a585c41790dbd3ece',
              value: '0.00106833 BTC',
              vout: 6,
            },
            {
              confirmations: 1,
              inscriptions: [],
              inscriptionsIndexed: true,
              rbfEnabled: true,
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: '615e205d9e1a5f388f93c9aabba7eae2b97ecb13e9b792f5e991487cdefe1a26',
              value: '0.0013 BTC',
              vout: 1,
            },
          ],
        },
      },
      inscriptionsIndexed: true,
      rbfEnabled: true,
      replacedTxId: '5df6ec68d730d09847c26b670061ebcfef4804dbe8254d7b99916abcad1133d7',
      sent: [
        {
          address: 'bc1qc2eylel2sjjjtjr78qa5v4mf3kweyff3v92k87',
          amount: '0.0003 BTC',
        },
        {
          address: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          amount: '0.001 BTC',
        },
      ],
    },
    date: 'SOME DATE',
    feeAmount: '0.00026452 BTC',
    feeCoinName: 'bitcoin',
    txId: '9a62288a123f3e33c1b2023c8b79a0b28a84c052e0a60ce8cb267117e0889ccf',
    version: 1,
  },
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: '615e205d9e1a5f388f93c9aabba7eae2b97ecb13e9b792f5e991487cdefe1a26',
          value: 130_000,
          vout: 1,
        },
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: 'bd2261ea5a0ab48bb2af1b64c675e2e647fea8e6a55f4a4a585c41790dbd3ece',
          value: 1200,
          vout: 0,
        },
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: '89725357e0a31c59011e8acfbb27ef83c4e7d46c1918594c10c413796d37a172',
          value: 6000,
          vout: 0,
        },
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: 'bd2261ea5a0ab48bb2af1b64c675e2e647fea8e6a55f4a4a585c41790dbd3ece',
          value: 106_833,
          vout: 6,
        },
      ],
      outputs: [
        ['bc1qc2eylel2sjjjtjr78qa5v4mf3kweyff3v92k87', 30_000],
        ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 100_000],
        ['bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48', 87_581],
      ],
    },
    txMeta: {
      accountIndex: 0,
      addressPathsMap: {
        bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48: 'm/0/0',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData: '01', // dummy value because this  whole  test is bogus; tx id does not have any inputs for bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48
          txId: '615e205d9e1a5f388f93c9aabba7eae2b97ecb13e9b792f5e991487cdefe1a26',
        },
        {
          rawData: '01', // dummy value because this  whole  test is bogus; tx id does not have any inputs for bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48
          txId: 'bd2261ea5a0ab48bb2af1b64c675e2e647fea8e6a55f4a4a585c41790dbd3ece',
        },
        {
          rawData: '01', // dummy value because this  whole  test is bogus; tx id does not have any inputs for bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48
          txId: '89725357e0a31c59011e8acfbb27ef83c4e7d46c1918594c10c413796d37a172',
        },
      ],
    },
  },
  virtualSize: 387,
}

export default ordinalsQaSendBtc
