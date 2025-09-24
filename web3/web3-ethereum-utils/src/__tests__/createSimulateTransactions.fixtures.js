export const sampleData = [
  {
    testName: 'should return balance changes for ETH transfer',
    simulationResult: {
      action: 'WARN',
      warnings: [
        {
          kind: 'TRANSFERRING_ERC20_TO_OWN_CONTRACT',
          message:
            'You are transferring ER20 tokens directly to their own token contract. In most cases this will lead to you losing them forever.',
          severity: 'WARNING',
        },
      ],
      simulationResults: {
        aggregated: {
          expectedStateChanges: {
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': [
              {
                humanReadableDiff: 'Send 1 WETH',
                rawInfo: {
                  kind: 'ERC20_TRANSFER',
                  data: {
                    amount: {
                      before: '83226553153926107704',
                      after: '82226953153926107704',
                    },
                    counterparty: {
                      kind: 'ACCOUNT',
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    },
                    asset: {
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                      symbol: 'WETH',
                      name: 'Wrapped Ether',
                      decimals: 18,
                      verified: true,
                      lists: [
                        'COINGECKO',
                        'ZERION',
                        'ONE_INCH',
                        'UNISWAP',
                        'MY_CRYPTO_API',
                        'KLEROS_TOKENS',
                      ],
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1690390523,
                        dollarValuePerToken: 1860.14,
                      },
                    },
                  },
                },
              },
            ],
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': [
              {
                humanReadableDiff: 'Receive 1 WETH',
                rawInfo: {
                  kind: 'ERC20_TRANSFER',
                  data: {
                    amount: {
                      before: '743004895062091899256',
                      after: '744004895062091899256',
                    },
                    asset: {
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                      symbol: 'WETH',
                      name: 'Wrapped Ether',
                      decimals: 18,
                      verified: true,
                      lists: [
                        'COINGECKO',
                        'ZERION',
                        'ONE_INCH',
                        'UNISWAP',
                        'MY_CRYPTO_API',
                        'KLEROS_TOKENS',
                      ],
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1690390523,
                        dollarValuePerToken: 1860.14,
                      },
                    },
                  },
                },
              },
            ],
          },
          error: null,
          userAccount: '0xd8da6bf26964af9d7eed9e03e53415d37aa96045',
        },
        perTransaction: [],
      },
    },
    expectedState: {
      balanceChanges: {
        willSend: [
          {
            asset: {
              address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              imageUrl:
                'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
              name: 'Wrapped Ether',
              symbol: 'WETH',
              verified: true,
            },
            balance: {
              type: 'NumberUnit',
              unit: 'base',
              unitType: 'WETH',
              value: '999600000000000000',
            },
          },
        ],
      },
    },
  },
  {
    testName: 'should return balance changes for NTF purchase',
    simulationResult: {
      action: 'NONE',
      warnings: [],
      simulationResults: {
        aggregated: {
          expectedStateChanges: {
            '0xa746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6': [
              {
                humanReadableDiff: 'Receive 0.00067 ETH',
                rawInfo: {
                  kind: 'NATIVE_ASSET_TRANSFER',
                  data: {
                    amount: {
                      before: '45156562900701000',
                      after: '45829312900701000',
                    },
                    counterparty: null,
                    asset: {
                      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                      symbol: 'ETH',
                      name: 'Ether',
                      decimals: 18,
                      verified: true,
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1691014096,
                        dollarValuePerToken: 1843.04,
                      },
                    },
                  },
                },
              },
              {
                humanReadableDiff:
                  'Send ENS: Ethereum Name Service #4080...6351',
                rawInfo: {
                  kind: 'ERC721_TRANSFER',
                  data: {
                    tokenId:
                      '4080240946854793907832514867804389246584734305745377864477782378557572796351',
                    amount: {
                      before: '1',
                      after: '0',
                    },
                    counterparty: {
                      kind: 'ACCOUNT',
                      address: '0xa746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6',
                    },
                    metadata: {
                      rawImageUrl:
                        'https://cdn.simplehash.com/assets/38a494f91b9c246935ca316db960245ec2e0ed5a6cf1ae1ee1172cdd359e3c9b.svg',
                    },
                    asset: {
                      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                      symbol: '3350000.eth',
                      name: 'ENS: Ethereum Name Service',
                      price: null,
                    },
                  },
                },
              },
            ],
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': [
              {
                humanReadableDiff: 'Send 0.00069 ETH',
                rawInfo: {
                  kind: 'NATIVE_ASSET_TRANSFER',
                  data: {
                    amount: {
                      before: '8834576513856760',
                      after: '8144576513856760',
                    },
                    counterparty: null,
                    asset: {
                      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                      symbol: 'ETH',
                      name: 'Ether',
                      decimals: 18,
                      verified: true,
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1691014096,
                        dollarValuePerToken: 1843.04,
                      },
                    },
                  },
                },
              },
              {
                humanReadableDiff:
                  'Receive ENS: Ethereum Name Service #4080...6351',
                rawInfo: {
                  kind: 'ERC721_TRANSFER',
                  data: {
                    tokenId:
                      '4080240946854793907832514867804389246584734305745377864477782378557572796351',
                    amount: {
                      before: '0',
                      after: '1',
                    },
                    counterparty: {
                      kind: 'ACCOUNT',
                      address: '0x6116abb116d5a5da8153dcfffcb3d69f984fbce1',
                    },
                    metadata: {
                      rawImageUrl:
                        'https://cdn.simplehash.com/assets/38a494f91b9c246935ca316db960245ec2e0ed5a6cf1ae1ee1172cdd359e3c9b.svg',
                    },
                    asset: {
                      address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                      symbol: '3350000.eth',
                      name: 'ENS: Ethereum Name Service',
                      price: null,
                    },
                  },
                },
              },
            ],
            '0x0000a26b00c1f0df003000390027140000faa719': [
              {
                humanReadableDiff: 'Receive 0.00002 ETH',
                rawInfo: {
                  kind: 'NATIVE_ASSET_TRANSFER',
                  data: {
                    amount: {
                      before: '84288456834584196080',
                      after: '84288474084584196080',
                    },
                    counterparty: null,
                    asset: {
                      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                      symbol: 'ETH',
                      name: 'Ether',
                      decimals: 18,
                      verified: true,
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1691014096,
                        dollarValuePerToken: 1843.04,
                      },
                    },
                  },
                },
              },
            ],
          },
          error: null,
          userAccount: '0xb3bde75c925f02c8903240f9e8d4b9297e6aff37',
        },
        perTransaction: [
          {
            error: null,
            gas: {
              gasLimit: '144093',
            },
            protocol: null,
            logs: [
              {
                address: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
                topics: [
                  '0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31',
                  '0x0000000000000000000000006116abb116d5a5da8153dcfffcb3d69f984fbce1',
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                ],
                data: '0x375371d4d81dfd1f6c5938c7bdfe417236974b8f419caa234851bb667957a397000000000000000000000000a746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000200000000000000000000000057f1887a8bf19b14fc0df6fd9b2acc9af147ea85090555a429e1ff5309a9aa5e9a82f88f6b8594ec60462c36c9eadf28e6564fbf00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000263dcd0c5cc000000000000000000000000006116abb116d5a5da8153dcfffcb3d69f984fbce100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000fb0541f54000000000000000000000000000000a26b00c1f0df003000390027140000faa719',
              },
              {
                address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                topics: [
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                  '0x0000000000000000000000006116abb116d5a5da8153dcfffcb3d69f984fbce1',
                  '0x000000000000000000000000a746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6',
                  '0x090555a429e1ff5309a9aa5e9a82f88f6b8594ec60462c36c9eadf28e6564fbf',
                ],
                data: '0x',
              },
            ],
            decodedLogs: [
              null,
              {
                name: 'Transfer',
                signature:
                  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                params: [
                  {
                    name: 'from',
                    paramType: 'address',
                    value: '0x6116abb116d5a5da8153dcfffcb3d69f984fbce1',
                  },
                  {
                    name: 'to',
                    paramType: 'address',
                    value: '0xa746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6',
                  },
                  {
                    name: 'tokenId',
                    paramType: 'uint256',
                    value:
                      '0x90555a429e1ff5309a9aa5e9a82f88f6b8594ec60462c36c9eadf28e6564fbf',
                  },
                ],
              },
            ],
            decodedCalldata: {
              kind: 'FUNCTION',
              data: {
                contract: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
                functionName: 'fulfillBasicOrder_efficient_6GL6yc',
                arguments: [
                  {
                    name: 'parameters',
                    value: [
                      '0x0000000000000000000000000000000000000000',
                      '0x0',
                      '0x263dcd0c5cc00',
                      '0x6116abb116d5a5da8153dcfffcb3d69f984fbce1',
                      '0x0000000000000000000000000000000000000000',
                      '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
                      '0x90555a429e1ff5309a9aa5e9a82f88f6b8594ec60462c36c9eadf28e6564fbf',
                      '0x1',
                      '0x0',
                      '0x64ca124f',
                      '0x64ce0708',
                      '0x0000000000000000000000000000000000000000000000000000000000000000',
                      '0xd14e6a731d4da48b0000000000000000823ef01a93051c32101cb6a3fcb6c6de',
                      '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                      '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                      '0x1',
                      [
                        [
                          '0xfb0541f5400',
                          '0x0000a26b00c1f0df003000390027140000faa719',
                        ],
                      ],
                      '0xa99af29e2bb136aa9b087e6111830d0ea7f5242d30d077365df63270bbc32a6dbdeb4688e37d4b08790020ed625fe408b6232bc94f3097127626d72965cd587b00000da3b18c10b8ff68caf6b0860221f2f54c00b506f80f420c034c90e077f93c93079aa25e527d3e40c60ea36f3dc930d207d38bf8b8e6ecb022d1c509750230bb825bc748f5912b86a281adce4f31d04f7310d93a20d0951ef8d543c5abb0f163a01c8c7247a27f5b54cb70499f455b4b5af2b05ca616d0aa91382c3c6abf4664bb23a859e6b7e39e4597a70eaa00699740a2786f8327167cc94879170ab053149144182831a96a6f500a88715ba196e7beaafed34a0ed3e041059faf04aab853ee',
                    ],
                    paramType:
                      '(address,uint256,uint256,address,address,address,uint256,uint256,uint8,uint256,uint256,bytes32,uint256,bytes32,bytes32,uint256,(uint256,address)[],bytes)',
                  },
                ],
              },
            },
          },
        ],
      },
    },
    expectedState: {
      balanceChanges: {
        willReceive: [
          {
            asset: {
              address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
              imageUrl:
                'https://cdn.simplehash.com/assets/38a494f91b9c246935ca316db960245ec2e0ed5a6cf1ae1ee1172cdd359e3c9b.svg',
              name: 'ENS: Ethereum Name Service',
              symbol: '3350000.eth',
            },
            balance: {
              type: 'NumberUnit',
              unit: 'base',
              unitType: '3350000.eth',
              value: '1',
            },
            nft: {
              compositeId:
                '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/4080240946854793907832514867804389246584734305745377864477782378557572796351',
              id: 'ethereum:0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/4080240946854793907832514867804389246584734305745377864477782378557572796351',
              title: 'ENS: Ethereum Name Service',
            },
          },
        ],
        willSend: [
          {
            asset: {
              address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              imageUrl:
                'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
              name: 'Ether',
              symbol: 'ETH',
              verified: true,
            },
            balance: {
              type: 'NumberUnit',
              unit: 'base',
              unitType: 'ETH',
              value: '690000000000000',
            },
          },
        ],
      },
    },
  },
  {
    testName: 'should return balance changes for ERC20 Approve Transfer',
    simulationResult: {
      action: 'NONE',
      warnings: [],
      simulationResults: {
        aggregated: {
          expectedStateChanges: {
            '0xd8da6bf26964af9d7eed9e03e53415d37aa96045': [
              {
                humanReadableDiff:
                  'Approve to transfer any amount of your WETH',
                rawInfo: {
                  kind: 'ERC20_APPROVAL',
                  data: {
                    spender: {
                      kind: 'ACCOUNT',
                      address: '0x000000000022d473030f116ddee9f6b43ac78ba3',
                    },
                    amount: {
                      before: '0',
                      after:
                        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                    },
                    owner: {
                      kind: 'ACCOUNT',
                      address: '0xa746a2cf6a8ce1572dcab1de7a6f89b28a53b8c6',
                    },
                    asset: {
                      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                      symbol: 'WETH',
                      name: 'Wrapped Ether',
                      decimals: 18,
                      verified: true,
                      lists: [
                        'COINGECKO',
                        'ZERION',
                        'ONE_INCH',
                        'UNISWAP',
                        'MY_CRYPTO_API',
                        'KLEROS_TOKENS',
                      ],
                      imageUrl:
                        'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
                      price: {
                        source: 'Coingecko',
                        updatedAt: 1691096712,
                        dollarValuePerToken: 1846.21,
                      },
                    },
                  },
                },
              },
            ],
          },
          error: null,
          userAccount: '0xb3bde75c925f02c8903240f9e8d4b9297e6aff37',
        },
        perTransaction: [],
      },
    },
    expectedState: {
      balanceChanges: {
        willApprove: [
          {
            asset: {
              address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              imageUrl:
                'https://d1ts37qlq4uz4s.cloudfront.net/evm__evm%3A%3Aethereum__evm%3A%3Aethereum%3A%3Amainnet__0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
              name: 'Wrapped Ether',
              symbol: 'WETH',
              verified: true,
            },
            balance: {
              type: 'NumberUnit',
              unit: 'base',
              unitType: 'WETH',
              value:
                '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            },
            spender: '0x000000000022d473030f116ddee9f6b43ac78ba3',
            unitName: 'WETH',
            isMaxApproval: true,
          },
        ],
      },
    },
  },
]
