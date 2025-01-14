const taprootAllUnsignedTx = {
  accountIndex: 1,
  rawTx:
    '020000000001092ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000fdffffff9ce7fe6dedcc35ea7ef6cba7cba57ee1a73dd78dd1baecc53fbe5e00e02add7d0000000000fdffffffcb5627fe840c0ce34b3abce95fc614152f99fafb584fc8b204b93e5b79e6b37b0000000000fdffffffce109bb75b3563a5d66136320121f714d0e392b773701089908bbda7ec384ada0000000000fdffffff35526b8b7c32db67b187fb8a0c1463e12f2f53c4c36894896fb2629dbd9287a40000000000fdffffffacbb0346843a01dbdfbe297bade8c82b7c6383665d1427fa5f974217c2bee84b0000000000fdffffffdb67754a57a2267bd68c6b6df0c10242f8aa9c3d038e5f1e4c84ced31a189620020000006b483045022100d2bef9914b750067925d65cfb600c5e4a70b74fe47e24e46de16a2c67a934c6a02200d63718e3604693789c8921f5d81d1e7311783ed3bbdfa775961da7c239b3630012102fad2af50eac67b388a83a69c62d666675b1a9899e7f3a4f59fbb832e2cb6ea85fdffffffdb67754a57a2267bd68c6b6df0c10242f8aa9c3d038e5f1e4c84ced31a1896200000000000fdffffffbc9efeabc9fe1f31abfff62f1793bc404be5e4274178e5f05dfdcc43011d77430200000000fdffffff014f67130000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f53702483045022100c66e49268d9dd0bfc48fc02bbdf91691be20f986a7675435128236cede92ea4d022002e884326f11ae731b327587607248bd2fba885f7f1c006d6eae3be9f20d9b8c012103822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a938093101405c35674133992fea6444d2b52395f7d5f13202dc56c97ab7e69225502e8a5eec786baa4c6db2d5fe1f05bc4128e535602f1ab815b3f643d254d896564e6454b9014024b37fc114eab21ea5ca5177302e614ac4f9448719e0d4c2b481e41c79e5ac406c887b7faea9ad667cb833205ea2af7ffcaa67fb50940a4407c78c810dbe1c2802473044022015076606d9b24ac8a67d012b33ed96b44a80d8ae596322d68b770b72c6d73caf02203f14f7a0221fbc706e610f904f5b490041392e5046d37ca24148182158dcc696012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718702483045022100c478d5f9fcccb132a423453a2ce4bc5212e4c94c204854d76a3b426e32362dad02200d90316844abcee58b8d2b2a91934629e487722cbadf907fa55a6b1ff6322ee5012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d47187024830450221009b5ffe85ed15f74232bf299b188c9da39a2ea4ffa4fa47e6908b68e56f56d6f20220262ca18222e1d9bace3d638dd837179c177f3f14aa59f43c89e99fa596f8c792012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718700024830450221009f2ef12b8945529a48a426065406bff643149400933ad19d9199cf3fab3f1d6c02201ae980db22556acfa193399a5bda2526edfe257bbc9106be75ddef6d2c78f2c9012102f191ae41aabe4ccf37af9bcb2ae42273d9537e332e0f95d04e0b8f362204fae102483045022100a7a86e2f72ddc751814e847fc94640d0a8040b757fd892000833b55595757ccc022057692c7ab8b4b7ebcbcef4d7f67ac48fa3d43a542eaa7dd3bd360067536718560121034d6cb4cf2d493341d222e9c7c5bb90fe917cb1e26a427728e0c24dfbb272086600000000',
  txId: '4d00faa7ee7b191b3de3f84134bf73a1856e7aa7a37757651861aa104a12c31b',
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
      feePerKB: 68_187,
      inputs: {
        '16HHr8LrMG3tKGdq96n6r1tZKe44AaYC83': {
          address: '16HHr8LrMG3tKGdq96n6r1tZKe44AaYC83',
          path: 'm/0/1',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '76a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac',
              txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
              value: '0.0002 BTC',
              vout: 2,
            },
          ],
        },
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
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
              txId: '4be8bec21742975ffa27145d6683637c2bc8e8ad7b29bedfdb013a844603bbac',
              value: '0.00933282 BTC',
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
        bc1qrrgurs27sxyknugvx43hy039egrvmx097e8qzf: {
          address: 'bc1qrrgurs27sxyknugvx43hy039egrvmx097e8qzf',
          path: 'm/0/10',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '001418d1c1c15e818969f10c3563723e25ca06cd99e5',
              txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
              value: '0.001 BTC',
              vout: 0,
            },
          ],
        },
        bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6: {
          address: 'bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6',
          path: 'm/1/0',
          utxos: [
            {
              confirmations: 1,
              rbfEnabled: true,
              script: '0014e195090ad06204ee29cdfb10bd9d08485fd13929',
              txId: '43771d0143ccfd5df0e5784127e4e54b40bc93172ff6ffab311ffec9abfe9ebc',
              value: '0.00210842 BTC',
              vout: 2,
            },
          ],
        },
      },
      rbfEnabled: true,
      sent: [],
    },
    date: 'SOME DATE',
    feeAmount: '0.00049436 BTC',
    feeCoinName: 'bitcoin',
    selfSend: true,
    txId: '4d00faa7ee7b191b3de3f84134bf73a1856e7aa7a37757651861aa104a12c31b',
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
        {
          address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
          script: '0014418513e06dea9fbf8f3557888c891cd7ac060123',
          sequence: 4_294_967_293,
          txId: '4be8bec21742975ffa27145d6683637c2bc8e8ad7b29bedfdb013a844603bbac',
          value: 933_282,
          vout: 0,
        },
        {
          address: '16HHr8LrMG3tKGdq96n6r1tZKe44AaYC83',
          script: '76a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac',
          sequence: 4_294_967_293,
          txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
          value: 20_000,
          vout: 2,
        },
        {
          address: 'bc1qrrgurs27sxyknugvx43hy039egrvmx097e8qzf',
          script: '001418d1c1c15e818969f10c3563723e25ca06cd99e5',
          sequence: 4_294_967_293,
          txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
          value: 100_000,
          vout: 0,
        },
        {
          address: 'bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6',
          script: '0014e195090ad06204ee29cdfb10bd9d08485fd13929',
          sequence: 4_294_967_293,
          txId: '43771d0143ccfd5df0e5784127e4e54b40bc93172ff6ffab311ffec9abfe9ebc',
          value: 210_842,
          vout: 2,
        },
      ],
      outputs: [['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 1_271_631]],
    },
    txMeta: {
      accountIndex: 1,
      addressPathsMap: {
        '16HHr8LrMG3tKGdq96n6r1tZKe44AaYC83': 'm/0/1',
        bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew: 'm/0/0',
        bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn: 'm/0/0',
        bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl: 'm/1/2',
        bc1qrrgurs27sxyknugvx43hy039egrvmx097e8qzf: 'm/0/10',
        bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6: 'm/1/0',
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
        {
          rawData:
            '02000000000103115a799497d970ab1692bcd6d103ccb41589fe3cf59788666c4b84b5661f56230000000000fdffffff2079b3188a0aa35f4379a80956e2c33c9e90ff17a697322d642018fde53414270100000000fdffffff985d3a33ca550dc587bb943580b20c2c231ee5c491ff5db23813f810bc754a8d0000000000fdffffff01a23d0e0000000000160014418513e06dea9fbf8f3557888c891cd7ac060123014015bb80842bf964994dc115141aadf625d04c9afea73eac90e5f059f33fd4abfb4cb8f3c9ba0b2f9eb17e292b1788aec9481d25fcd8a41b9242c6ad62c1dc1cd402483045022100ea884ad7011dc3d43182e0532a518b07d84a92510d55fdcccf253bd0fbbc0f90022014e8793bcf5fabaefe169479d99c46b79452e04be90fcc8d56e3a6915c69449b0121027cf60dd1ab434e7c0e0275127d6fd4fc64e702a4f9a4b0d9d8b67ed24c4ba3a6024830450221009b81b23888d8d4ee0a599721892d67df9ab3ea740db9a6aa99e29c2fff8ae1f802203b290221ad2f64cb5f2178a7b7abd7f56976cd7d0728c9c1edd7629f47df4119012102caaad5f27bf56e3571535f5cfa9411887fc262fe8b61f37104aca826c154712c00000000',
          txId: '4be8bec21742975ffa27145d6683637c2bc8e8ad7b29bedfdb013a844603bbac',
        },
        {
          rawData:
            '02000000000101ca9ca8b726f6b212056270e0bc746457a7aeefc1ebe0022d74c2e70a45ac6fa70000000000fdffffff03a08601000000000016001418d1c1c15e818969f10c3563723e25ca06cd99e51fdbef0200000000160014d55ed98cefa2cfd7bf1489e15311d586ea55dbda204e0000000000001976a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac02483045022100c432f274be60fd883e8840d1181c103b8ee3892a09f2c8b781f78cfec805d4f802207a3fba3aca4eecc247e3d6538b1d1b91cce185606416eec4ec33c3c0a7d385ea0121031447ea71d2d2172c0560bc52afa7f3e87fae66c18b22e832a205a5662063eb4b00000000',
          txId: '2096181ad3ce844c1e5f8e033d9caaf84202c1f06d6b8cd67b26a2574a7567db',
        },
        {
          rawData:
            '02000000000101a9ca8b726f6b212056270e0bc746457a7aeefc1ebe0022d74c2e70a45ac6fa70000000000fdffffff03a08601000000000016001418d1c1c15e818969f10c3563723e25ca06cd99e51fdbef0200000000160014d55ed98cefa2cfd7bf1489e15311d586ea55dbda204e0000000000001976a91439ed58f4ac11f1239d9a71b6f6eb82f050e5916288ac02483045022100c432f274be60fd883e8840d1181c103b8ee3892a09f2c8b781f78cfec805d4f802207a3fba3aca4eecc247e3d6538b1d1b91cce185606416eec4ec33c3c0a7d385ea0121031447ea71d2d2172c0560bc52afa7f3e87fae66c18b22e832a205a5662063eb4b00000000',
          txId: '43771d0143ccfd5df0e5784127e4e54b40bc93172ff6ffab311ffec9abfe9ebc',
        },
      ],
    },
  },
  virtualSize: 725,
}

export default taprootAllUnsignedTx
