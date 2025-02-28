const nftSendCustomFeeUsignedTx = {
  accountIndex: 1,
  rawTx:
    '02000000000102ad542e3129439f53ed51052cc33f6fd9f365b3e8a8fa0dea8f44ccfcbe7e62d20100000000ffffffffbc9efeabc9fe1f31abfff62f1793bc404be5e4274178e5f05dfdcc43011d77430200000000ffffffff02d947010000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f5378af2020000000000160014418513e06dea9fbf8f3557888c891cd7ac06012302483045022100dc4795a4879ea04626f9ad206e26f6c0f962fce5e921386ae1221e9e3a29a20a022051cd6fbb608ca59634bd348b607ffd2ded0d3f172109700b95c7128f39a99d2f012103ea0d3f2e91cb76f0784c0e295eb208bfc7342512a4767056a0da9c1f9b58459a0247304402201251da317a424913a6e17dd4bdbfd843c32fbd10afd0a0ca28c1fb87720e8df102202a87afad317c629ff697c3b28491f2f052dcbbd3abb9f430c58d8b122c53dabe0121034d6cb4cf2d493341d222e9c7c5bb90fe917cb1e26a427728e0c24dfbb272086600000000',
  txId: 'e38c36fe7ef8b57d065b2c1ec556bc3ebafbba8e3e407c7f896abd6ce6b59c79',
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
      feePerKB: 80_000,
      inputs: {
        bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny: {
          address: 'bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny',
          path: 'm/1/3',
          utxos: [
            {
              confirmations: 1,
              inscriptions: [
                {
                  inscriptionId:
                    '11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
                  offset: 0,
                },
              ],
              script: '00140da8889de9cd38f5a5a7408b78fe08ed5ea054b6',
              txId: 'd2627ebefccc448fea0dfaa8e8b365f3d96f3fc32c0551ed539f4329312e54ad',
              value: '0.00083929 BTC',
              vout: 1,
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
      inscriptionsIndexed: true,
      nftId: 'bitcoin:11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
      rbfEnabled: false,
      sent: [],
      sentInscriptions: [
        {
          inscriptionId: '11199d28c76a6d2b82c35772ed4d1d7b5156dfe7aa385490ac0799c95187038fi0',
          offset: 0,
          value: 0,
        },
      ],
    },
    date: 'SOME DATE',
    feeAmount: '0.0001768 BTC',
    feeCoinName: 'bitcoin',
    selfSend: true,
    txId: 'e38c36fe7ef8b57d065b2c1ec556bc3ebafbba8e3e407c7f896abd6ce6b59c79',
    version: 1,
  },
  unsignedTx: {
    txData: {
      inputs: [
        {
          address: 'bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny',
          script: '00140da8889de9cd38f5a5a7408b78fe08ed5ea054b6',
          sequence: 4_294_967_295,
          txId: 'd2627ebefccc448fea0dfaa8e8b365f3d96f3fc32c0551ed539f4329312e54ad',
          value: 83_929,
          vout: 1,
        },
        {
          address: 'bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6',
          script: '0014e195090ad06204ee29cdfb10bd9d08485fd13929',
          sequence: 4_294_967_295,
          txId: '43771d0143ccfd5df0e5784127e4e54b40bc93172ff6ffab311ffec9abfe9ebc',
          value: 210_842,
          vout: 2,
        },
      ],
      outputs: [
        ['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 83_929],
        ['bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn', 193_162],
      ],
    },
    txMeta: {
      accountIndex: 1,
      addressPathsMap: {
        bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn: 'm/0/0',
        bc1qpk5g380fe5u0tfd8gz9h3lsga402q49kf2c5ny: 'm/1/3',
        bc1qux2sjzksvgzwu2wdlvgtm8ggfp0azwff53yar6: 'm/1/0',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData:
            '020000000001072ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000ffffffffcb5627fe840c0ce34b3abce95fc614152f99fafb584fc8b204b93e5b79e6b37b0000000000ffffffff35526b8b7c32db67b187fb8a0c1463e12f2f53c4c36894896fb2629dbd9287a40000000000ffffffffce109bb75b3563a5d66136320121f714d0e392b773701089908bbda7ec384ada0000000000ffffffffdb67754a57a2267bd68c6b6df0c10242f8aa9c3d038e5f1e4c84ced31a189620020000006a473044022035c378d6955d9c12a5c0b26fe07614b89d8aeb2c645d0b5fd5a47abd23f2c86102201f8460e4f0cd5013741dc25577347701fb9dbb1e1748c7fd59991d23fd0f6ac6012102fad2af50eac67b388a83a69c62d666675b1a9899e7f3a4f59fbb832e2cb6ea85ffffffff9ce7fe6dedcc35ea7ef6cba7cba57ee1a73dd78dd1baecc53fbe5e00e02add7d0000000000ffffffffdb67754a57a2267bd68c6b6df0c10242f8aa9c3d038e5f1e4c84ced31a1896200000000000ffffffff02183d0000000000001600143d9bf55b8b0b7d4dfb6fbce8f202415fa5d8bf35d9470100000000001600140da8889de9cd38f5a5a7408b78fe08ed5ea054b602483045022100e4c7b3d83c25bf74a658543f7e23a226289c27e507f3adf46aa259b9cbaf0bd702201463b988fa04f7fbb366a42915e4abd2596c8e7d892b999115e998b991b804b2012103822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a93809310140ebff8042ad04f6ac2a1f82ab186f122360c7801e6139f7d02c9ff0f5df9dce458437cbeec03bcecb1c796df95d172235b8d46504970e2ef307686b98b2e7206d0247304402206cdcf939ea794b217f2e15b04f9850c0d82baf9cad8494a6e736d16c6ad6ebf702207d75f7355986a7dc2be508d99b8d5391b532353318bfa01166d296a48bda7962012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718702473044022009cf1f911ce27fd2a4fd758f0be7e70f4c978acb904cca71ad0ec338514205e402204d3346e118b9408a3fc6a53c11b363a2c8bef12ad3f402c81ca23ed56a238702012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d4718700014063be1913dd23a206ddaf04194e72c1d47b50ce7facc27ba9e450794dc66cd922ca8a3a3e8d2b3fe7e1e81c95845ff45cf578eaf25b102c062047d330a689df29024830450221008f643f316ddc7bc5551332ffee05a5debd333b9b9df1b99a2cfc1ca1fe7e22f30220255c7abe0fc8cf21240d9d7e4433c55d752e06cd186902c6840445d7966f0b00012102f191ae41aabe4ccf37af9bcb2ae42273d9537e332e0f95d04e0b8f362204fae100000000',
          txId: 'd2627ebefccc448fea0dfaa8e8b365f3d96f3fc32c0551ed539f4329312e54ad',
        },
        {
          rawData:
            '02000000000106d381e2054152518d435b71fb7dd8007efa1dafa15b52e7435c3ee0e5fb2b24da0200000000fdffffffd381e2054152518d435b71fb7dd8007efa1dafa15b52e7435c3ee0e5fb2b24da0000000000fdffffff545569e596dbae51b7d00ed765c6034c75586123abc58aeb35220b127b5ef2100000000000fdffffffd381e2054152518d435b71fb7dd8007efa1dafa15b52e7435c3ee0e5fb2b24da0300000000fdffffff1f6e029e15a513f64216071f6b3affaf877085e6b2f38f5083db3c0426fd8a4d0000000000fdffffffd381e2054152518d435b71fb7dd8007efa1dafa15b52e7435c3ee0e5fb2b24da040000006b483045022100a520c026e2ae53f0fc4587c6c9000f4a04c8794fc97966445db06f9a0c6b4d3902206eea8e26e2b461e9e6e196c7292dcffc87b65873ae230556d693d980f3fb4b90012102e8ec470bb003024c3a542d0e95bccdfad254bf34240c038ac29a737485f84decfdffffff03102700000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeaea08601000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae9a37030000000000160014e195090ad06204ee29cdfb10bd9d08485fd139290140d86fdd0db43462b81a23cde1eda17df92d5394e91050c5d4f2ef132f2dd1a5f9b8e12aa8d301b4b2fa12d94c68fda65b1276e47ac9941cca228b03b718389be601407fbf1a247fdf63231e56c7bbe3d0999a3d6109feb1c71a9f72fea0f549306a695e0b1c04e9becb9005ef90d7a32c2c404144485395b1c2f39319325caaf85c7b02483045022100b8bc92f8d8d778cf5ff82cb8d53a8de1b3c9e5ab819169ae02707b6fd0d3df5a02201fd3047b75d7ac0147e55573b378ced73f9215f75bbcab4eb7f9b07871fdde71012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d471870140de752e1b26d66bba93ad543f4c20f1f7a7fdd2ede0a86d050fde4e93afdea8644b19f68f45eb167ee5653be16c927300589985a2d4cb351baad777d7fb7a630002483045022100e9add267e345f0c42c12f52323869ab4c9abe4af631041f0d9ef1a63113a0839022008d515f4a3a543d24254a6dd78eba3dc015e2f79b160332e08e8fd27e7ba51b7012102d3b9b2c8af5a2f5f068b7d2d16d03e5945057973644d015088a5267e31d471870000000000',
          txId: '43771d0143ccfd5df0e5784127e4e54b40bc93172ff6ffab311ffec9abfe9ebc',
        },
      ],
    },
  },
  virtualSize: 221,
}

export default nftSendCustomFeeUsignedTx
