import {
  createFeeData,
  generateKeyPair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SolanaWeb3Transaction as Transaction,
  SystemProgram,
  Token,
  TOKEN_PROGRAM_ID,
  U64,
} from '@exodus/solana-lib'
import { asset as solana, tokens } from '@exodus/solana-meta'
import { VersionedMessage } from '@exodus/solana-web3.js'
import lodash from 'lodash'

import { Api } from '../index.js'
import assets from './assets.js'
import { SOL_TRANSFER_TX } from './fixtures.js'

const SECONDS = 1000
jest.setTimeout(60 * SECONDS)

const ADDRESS_WITH_HISTORY = 'Cd1uLoQwGZiDSyJxrwbpYmuDZM2tDftkowPjWv5YE5Z7'
const ADDRESS_FRESH = '9zbRGLG5hqY8wbUmyg17cgV5JvWgEb7B8Z1UFwqKJoRH' // no txs history
const TXID =
  '4AwqVmXFzciF89JyzMrTr5FT2tX1iMg7ypzCzUsGMD54dwjrE8w4GLNTbXXRpNcE8JkTSGRbZ8SzEc5umQJNFS3m'
const SRM_TOKEN_TXID =
  '2zJ7dnXMZYUhw4uaeLaBRcoDsgfM9HZ1GSbfjJp4SxWrFhzEdwNKFfFFJ8LL6ckKwh5Xg5ik5pUuRtjMkGMDZpgV'

const serum = tokens.find((token) => token.name === 'serum')
const catwifhat = tokens.find((token) => token.name === '7atg_solana_3506aeb0') // token-2022

const feeData = createFeeData({ asset: solana })

let api
beforeEach(async () => {
  api = new Api({ assets })
  await api.watchAddress({ address: ADDRESS_WITH_HISTORY, onMessage: jest.fn() }) // Open WS connection
})

afterEach(async () => {
  await api.unwatchAddress({ address: ADDRESS_WITH_HISTORY }) // Close WS connection
})

test('Solana: getRecentBlockHash', async () => {
  const blockHash = await api.getRecentBlockHash()
  expect(typeof blockHash).toEqual('string')
  expect(blockHash.length > 40).toEqual(true)
})

test('Solana: getTransactionById', async () => {
  const result = await api.getTransactionById(TXID)
  expect(result.transaction.signatures[0]).toEqual(TXID) // string
  expect(result.meta.fee > 0).toEqual(true)
  expect(Array.isArray(result.meta.preBalances)).toEqual(true)
  expect(Array.isArray(result.meta.postBalances)).toEqual(true)
  expect(result.transaction.message.accountKeys.length > 1).toEqual(true)
  expect(result.transaction.message.accountKeys[0].pubkey).toEqual(
    'Bnjx2F242ZK6LsKbAvRwDoeKczJTK8LFM918p8sZCb69'
  )
})

test('Solana: ownerChanged', async () => {
  // check owner program
  const changed = await api.ownerChanged('ByJhT9qkRR6ycbgvwokZG1gifpUyVQ6jXQ6edpwKuzD1') // on this address the owner was changed on purpose
  expect(changed).toEqual(true)
  // address purged (for inactivity)
  const purged = await api.ownerChanged(ADDRESS_WITH_HISTORY)
  expect(purged).toEqual(false)
  // regular active address
  const notChanged = await api.ownerChanged('atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3')
  expect(notChanged).toEqual(false)
})

test('Solana: getFeeForMessage VersionedMessage', async () => {
  const encodedMessage =
    'gAEAAQJJxHzprZ3lsoljx5kIwcKQNuleDp42yIKvsej9ml83BwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhs8eaK4yTSLzrL0/7QmEYSLmd3ThYxxtkieE0aZ/AIwBAQIAAAwCAAAA6AMAAAAAAAAA'
  const message = VersionedMessage.deserialize(Buffer.from(encodedMessage, 'base64'))

  const fee = await api.getFeeForMessage(message)
  expect(fee).toEqual(null)
})

test('Solana: getBalance', async () => {
  const [balance1, balance2] = await Promise.all([
    api.getBalance(ADDRESS_WITH_HISTORY),
    api.getBalance(ADDRESS_FRESH),
  ])
  expect(typeof balance1 === 'number').toEqual(true)
  expect(typeof balance2 === 'number').toEqual(true)
  expect(balance2).toEqual(0)
})

test('Solana: getBlockTime', async () => {
  const ts = await api.getBlockTime(49_901_505)
  expect(ts) // if null the backend started pruning old tx entries and has partial ledger!
})

test('Solana: getSignaturesForAddress', async () => {
  const addrTxs = await api.getSignaturesForAddress(ADDRESS_WITH_HISTORY)
  expect(addrTxs.length > 4)
  const addrTxs2 = await api.getSignaturesForAddress(ADDRESS_WITH_HISTORY, { until: '' })
  expect(addrTxs2.length > 4).toEqual(true)
})

test('Solana: waitForTransactionStatus', async () => {
  const tx1 = await api.waitForTransactionStatus(
    '4EtKvyEEncc8sM8NWa2adVBULZ5rYLhprqGyviCr95ym63N5ufgu9dJpeUdjYRGdztkicFdEqRheckbJEorLSp8S'
  )
  expect(tx1).toEqual(true)
})

describe('getTransactions', () => {
  test('Solana: Returns empty transactions if account is not created', async () => {
    const { transactions } = await api.getTransactions(ADDRESS_FRESH)
    expect(transactions.length === 0).toBeTruthy()
  })

  test('Solana: Returns correct transactions if account is created', async () => {
    const { transactions, newCursor } = await api.getTransactions(ADDRESS_WITH_HISTORY)
    expect(transactions.length > 0).toBeTruthy()
    expect(typeof newCursor).toEqual('string')
    // check tokens txs returned as well
    const tokenTx = transactions.find(({ id }) => id === SRM_TOKEN_TXID)
    // console.log('tokenTx:', tokenTx)
    expect(tokenTx.timestamp).toEqual(1_608_598_478_000)
    expect(tokenTx.id).toEqual(SRM_TOKEN_TXID)
    expect(tokenTx.token.tokenName).toEqual('serum')
    expect(tokenTx.owner).toEqual(null)
    expect(tokenTx.from).toEqual('71GbXnJkHz15kzjagB2f7N9H7HPA99v6BFuqfdYL5qtf')
    expect(tokenTx.amount).toEqual(1000)
    expect(tokenTx.fee).toEqual(0)
  })

  test('Solana: Returns expected transactions with cursor', async () => {
    const OLD_TXID =
      '3qFUz73ZPiexM8yHyTFhnEhXgVinzXCQMieJbTsfZKcW5V3vPSJJvRCSKjCHJDYtWqReeBrFV98hcCFaAznpjgUC' // existing old txid that should not be returned in txs history after cursor date.
    const { transactions } = await api.getTransactions(ADDRESS_WITH_HISTORY, {
      cursor:
        '4kzJjAbaT1PVSuk7JDh6697Y63MrGGMwDgi8CKRtctHbXWRjPtrzY1RnbMuedPDefru2hrGeLfRDpqtdFmQQAMXm',
    })
    expect(transactions.length > 0).toBeTruthy()
    expect(lodash.find(transactions, { id: OLD_TXID })).toBeFalsy()
    expect(
      lodash.find(transactions, {
        id: '3V7eDr5BbgZfgiADpUxM2fHQ1ZAoJHddxxfFRd8KtDQeTqLsv9wkfeg6NrVHzQc7wnEmVRQPdsYBT3RKLztL6Suf',
      })
    ).toBeTruthy()
  })
})

test('Solana: parseTransaction on a SOL tx', async () => {
  const owner = 'Bnjx2F242ZK6LsKbAvRwDoeKczJTK8LFM918p8sZCb69'
  const tokenAccountsByOwner = await api.getTokenAccountsByOwner(owner)

  const tx = await api.parseTransaction(owner, SOL_TRANSFER_TX, tokenAccountsByOwner)
  // console.log(tx)
  expect(tx.id).toEqual(
    '4AwqVmXFzciF89JyzMrTr5FT2tX1iMg7ypzCzUsGMD54dwjrE8w4GLNTbXXRpNcE8JkTSGRbZ8SzEc5umQJNFS3m'
  )
  expect(tx.slot).toEqual(36_446_581)
  expect(tx.error).toEqual(false)
  expect(tx.from).toEqual('Bnjx2F242ZK6LsKbAvRwDoeKczJTK8LFM918p8sZCb69')
  expect(tx.to).toEqual('84HuMpN8JPy9DLerT5nRcEHjkb1UQS3TD4CvR9y8MqgD')
  expect(tx.amount).toEqual(2e13)
  expect(tx.fee).toEqual(5e3)
})

test('Solana: getMinimumBalanceForRentExemption', async () => {
  const minimumBalance = await api.getMinimumBalanceForRentExemption(80)
  expect(typeof minimumBalance === 'number').toEqual(true)
})

test('Solana: getRentExemptionMinAmount', async () => {
  // for 0 SOL address (with history, still 0)
  const minimumBalance = await api.getRentExemptionMinAmount(ADDRESS_WITH_HISTORY)
  expect(minimumBalance > 0).toBeTruthy()
  // for new address
  const minimumBalance2 = await api.getRentExemptionMinAmount(
    '9FtqHbSavgHYbyhgLHCAA7nDHkfisxyRU6ucPwAR25BY'
  )
  expect(minimumBalance2 > 0).toBeTruthy()
  // for address with SOL balance
  const minimumBalance3 = await api.getRentExemptionMinAmount(
    '7jq3r3idMRhEvPkRo56TiHLWREMgZQgHWhvPfS3kzgJF'
  )
  expect(minimumBalance3).toEqual(0)
})

test('Solana: getMetaplexMetadata', async () => {
  const MANGO_SPL_TOKEN = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'

  const metadata = await api.getMetaplexMetadata(MANGO_SPL_TOKEN)
  // console.log('metadata', metadata)
  expect(metadata.name).toEqual('Mango')
  expect(metadata.symbol).toEqual('MNGO')
})

test('Solana: getMetaplexMetadata of invalid address returns null', async () => {
  const RANDOM_SPL_TOKEN = 'Dhg9XnzJWzSQqH2aAnhPTEJHGQAkALDfD98MA499A7pa' // doesn't have metaplex data

  const metadata = await api.getMetaplexMetadata(RANDOM_SPL_TOKEN)
  expect(metadata).toEqual(null)
})

test('Solana: broadcastTransaction', async () => {
  const signedTx =
    'AVXo5X7UNzpuOmYzkZ+fqHDGiRLTSMlWlUCcZKzEV5CIKlrdvZa3/2GrJJfPrXgZqJbYDaGiOnP99tI/sRJfiwwBAAEDRQ/n5E5CLbMbHanUG3+iVvBAWZu0WFM6NoB5xfybQ7kNwwgfIhv6odn2qTUu/gOisDtaeCW1qlwW/gx3ccr/4wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAvsInicc+E3IZzLqeA+iM5cn9kSaeFzOuClz1Z2kZQy0BAgIAAQwCAAAAAPIFKgEAAAA='
  let errorMessage = null

  try {
    await api.broadcastTransaction(signedTx, { skipPreflight: false })
  } catch (error) {
    errorMessage = error.message
  }

  // the errorMessage could be null when the retry is successful
  if (errorMessage) {
    expect(errorMessage).toMatch('Blockhash not found')
  }
})

describe('Solana: getDecimals', () => {
  test('returns decimals if valid SPL address', async () => {
    const decimals = await api.getDecimals('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') // USDC
    expect(decimals).toEqual(6)
  })

  test('Solana: getDecimals: errors if invalid SPL address', async () => {
    try {
      await api.getDecimals('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1w')
      expect('To Fail').toEqual(true)
    } catch (err) {
      expect(err.message.match(/could not find account/)).toBeTruthy()
    }

    try {
      await api.getDecimals('EPjFWdd5ZwTDt1')
      expect('To Fail').toEqual(true)
    } catch (err) {
      expect(err.message.match(/WrongSize/)).toBeTruthy()
    }
  })
})

describe('Solana: getAccountInfo', () => {
  test('returns parsed data', async () => {
    const value = await api.getAccountInfo('Dy3vP1oawqr3KuvUUWp443Q2rBWxgvet9GfDJthYEeGJ')
    expect(typeof value?.data?.parsed === 'object').toBeTruthy()
  })

  test('returns base64 data', async () => {
    const value = await api.getAccountInfo('Dy3vP1oawqr3KuvUUWp443Q2rBWxgvet9GfDJthYEeGJ', 'base64')
    expect(Array.isArray(value.data)).toBeTruthy()
    expect(Buffer.from(value.data[0], 'base64').length).toEqual(200)
  })
})

describe('Solana: isSpl', () => {
  test('returns true for addresses owned by the Token Program', async () => {
    expect(await api.isSpl('BmxZ1pghpcoyT7aykj7D1o4AxWirTqvD7zD2tNngjirT')).toBeTruthy()
    expect(await api.isSpl('buMnhMd5xSyXBssTQo15jouu8VhuEZJCfbtBUZgRcuW')).toBeTruthy()
    expect(await api.isSpl('MAPS41MDahZ9QdKXhVa4dWB9RuyfV4XqhyAZ8XcYepb')).toBeTruthy()
  })

  test('returns false for addresses not owned by the Token Program', async () => {
    expect(await api.isSpl('9zyPU1mjgzaVyQsYwKJJ7AhVz5bgx5uc1NPABvAcUXsT')).toBeFalsy()
  })
})

test('Solana: getTokenFeeBasisPoints', async () => {
  const { feeBasisPoints, maximumFee } = await api.getTokenFeeBasisPoints(catwifhat.mintAddress)
  expect(feeBasisPoints).toEqual(400)
  expect(maximumFee).toEqual(99_999_999_999_999_900)
  // regular tokens have no token feess
  const { feeBasisPoints: serumFeeBasisPoints, maximumFee: serumMaximumFee } =
    await api.getTokenFeeBasisPoints(serum.mintAddress)
  expect(serumFeeBasisPoints).toEqual(0)
  expect(serumMaximumFee).toEqual(0)
})

describe('Solana: simulateAndRetrieveSideEffects', () => {
  const ownerSolAccount = new PublicKey('3b1rT3knyRnZHKHCCxKWnJDWo8k6SDdSTvYzqyXUYwxL') // 1 SOL
  const ownerTokenAddress = new PublicKey('FRaWiAGc3bvQKAkqqAxwmLvCVH7AaUGo6MrBUYhCmojK') // 0 Wrapped SOL (Token)

  const secondarySolAccount = new PublicKey('41TDiDgCLz2eh5vPMhWCdNeaoMfrs3tM4rGdZgX4jL56') // 1 SOL
  const secondaryTokenAddress = new PublicKey('8HPbjj4QVnYGUcRrfeZ3XdMhq36RnaJqvUHjHZYZ2p65') // 1 Wrapped SOL (Token)

  // Use solana devnet since we need actual accounts with available balance for simulation
  const testApi = new Api({ rpcUrl: 'https://api.devnet.solana.com', assets })

  test('returns willSend and willReceive account changes', async () => {
    const SOL_SEND_AMOUNT = LAMPORTS_PER_SOL * 0.1
    const TOKEN_SEND_AMOUNT = LAMPORTS_PER_SOL * 0.531

    const txFee = feeData.fee.toBaseNumber()
    const transaction = new Transaction()
    // Owner sends SOL
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: ownerSolAccount,
        toPubkey: generateKeyPair().publicKey,
        lamports: SOL_SEND_AMOUNT,
      })
    )
    // Owner receives Wrapped SOL token
    transaction.add(
      Token.createTransferInstruction(
        TOKEN_PROGRAM_ID,
        secondaryTokenAddress,
        ownerTokenAddress,
        secondarySolAccount,
        [],
        TOKEN_SEND_AMOUNT
      )
    )
    transaction.recentBlockhash = await testApi.getRecentBlockHash()
    transaction.feePayer = ownerSolAccount
    transaction.signatures = [
      { signature: null, publicKey: ownerSolAccount },
      { signature: null, publicKey: secondarySolAccount },
    ]

    const result = await testApi.simulateAndRetrieveSideEffects(
      transaction.compileMessage(),
      ownerSolAccount.toString()
    )

    expect(result.willSend.length === 1).toBeTruthy()
    expect(result.willSend[0].type).toEqual('SOL')
    expect(result.willSend[0].balance).toEqual(new U64((SOL_SEND_AMOUNT + txFee * 2) * -1)) // two tx and will send would be negative

    expect(result.willReceive.length === 1).toBeTruthy()
    expect(result.willReceive[0].type).toEqual('TOKEN')
    expect(result.willReceive[0].balance).toEqual(new U64(TOKEN_SEND_AMOUNT))
  })
})
