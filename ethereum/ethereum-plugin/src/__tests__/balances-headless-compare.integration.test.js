import { createTestWallet } from '@exodus/assets-testing'
import { isNumberUnit } from '@exodus/currency'
import {
  decodeCursor,
  encodeCursor,
} from '@exodus/ethereum-api/src/exodus-eth-server/clarity-v2.js'
import { resolveNonce } from '@exodus/ethereum-api/src/tx-send/nonce-utils.js'
import assert from 'minimalistic-assert'

import ethereumMainnetAssetPlugin from '../index.js'

const WAD = BigInt('1000000000000000000')

const stringifyNumberUnitProperties = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      if (!isNumberUnit(v)) return [k, v]
      return [k, v.toBaseString({ unit: true })]
    })
  )

// Compares a wallet tester with the current no history head.
const compareWalletTesterWithNoHistoryHead = async ({
  mockWalletAddress,
  walletTester: { asset, getCurrentBalance, getCurrentNonce },
  noHistoryWalletTester: {
    asset: assetNoHistory,
    getCurrentBalance: getCurrentBalanceNoHistory,
    tick: tickNoHistory,
  },
}) => {
  await tickNoHistory({ refresh: true })

  const [currentBalance, currentNonce, currentBalanceNoHistory, currentNonceNoHistory] =
    await Promise.all([
      getCurrentBalance({ asset }),
      getCurrentNonce(),
      getCurrentBalanceNoHistory({ asset: assetNoHistory }),
      assetNoHistory.server.getTransactionCount(mockWalletAddress),
    ])

  expect(BigInt(currentNonce)).toBe(BigInt(currentNonceNoHistory))

  expect(stringifyNumberUnitProperties(currentBalance)).toStrictEqual(
    stringifyNumberUnitProperties(currentBalanceNoHistory)
  )
}

const createWalletTesterTestApiThunk =
  ({ assetName, mockAccount, mockWalletAddress }) =>
  ({ asset, assetClientInterface }) => {
    const getMockWallet = () => ({
      walletAccount: mockAccount,
      walletAddress: mockWalletAddress,
    })

    const getTxLog = async () => {
      const { walletAccount } = getMockWallet()
      return assetClientInterface.getTxLog({ assetName, walletAccount })
    }

    const getCurrentBalance = async ({ asset }) => {
      const [accountState, txLog] = await Promise.all([
        assetClientInterface.getAccountState({ assetName, walletAccount: mockAccount }),
        getTxLog(),
      ])
      return asset.api.getBalances({ asset, txLog, accountState })
    }

    const getCurrentNonce = async () =>
      resolveNonce({
        forceFromNode: asset.monitorType === 'no-history',
        asset,
        fromAddress: mockWalletAddress,
        txLog: await getTxLog(),
        // HACK: We aren't using pending to match current
        //       behaviour in the app.
        // tag: 'pending',
      })

    const monitor = asset.api.createHistoryMonitor({ asset })
    const tick = async ({ refresh } = {}) => {
      const now = performance.now()
      await monitor.tick({ refresh, walletAccount: mockAccount })
      return performance.now() - now
    }

    const stop = () => {
      if (asset.monitorType.startsWith('clarity')) asset.server.dispose()
      return monitor.stop()
    }

    return {
      getMockWallet,
      getTxLog,
      getCurrentBalance,
      getCurrentNonce,
      tick,
      stop,
    }
  }

const createWalletTester = async ({
  assetPlugin = ethereumMainnetAssetPlugin,
  availableAssetNames = ['ethereum'],
  assetName = 'ethereum',
  mockWalletAddress,
  mockAccount = 'exodus_0',
  assetConfig,
} = {}) => {
  assert(mockWalletAddress, 'expected mock wallet address')
  assert(availableAssetNames.includes(assetName), `${assetName} is not available`)

  const createWalletTesterTestApi = createWalletTesterTestApiThunk({
    assetName,
    availableAssetNames,
    mockAccount,
    mockWalletAddress,
  })

  const walletTesterProps = await createTestWallet({
    assetPlugin,
    assetConfig,
    availableAssetNames,
    assetName,
    mockAddresses: { [mockAccount]: { [assetName]: mockWalletAddress } },
  })

  return { ...walletTesterProps, ...createWalletTesterTestApi(walletTesterProps) }
}

const createMultiServerWalletTesters = async ({
  assetConfig = {},
  ...createWalletTesterProps
} = {}) => {
  const createPropsForWalletTester = ({ monitorType, serverUrl }) => ({
    ...createWalletTesterProps,
    assetConfig: { ...assetConfig, monitorType, serverUrl },
  })

  const walletTesters = await Promise.all([
    createWalletTester(
      createPropsForWalletTester({
        monitorType: 'no-history',
        serverUrl: 'https://mainnet.infura.io/v3/9e5f438066854148a6a32ccfd2390529',
      })
    ),
    createWalletTester(
      createPropsForWalletTester({
        monitorType: 'magnifier',
        serverUrl: 'https://geth.a.exodus.io/wallet/v1/',
      })
    ),
    createWalletTester(
      createPropsForWalletTester({
        monitorType: 'clarity-v2',
        serverUrl: 'https://eth-clarity.a.exodus.io',
      })
    ),
  ])

  const [noHistoryWalletTester, magnifierWalletTester, clarityV2WalletTester] = walletTesters

  const getNoHistoryWalletTester = () => noHistoryWalletTester
  const getMagnifierWalletTester = () => magnifierWalletTester
  const getClarityV2WalletTester = () => clarityV2WalletTester

  return {
    getNoHistoryWalletTester,
    getMagnifierWalletTester,
    getClarityV2WalletTester,
    walletTesters,
  }
}

const expectHead = async ({
  mockWalletAddress,
  compareMagnifier = true,
  compareClarityV2 = true,
  useAbsoluteBalanceAndNonce = false,
  ...createWalletTesterProps
} = {}) => {
  const {
    walletTesters,
    getNoHistoryWalletTester,
    getMagnifierWalletTester,
    getClarityV2WalletTester,
  } = await createMultiServerWalletTesters({
    ...createWalletTesterProps,
    mockWalletAddress,
    assetConfig: { useAbsoluteBalanceAndNonce },
  })

  const noHistoryWalletTester = getNoHistoryWalletTester()
  const magnifierWalletTester = getMagnifierWalletTester()
  const clarityV2WalletTester = getClarityV2WalletTester()

  await noHistoryWalletTester.tick({ refresh: true })

  if (compareMagnifier) {
    await magnifierWalletTester.tick({ refresh: true })
    await compareWalletTesterWithNoHistoryHead({
      mockWalletAddress,
      walletTester: magnifierWalletTester,
      noHistoryWalletTester: getNoHistoryWalletTester(),
    })
  }

  if (compareClarityV2) {
    await clarityV2WalletTester.tick({ refresh: true })
    await compareWalletTesterWithNoHistoryHead({
      mockWalletAddress,
      walletTester: clarityV2WalletTester,
      noHistoryWalletTester: getNoHistoryWalletTester(),
    })
  }

  return Promise.all(walletTesters.map((walletTester) => walletTester.stop()))
}

// Creates a dynamic sequence based upon a user's
// transaction history which can be used to evaluate
// the `TxLog` under different scenarios.
const createMockClarityTransactionHistoryResponseGenerator = async ({
  debug = false,
  mockWalletAddress,
  server,
}) => {
  const { transactions, cursor: endCursor } = await server.getAllTransactions({
    address: mockWalletAddress,
  })
  const { confirmed, pending } = transactions

  // HACK: Assume Clarity does not return `pending` transactions.
  expect(Array.isArray(pending)).toBeTrue()
  expect(pending.length).toBe(0)

  const blockNumbers = [...new Set(confirmed.map((e) => e.blockNumber))]

  // HACK: Just enforce the invariant that we assume transactions to
  //       be sorted in time ascending.
  expect(blockNumbers).toStrictEqual(blockNumbers.sort((a, b) => a - b))

  // HACK: Enforce our assumption that individual transactions per
  //       block are sorted in index ascending.
  for (const blockNumber of blockNumbers) {
    const transactionIndices = confirmed
      .filter((e) => e.blockNumber === blockNumber)
      .map((e) => e.transactionIndex)

    // If there was only a single transaction by the user in
    // this block, then we don't need to be mindful of ordering.
    if (transactionIndices.length <= 1) continue
    expect(transactionIndices).toStrictEqual(transactionIndices.sort((a, b) => a - b))
  }

  // Calculate the final block number cursor as represented by the set.
  const minBlockNumber = Math.min(...blockNumbers)
  const maxBlockNumber = Math.max(...blockNumbers)

  // Defines the virtual block number we're currently emulating.
  // NOTE: We don't start at the `minBlockNumber` since we can
  //       initialize simulation with a blank account history.
  let virtualBlockNumber = 0

  const formatResponseObject = ({ cursorBlockNumber, nextConfirmed }) => ({
    transactions: { confirmed: nextConfirmed, pending: [] },
    // The `cursor` we return should be the next logical offset.
    cursor: encodeCursor(
      BigInt(
        Math.max(
          // HACK: `cursorBlockNumber` must be a `number`.
          Number(cursorBlockNumber),
          ...nextConfirmed.filter((e) => e.blockNumber !== null).map((e) => e.blockNumber)
        )
      )
    ),
  })

  const peek = ({ blockNumber }) => confirmed.filter((e) => e.blockNumber === blockNumber)

  const pendingTransactions = {}

  const setPending = (transactionHash, isPending) => {
    assert(typeof isPending === 'boolean', 'expected pending status')
    return void (pendingTransactions[transactionHash] = Boolean(isPending))
  }

  const gasPriceAttenuationWads = {}

  // Enables us to modify the pricing of an inbound transaction from
  // a third party so that we can emulate dropped/replaced transactions.
  const setGasPriceAttenuationWad = (transactionHash, gasPriceAttenuationWad) => {
    assert(typeof gasPriceAttenuationWad === 'bigint', 'expected gas price attenuation')
    assert(gasPriceAttenuationWad >= BigInt('0') && gasPriceAttenuationWad <= WAD)
    return void (gasPriceAttenuationWads[transactionHash] = gasPriceAttenuationWad)
  }

  return {
    minBlockNumber,
    maxBlockNumber,
    blockNumbers,
    peek,
    setPending,
    setGasPriceAttenuationWad,
    getVirtualBlockNumber: () => virtualBlockNumber,
    setVirtualBlockNumber: (nextVirtualBlockNumber) =>
      (virtualBlockNumber = nextVirtualBlockNumber),
    // TODO: We should modify the `TxLog` using fake transactions.
    getMockClarityTransactionHistoryResponse: ({ cursor }) => {
      const { blockNumber: cursorBlockNumber } = decodeCursor(cursor)

      // For an account with zero transactions,
      // there's nothing to test.
      if (confirmed.length === 0 || cursorBlockNumber > maxBlockNumber) {
        return { transactions: { confirmed: [], pending: [] }, cursor: endCursor }
      }

      const nextConfirmed = confirmed
        .filter(
          // HACK: We fake block inclusion by filering the returned
          //       that don't satisfy the virtual block number.
          (e) => e.blockNumber >= cursorBlockNumber && e.blockNumber <= virtualBlockNumber
        )
        .map(({ hash, ...extras }) => {
          // Callers can arbitrarily mark transactions as pending
          // as a means to experiment with the `TxLog`'s reaction
          // to the supposed contents of the mempool.
          if (!pendingTransactions[hash]) return { ...extras, hash }

          const { gasPrice, gasPriceEffective } = extras

          const gasPriceAttenuationWad = gasPriceAttenuationWads[hash] || WAD

          return {
            ...extras,
            // HACK: Changing the `gasPrice` of a transaction would also
            //       change its hash.
            hash: `${gasPriceAttenuationWad === WAD ? '' : '_'}${hash}`,
            blockNumber: null,
            confirmations: 0,
            // Return the pending transaction with possibly reduced
            // pricing so we can simulate dropped or replaced transactions.
            gasPrice: ((BigInt(gasPrice) * gasPriceAttenuationWad) / WAD).toString(),
            gasPriceEffective: (
              (BigInt(gasPriceEffective) * gasPriceAttenuationWad) /
              WAD
            ).toString(),
          }
        })

      const responseObject = formatResponseObject({ cursorBlockNumber, nextConfirmed })

      if (debug) console.log(JSON.stringify(responseObject))

      // Return the fake response.
      return responseObject
    },
    endCursor,
  }
}

const mockClarityGetAllTransactionsImplementation = (server, implementation) => {
  // This gives us the ability to control the transactions we return
  // from the Clarity server to the monitor.
  jest.spyOn(server, 'getAllTransactions').mockImplementation(implementation)
}

const createClarityMockTesterApi = async ({ debug, mockWalletAddress, assetConfig = {} }) => {
  const serverWalletTesters = await createMultiServerWalletTesters({
    mockWalletAddress,
    assetConfig,
  })

  const clarityV2WalletTester = serverWalletTesters.getClarityV2WalletTester()
  const {
    asset: { server },
  } = clarityV2WalletTester

  const { getMockClarityTransactionHistoryResponse, ...mockClarityTransactionHistoryApi } =
    await createMockClarityTransactionHistoryResponseGenerator({
      debug,
      mockWalletAddress,
      server,
    })

  // This gives us the ability to control the transactions we return
  // from the Clarity server to the monitor.
  mockClarityGetAllTransactionsImplementation(server, getMockClarityTransactionHistoryResponse)

  return { mockWalletAddress, serverWalletTesters, mockClarityTransactionHistoryApi }
}

const clarityFuzzyTransactionTester = async ({
  concurrency = 5,
  debug,
  mockWalletAddress,
  assetConfig = {},
}) => {
  const {
    serverWalletTesters: { getClarityV2WalletTester, getNoHistoryWalletTester },
    mockClarityTransactionHistoryApi: {
      blockNumbers,
      setVirtualBlockNumber,
      peek,
      setPending,
      setGasPriceAttenuationWad,
    },
  } = await createClarityMockTesterApi({
    debug,
    mockWalletAddress,
    assetConfig,
  })

  const { asset, tick } = getClarityV2WalletTester()
  const { server } = asset

  const deferredTicks = []

  // FUZZ: We can simulate multiple parallel requests
  //       to determine tick state.
  const deferTick = () => {
    deferredTicks.push(tick())
    return new Promise((resolve) => setTimeout(resolve, 10))
  }

  const deferTicks = async () => {
    for (let i = 0; i < concurrency + 1; i++) await deferTick()
  }

  for (let i = 0; i < blockNumbers.length; ++i) {
    const blockNumber = blockNumbers[i]
    const maybeNextBlockNumber = blockNumbers[i + 1]

    void setVirtualBlockNumber(blockNumber)

    const txs = peek({ blockNumber })

    // FUZZ: We can simulate transactions being appended to the
    //       `TxLog` without seeing them in the mempool first.
    // NOTE: We cannot perform transaction attenuation when handling
    //       the final block because since we need all transactions to
    //       be settled in order to make a fair comparison with the
    //       head of the chain (otherwise, they'd be assumed to be
    //       included in the next block).
    if (maybeNextBlockNumber && Math.random() > 0.5) {
      // Mark the transactions as pending.
      void txs.forEach(({ hash }) => setPending(hash, true))

      // If the transactions come from a third party, we can
      // also simulate transaction replacement.
      const thirdPartyTxsToAttenuate = txs.filter(
        (e) => e.from.toLowerCase() !== mockWalletAddress.toLowerCase()
      )

      // We'll randomly attenuate transactions from third
      // parties so they can be accelerated.
      void thirdPartyTxsToAttenuate.forEach(({ hash }) =>
        setGasPriceAttenuationWad(hash, BigInt('990000000000000000' /* 0.99 */))
      )

      // Here, we sample from the mempool for pending transactions.
      await deferTicks()

      // Of the attenuated transactions, some we'll increase
      // back to their original pricing whilst still in the
      // mempool.
      void thirdPartyTxsToAttenuate
        .filter(() => Math.random() > 0.5)
        .map(({ hash }) => setGasPriceAttenuationWad(hash, WAD))

      if (thirdPartyTxsToAttenuate.length > 0) await deferTicks()
    }

    // Take the transactions out of pending.
    //
    // NOTE: If `gasPriceAttenuationWad` has been defined for
    //       the `hash` during pending, the real pricing will
    //       be returned here since it only applies to pending
    //       transactions.
    void txs.forEach(({ hash }) => setPending(hash, false))
    await deferTicks()

    // If there's a block in between here, we can randomly mine
    // some unimportant blocks in between.
    if (typeof maybeNextBlockNumber === 'number' && Math.random() > 0.5) {
      const midBlockNumber = Math.floor(maybeNextBlockNumber - blockNumber) + blockNumber

      // If the `midBlockNumber` was not significant, don't
      // attempt to mine an unimportant block in between.
      if (midBlockNumber === blockNumber) continue

      void setVirtualBlockNumber(midBlockNumber)
      await deferTicks()
    }
  }

  await Promise.all(deferredTicks)

  // After the dust has settled, determine whether the `TxLog` is correctly up-to-date.
  await compareWalletTesterWithNoHistoryHead({
    mockWalletAddress,
    walletTester: getClarityV2WalletTester(),
    noHistoryWalletTester: getNoHistoryWalletTester(),
  })

  return server.dispose()
}

describe('balances-headless-compare', () => {
  // NOTE: This condition currently fails because ETH 2.0 staking withdrawals
  //       do not appear to be reflected.
  // it.skip('expectHead:0x1E1f29249c21BAa5992d6181cF0e9bc47d91D01C', () =>
  //   expectHead({
  //     mockWalletAddress: '0x1E1f29249c21BAa5992d6181cF0e9bc47d91D01C',
  //     compareMagnifier: false,
  //     compareClarityV2: false,
  //   }))
  it.skip('expectHead:0x312e71162Df834A87a2684d30562b94816b0f072', () =>
    expectHead({ mockWalletAddress: '0x312e71162Df834A87a2684d30562b94816b0f072' }))
  it.skip('expectHead:useAbsoluteBalanceAndNonce:0x312e71162Df834A87a2684d30562b94816b0f072', () =>
    expectHead({
      mockWalletAddress: '0x312e71162Df834A87a2684d30562b94816b0f072',
      useAbsoluteBalanceAndNonce: true,
    }))
  it.skip('expectHead:0xd791b586d4c9904249ad3c1abfaa933db06229c3', () =>
    expectHead({ mockWalletAddress: '0xd791b586d4c9904249ad3c1abfaa933db06229c3' }))
  it.skip('expectHead:useAbsoluteBalanceAndNonce:0xd791b586d4c9904249ad3c1abfaa933db06229c3', () =>
    expectHead({
      mockWalletAddress: '0xd791b586d4c9904249ad3c1abfaa933db06229c3',
      useAbsoluteBalanceAndNonce: true,
    }))
  it.skip('expectHead:0x3861749908400A4F5ec0fe4Da7926dc89F66F3Ee', () =>
    expectHead({ mockWalletAddress: '0x3861749908400A4F5ec0fe4Da7926dc89F66F3Ee' }))
  it.skip('clarityMockTesterApi', async () => {
    const {
      mockWalletAddress,
      serverWalletTesters: { getClarityV2WalletTester, getNoHistoryWalletTester },
      mockClarityTransactionHistoryApi: {
        setVirtualBlockNumber,
        getVirtualBlockNumber,
        maxBlockNumber,
        minBlockNumber,
      },
    } = await createClarityMockTesterApi({
      mockWalletAddress: '0x18c4f1e0c20f5014d6eeec158202bfed8004a960',
    })

    const { asset, tick, getTxLog } = getClarityV2WalletTester()
    const { server } = asset

    expect(getVirtualBlockNumber()).toBe(0)
    expect(minBlockNumber).toBe(22_483_349)
    expect(maxBlockNumber).toBeGreaterThan(minBlockNumber)

    await tick({ refresh: true })
    expect([...(await getTxLog())].length).toBe(0)

    void setVirtualBlockNumber(minBlockNumber)
    expect(getVirtualBlockNumber()).toBe(minBlockNumber)

    await tick({ refresh: true })
    expect([...(await getTxLog())].length).toBe(1)

    void setVirtualBlockNumber(maxBlockNumber)
    await tick({ refresh: true })

    await compareWalletTesterWithNoHistoryHead({
      mockWalletAddress,
      walletTester: getClarityV2WalletTester(),
      noHistoryWalletTester: getNoHistoryWalletTester(),
    })

    return server.dispose()
  })
  it.skip('clarityFuzzyTransactionTester:0x312e71162df834a87a2684d30562b94816b0f072', () =>
    clarityFuzzyTransactionTester({
      mockWalletAddress: '0x312e71162df834a87a2684d30562b94816b0f072',
    }))
  it.skip('clarityFuzzyTransactionTester:0x5dd73e0a028bf8c40eebedebf6e67ca8c601d2fe', () =>
    clarityFuzzyTransactionTester({
      mockWalletAddress: '0x5dd73e0a028bf8c40eebedebf6e67ca8c601d2fe',
    }))
  it.skip('clarityFuzzyTransactionTester:0x18c4f1e0c20f5014d6eeec158202bfed8004a960', () =>
    clarityFuzzyTransactionTester({
      mockWalletAddress: '0x18c4f1e0c20f5014d6eeec158202bfed8004a960',
    }))
  it.skip('clarityFuzzyTransactionTester:0x167550B70d871Ea17116B69ae5c2b00e570B5f1f', () =>
    clarityFuzzyTransactionTester({
      mockWalletAddress: '0x167550B70d871Ea17116B69ae5c2b00e570B5f1f',
    }))
  it.skip('clarityFuzzyTransactionTester:0xd791b586d4c9904249AD3C1aBFaA933DB06229c3', () =>
    clarityFuzzyTransactionTester({
      mockWalletAddress: '0xd791b586d4c9904249AD3C1aBFaA933DB06229c3',
    }))
})
