const segwitAllUnsignedTx = {
  accountIndex: 0,
  rawTx:
    '020000000001022ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710100000000fdffffff3a093fcd7edd55e7c6cc76f86a38116acef985f8926d66de62d31714d8ba6abd0000000000fdffffff01387b010000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537024830450221009dfc1edd0af29170139cb14665cc6ac755ac53c3981b431cf719863248e23c6c022037ef3c3b5cae5caff013da8b30e05f81bd16ba7801f1f90369399baed55cfc36012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c0247304402201a6a6ea75961126aa276d4873a58b317b26ca2447c8dcff4175e20302e9405e202201620f388e02b1970c64edffe6f83c7a872b72d0087706370c1094427fd7c6114012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c00000000',
  txId: '257efd0b04349ea6d2de69d81799f6ad46c531e541466d15c21a6d43f3471b31',
  txLog: {
    coinAmount: '-0.0009708 BTC',
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
      feePerKB: 68_000,
      inputs: {
        bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48: {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          path: 'm/0/0',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
              value: '0.0001 BTC',
              vout: 1,
            },
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
              txId: 'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a',
              value: '0.001 BTC',
              vout: 0,
            },
          ],
        },
      },
      rbfEnabled: true,
      sent: [
        {
          address: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          amount: '0.0009708 BTC',
        },
      ],
    },
    date: 'SOME DATE',
    feeAmount: '0.0001292 BTC',
    feeCoinName: 'bitcoin',
    txId: '257efd0b04349ea6d2de69d81799f6ad46c531e541466d15c21a6d43f3471b31',
    version: 1,
  },
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
          value: 10_000,
          vout: 1,
        },
        {
          address: 'bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48',
          script: '001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae',
          sequence: 4_294_967_293,
          txId: 'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a',
          value: 100_000,
          vout: 0,
        },
      ],
      outputs: [['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 97_080]],
    },
    txMeta: {
      accountIndex: 0,
      addressPathsMap: {
        bc1qz0p68ljq4xslgl09g8rdfzjse7dshm4w6jsh48: 'm/0/0',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData:
            '02000000000102e0103c63be36a3fc2748f0a7217d342f4edc0fd80db97257b188830e5017b5150100000000fdffffff015df8ec326ac95d11c60aafbe4521bc5e431ec22f55794222b659ebc0765e970100000000fdffffff021f1b00000000000016001491223b6a34a067a8ba0a8d3127090cd64a1b97b9102700000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae024830450221008de47751a4b64ef93e583864b3e80d3506708bcb09eb7958e7f6759d9c24de9b02205d93a4dc030916c8dd90711adecdca78c0a10acf0df7eb7cf1bcbaaf21d6faba012102547811edc85c96c02c36cc561a3cf57bb71f0d526b1ec2c9803b0a9486f0462402473044022044ec05426e3bbe84320205b9b2494446099a9e77fdb9babb23ff1bc17686879802203719465d576442b06ac373d2369085fabe09548eabf39ce177b135b8ac73222f0121022a8bb930fa5b65c64be7073e62adc946f3da73cabc2bb81bc2e043222db020dc00000000',
          txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
        },
        {
          rawData:
            '020000000001025e3e0500823aed8e46e12a024d589ed98a87488324cc37233cbe58579a1df0310100000000fdffffff5e3e0500823aed8e46e12a024d589ed98a87488324cc37233cbe58579a1df0310000000000fdffffff01a08601000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae0247304402202e66473798aa5f90e6b20fc18a59ddf5a33cb8c36fc18a9f3d9dc42370af73000220090baf15bc5d79a1cf4e4f4792a812ca94ce4839b141b42173409851e5947053012103a0d2051b0c514b93680acd8decbe35eafb1fb4dc40c5e9cd155539325f2b0f91024830450221009397dc610156192699b5c2deac2028ade49d9e258a0076c24f87df5d8538dde7022073c149c917ae11c5b23988674a849218c983e27722b4ca5651fcd318830f9c21012102195f9d7ca697cdf7f5ba36aecfbdea634b624fa358ef937f362b157c38bee3e300000000',
          txId: 'bd6abad81417d362de666d92f885f9ce6a11386af876ccc6e755dd7ecd3f093a',
        },
      ],
    },
  },
  virtualSize: 190,
}

export default segwitAllUnsignedTx
