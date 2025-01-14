const taproot15000satsUnsignedTxCustomFee = {
  accountIndex: 1,
  rawTx:
    '020000000001052ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000fdffffff9ce7fe6dedcc35ea7ef6cba7cba57ee1a73dd78dd1baecc53fbe5e00e02add7d0000000000fdffffffcb5627fe840c0ce34b3abce95fc614152f99fafb584fc8b204b93e5b79e6b37b0000000000fdffffffce109bb75b3563a5d66136320121f714d0e392b773701089908bbda7ec384ada0000000000fdffffff35526b8b7c32db67b187fb8a0c1463e12f2f53c4c36894896fb2629dbd9287a40000000000fdffffff02983a000000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f5374725000000000000160014418513e06dea9fbf8f3557888c891cd7ac0601230248304502210095335fb6f3f97e6327511a3aceb2e9e5c5ec46d3cc42c206f94ec5a5eefddad60220121859b5e38113a2d6e2d6eb8fd603966d15af49ec3cdabae4a5768a95470707012103822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a93809310140358ec47e94bedfd514b65b94363079fd6e0ecd23920c802c2dff22357d8ff44bb5642f89403df0a13b20550fc6b4d94fd8d4d60b3cad4d5131807ff8267af69b0140995a09642064592ee9f1c612a16d073d0b6958ffe15e03f4b9bb0ad625fd5e341454824f9ae178d6173af5606c37aa2b98f2ecf18557bae5856f6befb2d2eab40248304502210084c06418e595c4ee4123a63e61a018ad8efe3ffeaeca512412e0850eef6364530220669c2ea2de925cdee6645cefe972668a4f271afc1c217b2daeb3c4f7f2ff7039012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718702483045022100b6ccb7377f2e774f2799be0f23c93dddff802ff956d13c6f145e45c8b407c82d02200e465c758ebb04a4cc55784c46d8f8a90b15a130134eb526f0144152dca91722012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718700000000',
  txId: 'df338d82274bfa8034791a99a5963a8e92347b106b8fb501116702094a51819b',
  txLog: {
    coinAmount: '0 BTC',
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
        address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
        meta: {
          path: 'm/0/0',
          purpose: 84,
        },
      },
      feePerKB: 80_198,
      inputs: {
        bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew: {
          address: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          path: 'm/0/0',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
              txId: '7ddd2ae0005ebe3fc5ecbad18dd73da7e17ea5cba7cbf67eea35cced6dfee79c',
              value: '0.0001 BTC',
              vout: 0,
            },
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
              txId: '7bb3e6795b3eb904b2c84f58fbfa992f1514c65fe9bc3a4be30c0c84fe2756cb',
              value: '0.0002 BTC',
              vout: 0,
            },
          ],
        },
        bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn: {
          address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
          path: 'm/0/0',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
              txId: 'da4a38eca7bd8b9089107073b792e3d014f72101323661d6a563355bb79b10ce',
              value: '0.0001 BTC',
              vout: 0,
            },
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
              txId: 'a48792bd9d62b26f899468c3c4532f2fe163140c8afb87b167db327c8b6b5235',
              value: '0.0001 BTC',
              vout: 0,
            },
          ],
        },
        bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl: {
          address: 'bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl',
          path: 'm/1/2',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '001491223b6a34a067a8ba0a8d3127090cd64a1b97b9',
              txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
              value: '0.00006943 BTC',
              vout: 0,
            },
          ],
        },
      },
      rbfEnabled: true,
      sent: [],
    },
    date: 'SOME DATE',
    feeAmount: '0.000324 BTC',
    feeCoinName: 'bitcoin',
    selfSend: true,
    txId: 'df338d82274bfa8034791a99a5963a8e92347b106b8fb501116702094a51819b',
    version: 1,
  },
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: 'bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl',
          script: '001491223b6a34a067a8ba0a8d3127090cd64a1b97b9',
          sequence: 4_294_967_293,
          txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
          value: 6943,
          vout: 0,
        },
        {
          address: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          script: '5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
          sequence: 4_294_967_293,
          txId: '7ddd2ae0005ebe3fc5ecbad18dd73da7e17ea5cba7cbf67eea35cced6dfee79c',
          value: 10_000,
          vout: 0,
        },
        {
          address: 'bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew',
          script: '5120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537',
          sequence: 4_294_967_293,
          txId: '7bb3e6795b3eb904b2c84f58fbfa992f1514c65fe9bc3a4be30c0c84fe2756cb',
          value: 20_000,
          vout: 0,
        },
        {
          address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
          script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
          sequence: 4_294_967_293,
          txId: 'da4a38eca7bd8b9089107073b792e3d014f72101323661d6a563355bb79b10ce',
          value: 10_000,
          vout: 0,
        },
        {
          address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
          script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
          sequence: 4_294_967_293,
          txId: 'a48792bd9d62b26f899468c3c4532f2fe163140c8afb87b167db327c8b6b5235',
          value: 10_000,
          vout: 0,
        },
      ],
      outputs: [
        ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 15_000],
        ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', 9543],
      ],
    },
    txMeta: {
      accountIndex: 1,
      addressPathsMap: {
        bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew: 'm/0/0',
        bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn: 'm/0/0',
        bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl: 'm/1/2',
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
            '02000000000102db09c0e45b4d387f25c2327f558651a40f3d0d5379837503f8d29943e43bd60e0000000000fdffffff9a7b2104f771195d3d096e4337df88e6279e9d04eefe1797dc6c6f27ec1ae23c0000000000fdffffff011027000000000000160014418513e06dea9fbf8f3557888c891cd7ac06012302483045022100ba28add9018e7a8b82157137dc71fec617e6c061045f2df33790c45c351abde10220226411efb636b8797080155c066e6c44bf53498a6292f1f29173d8e296ad4d4d012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c0247304402202ae0f12912a4957ef23db07f9601a3dc4f00fd71882ba49f298d60880230465502201688b07b0aebe05990997cce0f083b6dc4c6e31059f631f3e56d3a5ddc318528012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c00000000',
          txId: 'da4a38eca7bd8b9089107073b792e3d014f72101323661d6a563355bb79b10ce',
        },
        {
          rawData:
            '02000000000101cfb2a0cf1cc704d0164f0b835bf2918640790f949a510433c07da99cf14a25d50000000000fdffffff011027000000000000160014418513e06dea9fbf8f3557888c891cd7ac060123024730440220330c703698cf6057783b6c872b53dbb202a75b2b4b993a6fe710426e5a6de08c022002321a2042ef96fbbdc59ce75813d5aeaf1d64b8295699cfba9a1c6a16040a9a012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c00000000',
          txId: 'a48792bd9d62b26f899468c3c4532f2fe163140c8afb87b167db327c8b6b5235',
        },
      ],
    },
  },
  virtualSize: 404,
}

export default taproot15000satsUnsignedTxCustomFee
