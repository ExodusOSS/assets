import lodash from 'lodash'

const apiMock = {
  tokenAssetType: 'SOLANA_TOKEN',
  setServer: jest.fn(),
  setAssets: jest.fn(),
  setTokens: jest.fn(function (assets) {
    const solTokens = lodash.pickBy(assets, (asset) => asset.assetType === apiMock.tokenAssetType)
    this.tokens = new Map(Object.values(solTokens).map((v) => [v.mintAddress, v]))
  }),
  watchAddress: jest.fn(),
  unwatchAddress: jest.fn(),

  getTransactions: async (...args) => {
    expect(args).toEqual([
      '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
      {
        cursor: '',
        includeUnparsed: true,
        tokenAccounts: [
          {
            balance: '9000000',
            mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
            owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            ticker: '8HGYsolana43B58185',
            tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
            tokenName: '8hgy_solana_43b58185',
          },
          {
            balance: '540000',
            mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
            owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            ticker: 'MEANsolanaC5CBA5C4',
            tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
            tokenName: 'mean_solana_c5cba5c4',
          },
          {
            balance: '2386293',
            mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
            owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
            ticker: 'RAY',
            tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
            tokenName: 'raydium',
          },
        ],
      },
    ])
    return {
      transactions: [
        {
          timestamp: 1_654_797_546_000,
          date: '2022-06-09T17:59:06.000Z',
          id: '3fiGCohizfVEeSSq4mrfGHve2tZA439toP9RwS1hFX1ViM4VEWX3Dw172ynsrJQ8evcCphohf7r7VTYg1KmvhnUC',
          slot: 136_939_890,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          amount: 134_570_800,
          fee: 5000,
          staking: {
            method: 'createAccountWithSeed',
            seed: 'exodus:1654797541558',
            stakeAddresses: ['7XHXjJQ7Gzno3QarhCFXXmd4xxBrRDsSGooLLLbYV7XR'],
            stake: 134_570_800,
          },
        },
        {
          timestamp: 1_653_925_537_000,
          date: '2022-05-30T15:45:37.000Z',
          id: '2uwzLyasKxnxB4FjxUbvUDbdpEaWmgzi6Te9PTAqwXsGdnYZdbeHh3LGmwBeVBLXqjCZM5kbvDuGR2Uth4bmon8f',
          slot: 135_760_822,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
            tokenName: 'mean_solana_c5cba5c4',
            ticker: 'MEANsolanaC5CBA5C4',
            mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
          },
          from: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
          to: '3aSdqidyDDVvsh4ZRVrVNezVNDLKnHmyuoWGeFGi93m7',
          amount: 10_000,
          fee: 5000,
        },
        {
          timestamp: 1_653_353_991_000,
          date: '2022-05-24T00:59:51.000Z',
          id: '4RegBpwrcmFvvq8qs9mGBGLY3sabdbUzFSeThXyFof9J64chQEWGRkBQSUeaq5p7sA4nV3wLH2hyoLex5TGoxTcQ',
          slot: 134_970_480,
          error: false,
          owner: null,
          token: {
            tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
            tokenName: 'mean_solana_c5cba5c4',
            ticker: 'MEANsolanaC5CBA5C4',
            mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
          },
          from: '6YrejbdKKuxNT86QBfvPSpQYHLbQVMFSh14ZMJ9vALEt',
          to: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
          amount: 20_000,
          fee: 0,
        },
        {
          timestamp: 1_653_353_402_000,
          date: '2022-05-24T00:50:02.000Z',
          id: 'LA7eSpohaGFFMhgfMdyWV8EbuqKen1DQtLeqcv2V3tb9zQMUV7bj3VW9nq3ksHzubGEqoGmug5UNDXZRNUjnrLG',
          slot: 134_969_651,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
            tokenName: 'mean_solana_c5cba5c4',
            ticker: 'MEANsolanaC5CBA5C4',
            mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
          },
          from: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
          to: 'DzEGYQg8QoT8QqFD3ERCcbXsdxDvGnxe3JaeJHd65vDJ',
          amount: 70_000,
          fee: 5000,
        },
        {
          timestamp: 1_653_343_974_000,
          date: '2022-05-23T22:12:54.000Z',
          id: '3ZqxuAWfAGwF1HyHxFmHu3w1CHFh8EPJQe5wuaZ5V6udo17nYGJmEQR77UfrAWbNkH4eY7uXXPKzYpB4ZxWbpuBR',
          slot: 134_956_663,
          error: false,
          owner: null,
          token: {
            tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
            tokenName: 'mean_solana_c5cba5c4',
            ticker: 'MEANsolanaC5CBA5C4',
            mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
          },
          from: '6YrejbdKKuxNT86QBfvPSpQYHLbQVMFSh14ZMJ9vALEt',
          to: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
          amount: 600_000,
          fee: 0,
        },
        {
          timestamp: 1_651_246_205_000,
          date: '2022-04-29T15:30:05.000Z',
          id: 'VAok8n3wmVCTfu5FDV9aEiHbjcSpj4ULZkonyoXPmeNynFHrkwakmmfsoLBn7bCnfy9nvRXjjbfo5sn7RKFV3Z6',
          slot: 131_819_518,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
            tokenName: '8hgy_solana_43b58185',
            ticker: '8HGYsolana43B58185',
            mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
          },
          from: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
          to: '7qfQ9QU47Lo9JjiVtj2PTSbbzgbQ4Hmz92Ct6AwwBVAp',
          amount: 1_000_000,
          fee: 5000,
        },
        {
          timestamp: 1_651_240_748_000,
          date: '2022-04-29T13:59:08.000Z',
          id: '24GQxKf8UCYu81qfGNNMj11vMPNp2tTBwiBSHiLEQajeYH4MkRmoeUoEedrssn4ZMigscXLZDbTRx836Wrhm7ibe',
          slot: 131_811_126,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
            tokenName: '8hgy_solana_43b58185',
            ticker: '8HGYsolana43B58185',
            mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
          },
          from: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
          to: '7qfQ9QU47Lo9JjiVtj2PTSbbzgbQ4Hmz92Ct6AwwBVAp',
          amount: 5_000_000,
          fee: 5000,
        },
        {
          timestamp: 1_651_240_452_000,
          date: '2022-04-29T13:54:12.000Z',
          id: '26mdaEU1sbBj3Y13L3aLM88cgrYWLy6u25teUz95zbiQG8kNoBoDAwHubYYuoLNvpToXBKoHJMdti3hSDHCYrLkf',
          slot: 131_810_675,
          error: false,
          owner: null,
          token: {
            tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
            tokenName: '8hgy_solana_43b58185',
            ticker: '8HGYsolana43B58185',
            mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
          },
          from: '5ddWhogjCr3mVGbiTYnJLa2ki9cHxERG2djH7qKNkjqw',
          to: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
          amount: 15_000_000,
          fee: 0,
        },
        {
          timestamp: 1_649_863_458_000,
          date: '2022-04-13T15:24:18.000Z',
          id: '82SC4G8usbwM2Zsk2J3nURZmMz4omtneSRr7nX1i7sjzfajokAfUiusSYVd2ws5bn4ucaC1dvdiAYSS8pM8yqZS',
          slot: 129_572_609,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
            tokenName: 'raydium',
            ticker: 'RAY',
            mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          },
          from: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
          to: '6do2vExLT9LETSUk1vKkm9A6BxgqtemQazKWndatjWFL',
          amount: 386_292,
          fee: 5000,
        },
        {
          timestamp: 1_649_857_428_000,
          date: '2022-04-13T13:43:48.000Z',
          id: '4LsihvxHQwq58iQRJk3vuAxyvNaj4dxZ87i7BJqjh2UTsFEDouWscoKqu6orVV6zyywpmdNJGQxm3kKvxobg6UD6',
          slot: 129_562_497,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          token: {
            tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
            tokenName: 'raydium',
            ticker: 'RAY',
            mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          },
          from: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
          to: '6do2vExLT9LETSUk1vKkm9A6BxgqtemQazKWndatjWFL',
          amount: 772_585,
          fee: 5000,
        },
        {
          timestamp: 1_649_857_316_000,
          date: '2022-04-13T13:41:56.000Z',
          id: '25reWK943nzgGEDuJ5e56JCxmskwBzHtqQTQxV1FuhewDnPdfxYDJgSRaUFDVw6cP27qUj1J5vTVCFNumXvZX4BB',
          slot: 129_562_293,
          error: false,
          owner: null,
          token: {
            tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
            tokenName: 'raydium',
            ticker: 'RAY',
            mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          },
          from: 'Faszfxg7k2HWUT4CSGUn9MAVGUsPijvDQ3i2h7fi46M6',
          to: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
          amount: 3_545_170,
          fee: 0,
        },
        {
          timestamp: 1_649_425_956_000,
          date: '2022-04-08T13:52:36.000Z',
          id: '2Apnh4WBnVLpjceHMiMuY3rr49kzTJCMjwH4imsgjSHxtd7hvDQkmScTwuNCN22uAWNu4koDLLSvcFG6TwQnQWp5',
          slot: 128_799_407,
          error: false,
          owner: '7HAULvGEChgLZSXV3zwzkJCnArtWbmMA5RygDpsfryEA',
          from: '7HAULvGEChgLZSXV3zwzkJCnArtWbmMA5RygDpsfryEA',
          to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          amount: 142_762_920,
          fee: 0,
        },
        {
          timestamp: 1_649_425_849_000,
          date: '2022-04-08T13:50:49.000Z',
          id: 'UaZAVAZEyBCuXJCbK8xh97KgB2ktMCgeppdomEf6riDsdSyK8HbAGJDVtqVYA54PduN9ZxZsnjuUTHV22LzsPNj',
          slot: 128_799_211,
          error: false,
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          from: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          to: '7HAULvGEChgLZSXV3zwzkJCnArtWbmMA5RygDpsfryEA',
          amount: 152_767_920,
          fee: 5000,
        },
        {
          timestamp: 1_649_425_475_000,
          date: '2022-04-08T13:44:35.000Z',
          id: '2GtBQDGgWYA3Sziht49yiFTk4BBoxk2pp8Bx5kLJzqf8PrZofmniKRUKt5ZSi1RjpJpYkwdDBP8PeVLAyiiTuA1c',
          slot: 128_798_507,
          error: false,
          owner: '6ZRCB7AAqGre6c72PRz3MHLC73VMYvJ8bi9KHf1HFpNk',
          from: '6ZRCB7AAqGre6c72PRz3MHLC73VMYvJ8bi9KHf1HFpNk',
          to: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          amount: 162_772_920,
          fee: 0,
        },
      ],
      newCursor:
        '3fiGCohizfVEeSSq4mrfGHve2tZA439toP9RwS1hFX1ViM4VEWX3Dw172ynsrJQ8evcCphohf7r7VTYg1KmvhnUC',
    }
  },

  ownerChanged: async () => false,

  getStakeAccountsInfo: async (...args) => {
    expect(args).toEqual(['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'])
    return {
      accounts: {
        '7XHXjJQ7Gzno3QarhCFXXmd4xxBrRDsSGooLLLbYV7XR': {
          activationEpoch: 316,
          deactivationEpoch: 18_446_744_073_709_552_000,
          stake: 132_287_920,
          voter: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
          warmupCooldownRate: 0.25,
          lamports: 134_570_800,
          state: 'active',
          isDeactivating: false,
          canWithdraw: false,
        },
      },
      totalStake: 132_287_920,
      locked: 134_570_800,
      activating: 0,
      withdrawable: 111,
      pending: 222,
    }
  },

  getRewards: async (...args) => {
    expect(args).toEqual(['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'])
    return 3333
  },

  getTokenAccountsByOwner: async (...args) => {
    expect(args).toEqual(['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'])
    return [
      {
        tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
        owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
        tokenName: '8hgy_solana_43b58185',
        ticker: '8HGYsolana43B58185',
        balance: '9000000',
        mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
      },
      {
        tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
        owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
        tokenName: 'mean_solana_c5cba5c4',
        ticker: 'MEANsolanaC5CBA5C4',
        balance: '540000',
        mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
      },
      {
        tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
        owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
        tokenName: 'raydium',
        ticker: 'RAY',
        balance: '2386293',
        mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      },
    ]
  },

  getWalletTokensList: async () => {
    return [
      '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
      'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      'UNKNOWN1AAAAyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNL',
      'UNKNOWN2BBBByjzvzp8eMZWUXbBCjEvwSkkk59S5iCNL',
    ]
  },

  getTokensBalancesAndAccounts: async () => {
    return {
      balances: {
        '8hgy_solana_43b58185': 9_000_000,
        mean_solana_c5cba5c4: 540_000,
        raydium: 2_386_293,
      },
      accounts: [
        {
          tokenAccountAddress: '5oq1Kvmmtgp9UtDzLEwYi7QcmcHUm45ZWgmV9yRKL6rS',
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          tokenName: '8hgy_solana_43b58185',
          ticker: '8HGYsolana43B58185',
          balance: '9000000',
          mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
        },
        {
          tokenAccountAddress: 'DfV8UWiwyn8fiMdNZv3mA3wtNJw3eRYKVtV8itRDVF1R',
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          tokenName: 'mean_solana_c5cba5c4',
          ticker: 'MEANsolanaC5CBA5C4',
          balance: '540000',
          mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
        },
        {
          tokenAccountAddress: '4r6P9xCvb7413MB8bPrR7VCU8qcNbgpaFagkAJa57mPt',
          owner: '8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X',
          tokenName: 'raydium',
          ticker: 'RAY',
          balance: '2386293',
          mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
        },
      ],
    }
  },

  getBalance: async (...args) => {
    expect(args).toEqual(['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'])
    return 10_000_000
  },

  getAccountInfo: async (...args) => {
    expect(args).toEqual(['8APBjTndtCF4kfKHaJG9boR2dREGNCK4yFRVfqUfzS4X'])
    return { lamports: 10_000_000, space: 5 }
  },

  getMinimumBalanceForRentExemption: (size) => {
    expect(size).toEqual(5)
    return 300_000
  },
}

export default apiMock
