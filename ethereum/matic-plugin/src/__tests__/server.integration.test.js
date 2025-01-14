import { runEvmServerTestSuite } from '@exodus/ethereum-api/src/__tests__/server.testsuite.js'

import assetPlugin from '../index.js'

describe(`matic server integration tests`, () => {
  const walletAddress = '0x34eb5DEa17665b790ec7f253b79aDC2289564cbd'
  const contractAddress = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'

  const { server } = runEvmServerTestSuite({ assetPlugin, walletAddress, contractAddress })

  it.skip('returns transaction by hash', async () => {
    const expected = {
      blockHash: '0x5c7637ec13bfc54a91ec33accc04186ebf1763628e065b4b69450db9366916e8',
      blockNumber: '0x38287ff',
      from: '0x82f4fa960b504bdb1e137a8d8c993665f49807d0',
      gas: '0xb99a',
      gasPrice: '0x6fc23ac1b',
      maxFeePerGas: '0x6fc23ac1b',
      maxPriorityFeePerGas: '0x6fc23ac1b',
      hash: '0x6644c4940c6b6b3d3fe2cbdbeb3b58499cb477d0c424c66f931d0823f6812a6f',
      input:
        '0xa9059cbb000000000000000000000000389505f098a29a994a3ed0e674f07cd451dde42c0000000000000000000000000000000000000000000000000000000058575d5e',
      nonce: '0x6',
      to: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      transactionIndex: '0x2d',
      value: '0x0',
      type: '0x2',
      accessList: [],
      chainId: '0x89',
      v: '0x1',
      r: '0x6eaadb442c9ba41b1ce8a23697ff7a9bdca64b924a754e60a551459a075f15d0',
      s: '0x265abcf17e38fad5db28168264555fdb266e66ec691e282c850c9627f2999a76',
      yParity: '0x1',
    }

    // TODO: server seems to only return most recent txs. Querying very old txs results in null response.
    const tx = await server.getTransactionByHash(
      '0x6644c4940c6b6b3d3fe2cbdbeb3b58499cb477d0c424c66f931d0823f6812a6f'
    )

    expect(tx).toEqual(expected)
  })
})
