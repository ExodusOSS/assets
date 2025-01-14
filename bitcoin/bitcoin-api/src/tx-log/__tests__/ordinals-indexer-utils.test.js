import { asset } from '@exodus/bitcoin-meta'

import { indexOrdinalUnconfirmedTx, indexOutputs } from '../ordinals-indexer-utils.js'

const mockedTxs = [
  {
    fees: 0.000_042_24,
    txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    time: 1_703_623_099,
    blockheight: -1,
    confirmations: 0,
    vsize: 234,
    inscriptionsIndexed: null,
    vin: [
      {
        txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
        vout: 0,
        value: '0.00000546',
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
      },
      {
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        vout: 1,
        value: '0.00013094',
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
      },
    ],
    vout: [
      {
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
  },

  {
    fees: 0.000_042_22,
    txid: 'CCCCC7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    blockheight: -1,
    confirmations: 0,
    vsize: 234,
    inscriptionsIndexed: null,
    vin: [
      {
        txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
        vout: 0,
        value: '0.00000546',
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
      },
      {
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        vout: 1,
        value: '0.00013094',
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
      },
    ],
    vout: [
      {
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
  },

  {
    fees: 0.000_012_96,
    txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
    time: 1_697_801_840,
    blockheight: 813_032,
    confirmations: 10_301,
    vsize: 144,
    inscriptionsIndexed: true,
    vin: [
      {
        txid: '2ab580fd3263e5a2d75095f0e65f48a6778c9c4fa2436c29605c552bdb86b93e',
        vout: 0,
        value: '0.00001842',
        addr: 'bc1p020uqvktsprmr5rr6d4sah0yj50qf0y9d228utkyqfx5gdfgjs0s2j63x2',
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
      },
    ],
    vout: [
      {
        n: 0,
        scriptPubKey: {
          addresses: ['bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw'],
          hex: '51203903835c81a806d5a935e78a877007146e61c8daf208816063661025f7c6f7e6',
        },
        spentTxId: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
        spentIndex: 0,
        value: '0.00000546',
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
      },
    ],
  },
  {
    fees: 0.000_216_22,
    txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
    time: 1_702_335_067,
    blockheight: 820_767,
    confirmations: 2566,
    rbf: true,
    vsize: 166,
    inscriptionsIndexed: true,
    vin: [
      {
        txid: 'e44e04e1bfffc6637358809c6dd485ec3092353a1da914d2eef51efe83c906e1',
        vout: 1,
        value: '0.00045716',
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
      },
    ],
    vout: [
      {
        n: 0,
        scriptPubKey: {
          addresses: ['38tzr8Z8dH3mXHLL6hCaaZ8zknuDKNuzmo'],
          hex: 'a9144f0cf94862a3fc5fe09844f95a1ffc2f1f02dc6187',
        },
        spentTxId: '5e8f2579691906fe2cbc143f4c858465ec04f2cb2f46998b2872f405271bdccc',
        spentIndex: 2,
        value: '0.00011000',
      },
      {
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        spentTxId: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
        spentIndex: 1,
        value: '0.00013094',
      },
    ],
  },
]

test('loadAndIndexUnconfirmedTx 1 level', async () => {
  const insightClient = {
    fetchTxObject: (txid) => {
      return mockedTxs.find((tx) => tx.txid === txid)
    },
  }
  const txid = '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed'
  const rawTx = await insightClient.fetchTxObject(txid)
  const tx = await indexOrdinalUnconfirmedTx({ insightClient, currency: asset.currency, tx: rawTx })
  expect(tx).toEqual({
    blockheight: -1,
    confirmations: 0,
    fees: 0.000_042_24,
    inscriptionsIndexed: null,
    inscriptionsMemoryIndexed: true,
    time: expect.any(Number),
    txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    vin: [
      {
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
        value: '0.00000546',
        vout: 0,
      },
      {
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        value: '0.00013094',
        vout: 1,
      },
    ],
    vout: [
      {
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        inscriptions: [],
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
    vsize: 234,
  })

  const rawTxAsConfirmed = { ...rawTx, confirmations: 1, blockheight: 813_132 }
  const newTx = await indexOrdinalUnconfirmedTx({
    insightClient,
    currency: asset.currency,
    tx: rawTxAsConfirmed,
  })

  expect(newTx).toEqual({
    blockheight: 813_132,
    confirmations: 1,
    fees: 0.000_042_24,
    inscriptionsIndexed: null,
    inscriptionsMemoryIndexed: true,
    time: expect.any(Number),
    txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    vin: [
      {
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
        value: '0.00000546',
        vout: 0,
      },
      {
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        value: '0.00013094',
        vout: 1,
      },
    ],
    vout: [
      {
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        inscriptions: [],
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
    vsize: 234,
  })
})

test('loadAndIndexUnconfirmedTx 2 levels', async () => {
  const insightClient = {
    fetchTxObject: (txid) => {
      return mockedTxs.find((tx) => tx.txid === txid)
    },
  }
  const txid = 'CCCCC7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed'
  const rawTx = await insightClient.fetchTxObject(txid)
  const tx = await indexOrdinalUnconfirmedTx({ insightClient, currency: asset.currency, tx: rawTx })
  expect(tx).toEqual({
    fees: 0.000_042_22,
    blockheight: -1,
    confirmations: 0,
    inscriptionsIndexed: null,
    inscriptionsMemoryIndexed: true,
    txid: 'CCCCC7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    vin: [
      {
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
        value: '0.00000546',
        vout: 0,
      },
      {
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        value: '0.00013094',
        vout: 1,
      },
    ],
    vout: [
      {
        inscriptions: [
          {
            inscriptionId: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
        ],
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        inscriptions: [],
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
    vsize: 234,
  })
})
test('index tx with inputs', () => {
  const tx = {
    fees: 0.000_042_24,
    txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    time: 1_703_400_870,
    blockheight: -1,
    confirmations: 0,
    vsize: 234,
    inscriptionsIndexed: null,
    vin: [
      {
        txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
        vout: 0,
        value: '0.00000546',
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
        inscriptions: [
          {
            inscriptionId: '11142392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
          {
            inscriptionId: '22242392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 545,
          },
        ],
      },
      {
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        vout: 1,
        value: '0.00013094',
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
        inscriptions: [
          {
            inscriptionId: '33342392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 100,
          },
          {
            inscriptionId: '44442392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 13_090, // burnt in fees
          },
        ],
      },
    ],
    vout: [
      {
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
  }

  const indexedTx = indexOutputs({ tx, currency: asset.currency })

  expect(indexedTx).toEqual({
    blockheight: -1,
    confirmations: 0,
    fees: 0.000_042_24,
    inscriptionsIndexed: null,
    inscriptionsMemoryIndexed: true,
    time: 1_703_400_870,
    txid: '2c3bd7af103e4a5807ec9e3de1e2ae87b5bf3922850dd5c6e8d4c3e5758cf5ed',
    vin: [
      {
        addr: 'bc1p8ypcxhyp4qrdt2f4u79gwuq8z3hxrjx67gygzcrrvcgzta7x7lnqnpwjkw',
        inscriptions: [
          {
            inscriptionId: '11142392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
          {
            inscriptionId: '22242392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 545,
          },
        ],
        txid: 'de642392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870b',
        value: '0.00000546',
        vout: 0,
      },
      {
        addr: '3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS',
        inscriptions: [
          {
            inscriptionId: '33342392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 100,
          },
          {
            inscriptionId: '44442392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 13_090,
          },
        ],
        txid: 'e0f222b2ba44465d67afaa873900d65029339a0a8fb64639cb6c9c76d76627f9',
        value: '0.00013094',
        vout: 1,
      },
    ],
    vout: [
      {
        inscriptions: [
          {
            inscriptionId: '11142392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 0,
          },
          {
            inscriptionId: '22242392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 545,
          },
        ],
        n: 0,
        scriptPubKey: {
          addresses: ['bc1pc4t9njxfhgwmg9656hqsmu63767cs9m0cmqvt2dfkl80t0anxmfsgq0cxd'],
          hex: '5120c55659c8c9ba1db41754d5c10df351f6bd88176fc6c0c5a9a9b7cef5bfb336d3',
        },
        value: '0.00000546',
      },
      {
        inscriptions: [
          {
            inscriptionId: '33342392926b626a1fd1502fb0e34795669eb9899a30cd3096aa78a456d0870bi0',
            offset: 100,
          },
        ],
        n: 1,
        scriptPubKey: {
          addresses: ['3LzwgNsAfP11DKpMsaTAg7xquHfZPFQBFS'],
          hex: 'a914d3ce55940d3e133b53d31ec0e0046d60c35f4e4587',
        },
        value: '0.00008870',
      },
    ],
    vsize: 234,
  })
})
