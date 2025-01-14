const taprootUnsignedTx = {
  accountIndex: 1,
  rawTx:
    '020000000001022ed3c9917a29f91be86eae85c7dd5191d5fb8dacfef7ecaf2f6ab680e8b7cb710000000000fdffffff9ce7fe6dedcc35ea7ef6cba7cba57ee1a73dd78dd1baecc53fbe5e00e02add7d0000000000fdffffff010a00000000000000225120b5c7dcfa43fca2e989ec0ede55a533687957b2fa2557faa82b509b74ee14f537024830450221009a70dd5b0beeafc0307dc25441dd9db9397c126c469fac67bd9e50a79fa0d81502207496a161a77cd0a56ef04be6e289af1003375a8dd02cadac9f87839b9e77e35a012103822f479dce9d7880edb4dd486732336603286d43ae6db4e04599d673a93809310140c4d1a3e0d129de30a5d4c487a7b44da3dbe472386ee946df878baaac99357d0ae70c7ad90eb6c809c1f32e256ceb6e758e6ff3b3d1f6f7472c14c207c23d8d3200000000',
  txId: 'b5b0c28ad3cd98d07490fb26cc5cc7388b45019fc11ed4295ef49adc88d7f0cf',
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
      feePerKB: 94_597,
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
    feeAmount: '0.00016933 BTC',
    feeCoinName: 'bitcoin',
    selfSend: true,
    txId: 'b5b0c28ad3cd98d07490fb26cc5cc7388b45019fc11ed4295ef49adc88d7f0cf',
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
      ],
      outputs: [['bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew', 10]],
    },
    txMeta: {
      accountIndex: 1,
      addressPathsMap: {
        bc1pkhrae7jrlj3wnz0vpm09tffndpu40vh6y4tl42pt2zdhfms575msdfwuew: 'm/0/0',
        bc1qjy3rk6355pn63ws235cjwzgv6e9ph9aeku0vjl: 'm/1/2',
      },
      blockHeight: 768_520,
      rawTxs: [
        {
          rawData:
            '02000000000102e0103c63be36a3fc2748f0a7217d342f4edc0fd80db97257b188830e5017b5150100000000fdffffff015df8ec326ac95d11c60aafbe4521bc5e431ec22f55794222b659ebc0765e970100000000fdffffff021f1b00000000000016001491223b6a34a067a8ba0a8d3127090cd64a1b97b9102700000000000016001413c3a3fe40a9a1f47de541c6d48a50cf9b0beeae024830450221008de47751a4b64ef93e583864b3e80d3506708bcb09eb7958e7f6759d9c24de9b02205d93a4dc030916c8dd90711adecdca78c0a10acf0df7eb7cf1bcbaaf21d6faba012102547811edc85c96c02c36cc561a3cf57bb71f0d526b1ec2c9803b0a9486f0462402473044022044ec05426e3bbe84320205b9b2494446099a9e77fdb9babb23ff1bc17686879802203719465d576442b06ac373d2369085fabe09548eabf39ce177b135b8ac73222f0121022a8bb930fa5b65c64be7073e62adc946f3da73cabc2bb81bc2e043222db020dc00000000',
          txId: '71cbb7e880b66a2fafecf7feac8dfbd59151ddc785ae6ee81bf9297a91c9d32e',
        },
      ],
    },
  },
  virtualSize: 179,
}

export default taprootUnsignedTx
