import { asset, tokens } from '@exodus/ethereum-meta'
import { TxSet } from '@exodus/models'
import lodash from 'lodash'

import {
  fixBalance,
  getBalanceFromTxLog,
  getBalancesFromAccountStateFactory,
  getUnconfirmedReceivedBalance,
  getUnconfirmedSentBalance,
} from '../balances-utils.js'

const { mapValues } = lodash

const token = tokens.find((token) => token.name === 'aave')
const assets = { ethereum: asset, aave: token }

token.baseAsset = asset
asset.baseAsset = asset

const createTxSet = ({ txs }) => TxSet.fromArray(txs)

const ethTxsWithConfirmed = [
  {
    confirmations: 1,
    date: '2022-04-05T20:39:32.000Z',
    error: null,
    txId: '0xa1f9837b6c8cb55ad5b321a94357c1c1860c35916737532c6ea9b644fd172985',
    dropped: false,
    coinAmount: { value: '0.05', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' },
    coinName: 'ethereum',
    data: { data: '0x', nonce: 1_649_534, gasLimit: 63_000 },
    from: ['0xc098b2a3aa256d2140208c3de6543aaef5cd3a94'],
    selfSend: false,
    tokens: [],
    currencies: { ethereum: assets.ethereum.currency },
  },
  {
    confirmations: 1,
    date: '2022-04-06T16:25:22.000Z',
    error: null,
    txId: '0xa2c35470993c37547988f44f92d4e12d6a301293223a4daf19a0e68822eddbef',
    dropped: false,
    coinAmount: { value: '0.02', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' },
    coinName: 'ethereum',
    data: { data: '0x', nonce: 1_844_292, gasLimit: 21_000 },
    from: ['0x59a5208b32e627891c389ebafc644145224006e8'],
    selfSend: false,
    tokens: [],
    currencies: { ethereum: assets.ethereum.currency },
  },
  {
    confirmations: 1,
    date: '2022-04-13T13:50:09.000Z',
    error: null,
    feeAmount: {
      value: '0.0001',
      unit: 'ETH',
      unitType: 'ETH',
      type: 'NumberUnit',
    },
    feeCoinName: 'ethereum',
    txId: '0x4b0b523bb0eca3e2e983f49d2aa33ae297c9402d9fcdcd4816ed20bea067db2c',
    dropped: false,
    coinAmount: { value: '-0.01', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' },
    coinName: 'ethereum',
    data: {
      data: '0xa9059cbb000000000000000000000000fa56417d077a41a20aa190a8fcd841ebefa2859e0000000000000000000000000000000000000000000000000000000000712284',
      nonce: 0,
      gasLimit: 70_000,
    },
    from: [],
    to: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    selfSend: false,
    tokens: ['tetherusd'],
    currencies: { ethereum: assets.ethereum.currency },
  },
]

const ethTxsWithUnconfirmed = [
  {
    confirmations: 1, // confirmed received
    date: '2022-04-05T20:39:32.000Z',
    error: null,
    txId: '0xa1f9837b6c8cb55ad5b321a94357c1c1860c35916737532c6ea9b644fd172985',
    dropped: false,
    coinAmount: { value: '0.03', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' },
    coinName: 'ethereum',
    data: { data: '0x', nonce: 1_649_534, gasLimit: 63_000 },
    from: ['0xc098b2a3aa256d2140208c3de6543aaef5cd3a94'],
    selfSend: false,
    tokens: [],
    currencies: { ethereum: assets.ethereum.currency },
  },
  {
    confirmations: 0, // unconfirmed recieved
    date: '2022-04-06T16:25:22.000Z',
    error: null,
    txId: '0xa2c35470993c37547988f44f92d4e12d6a301293223a4daf19a0e68822eddbef',
    dropped: false,
    coinAmount: { value: '0.05', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' },
    coinName: 'ethereum',
    data: { data: '0x', nonce: 1_844_292, gasLimit: 21_000 },
    from: ['0x59a5208b32e627891c389ebafc644145224006e8'],
    selfSend: false,
    tokens: [],
    currencies: { ethereum: assets.ethereum.currency },
  },
  {
    confirmations: 0, // unconfirmed sent
    date: '2022-04-13T13:50:09.000Z',
    error: null,
    feeAmount: {
      value: '0.00001',
      unit: 'ETH',
      unitType: 'ETH',
      type: 'NumberUnit',
    },
    feeCoinName: 'ethereum',
    txId: '0x4b0b523bb0eca3e2e983f49d2aa33ae297c9402d9fcdcd4816ed20bea067db2c',
    dropped: false,
    coinAmount: { value: '-0.02', unit: 'ETH', unitType: 'ETH', type: 'NumberUnit' }, // sent!!
    coinName: 'ethereum',
    data: {
      data: '0xa9059cbb000000000000000000000000fa56417d077a41a20aa190a8fcd841ebefa2859e0000000000000000000000000000000000000000000000000000000000712284',
      nonce: 0,
      gasLimit: 70_000,
    },
    from: [],
    selfSend: false,
    currencies: { ethereum: assets.ethereum.currency },
  },
]

describe('balance-utils', () => {
  it('txs logs helpers functions when confirmed txs', async () => {
    const txLog = createTxSet({ txs: ethTxsWithConfirmed })
    expect(getBalanceFromTxLog({ asset, txLog }).toDefaultString({ unit: true })).toEqual(
      '0.0599 ETH'
    )

    expect(getUnconfirmedReceivedBalance({ asset, txLog }).toDefaultString({ unit: true })).toEqual(
      '0 ETH'
    )

    expect(getUnconfirmedSentBalance({ asset, txLog }).toDefaultString({ unit: true })).toEqual(
      '0 ETH'
    )
  })

  it('txs log helpers when some unconfirmed txs', async () => {
    const txLog = createTxSet({ txs: ethTxsWithUnconfirmed })

    const balance = getBalanceFromTxLog({ asset, txLog })
    expect(balance.toDefaultString({ unit: true })).toEqual('0.05999 ETH')

    expect(getUnconfirmedReceivedBalance({ asset, txLog }).toDefaultString({ unit: true })).toEqual(
      '0.05 ETH'
    )

    expect(getUnconfirmedSentBalance({ asset, txLog }).toDefaultString({ unit: true })).toEqual(
      '0.02001 ETH'
    )
    expect(fixBalance({ txLog, balance }).toDefaultString({ unit: true })).toEqual('0.03998 ETH')
  })

  it('getBalancesFromAccountStateFactory when some unconfirmed txs', async () => {
    const txLog = createTxSet({ txs: ethTxsWithUnconfirmed })

    const accountState = {
      balance: assets.ethereum.currency.parse('1 ETH'),
      tokenBalances: { aave: assets.aave.currency.defaultUnit(2) },
    }

    const getBalances = getBalancesFromAccountStateFactory({
      shouldFixBalance: true,
      getFrozenBalances: ({ asset }) => {
        if (asset.name === 'ethereum') {
          return { networkReserve: assets.ethereum.currency.parse('0.0001 ETH') }
        }
      },
      getOtherBalances: ({ asset }) => {
        if (asset.name === 'ethereum') {
          return { reward: assets.ethereum.currency.parse('0.0002 ETH') }
        }
      },
    })

    expect(
      mapValues(getBalances({ asset: assets.ethereum, accountState, txLog }), (value) =>
        value.toDefaultString({ unit: true })
      )
    ).toEqual({
      frozen: '0.0001 ETH',
      networkReserve: '0.0001 ETH',
      reward: '0.0002 ETH',
      spendable: '0.92989 ETH',
      total: '0.97999 ETH',
      unconfirmedReceived: '0.05 ETH',
      unconfirmedSent: '0.02001 ETH',
    })

    expect(
      mapValues(
        getBalances({ asset: assets.aave, accountState, txLog: createTxSet({ txs: [] }) }),
        (value) => value.toDefaultString({ unit: true })
      )
    ).toEqual({
      frozen: '0 AAVE',
      spendable: '2 AAVE',
      total: '2 AAVE',
      unconfirmedReceived: '0 AAVE',
      unconfirmedSent: '0 AAVE',
    })
  })
})
