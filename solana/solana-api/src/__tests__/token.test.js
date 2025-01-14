import { Api } from '../index.js'
import assets from './assets.js'
import {
  SAMPLE_JUPITER_SWAP,
  SAMPLE_JUPITER_SWAP_JUP_SOL,
  SAMPLE_JUPITER_SWAP_SOL_BONK,
  SAMPLE_JUPITER_SWAP_SOL_ZEUS,
  SAMPLE_JUPITER_SWAP_TWO_SPL,
  SAMPLE_JUPITER_SWAP_USDC_SOL,
  SAMPLE_MAGIC_EDEN_BUY,
  SAMPLE_RAYDIUM_NEW_SWAP,
  SAMPLE_RAYDIUM_SWAP,
  SIMPLE_SERUM_TRANSFER,
  TOKEN_ACCOUNTS,
  TOKEN_TRANSFER_TX,
} from './fixtures.js'

const api = new Api({ assets })

const TOKEN_TX_ID =
  '3ACX53v5ZznEFocbHgEjzVbrN6GCbHxGV2qC7Zhq6x7WKcjCF9ChtFzLq53yTxdo5RunYvgPpSp7X9TRnjqm4H7s'

const SRM_MINT_ADDRESS = 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'
const RAY_MINT_ADDRESS = '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'
const BONK_MINT_ADDRESS = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'

test('Solana: parseTransaction on a Jupiter DEX, SOL -> ZEUS', async () => {
  const owner = 'FfaSnXN7Vwn1s4EiHX82q3Dq8sQM6kcy3uHbYp7StWC6' // SOL base addr
  const txId =
    '2vpeYm8rVqe16gx3U7zgQLC31BGxhT7CTMPhDjdztLUqUUUaoi7TyenSRZ8WaVkxybPm2WpMFQfXXfRNFd7LPiXJ'

  const tokenAccountsByOwner = [
    {
      tokenAccountAddress: 'HgGsDoAV8rbFGrKkYdb9GiMxWycA2Uc2njThhWtkYcVJ',
      owner: 'FfaSnXN7Vwn1s4EiHX82q3Dq8sQM6kcy3uHbYp7StWC6',
      tokenName: 'zeus_solana_f153e498',
      ticker: 'ZEUSsolanaF153E498',
      balance: '11086004',
      mintAddress: 'ZEUS1aR7aX8DFFJf5QjWj2ftDDdNTroMNGo8YoQm3Gq',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 0,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
    {
      tokenAccountAddress: '7jpDdSnHdaZzLaXLukqdSH2bs7gweKZiVs9HzT2nKx4d',
      owner: 'FfaSnXN7Vwn1s4EiHX82q3Dq8sQM6kcy3uHbYp7StWC6',
      tokenName: 'dezx_solana_3b523050',
      ticker: 'DEZXsolana3B523050',
      balance: '4651417491',
      mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 5,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
  ]

  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_SOL_ZEUS, tokenAccountsByOwner)
  // console.log('SOL -> ZEUS transaction:', JSON.stringify(tx, null, 2))

  expect(tx.id).toEqual(txId)

  // console.log('Jupiter SOL -> ZEUS swap tx:', JSON.stringify(tx, null, 2))

  expect(tx.id).toEqual(
    '2vpeYm8rVqe16gx3U7zgQLC31BGxhT7CTMPhDjdztLUqUUUaoi7TyenSRZ8WaVkxybPm2WpMFQfXXfRNFd7LPiXJ'
  )

  expect(tx.from).toEqual('FfaSnXN7Vwn1s4EiHX82q3Dq8sQM6kcy3uHbYp7StWC6')
  expect(tx.to).toEqual('4brgYb1Xk9FUZW8HiJxTwhFrDZX6XNVcnQHLT1L734md')
  expect(tx.slot).toEqual(309_933_332)
  expect(tx.amount).toEqual(54_685_142)
  expect(tx.fee).toEqual(22_645) // sending SOL tx
  expect(tx.token).toBeFalsy()

  // additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '2vpeYm8rVqe16gx3U7zgQLC31BGxhT7CTMPhDjdztLUqUUUaoi7TyenSRZ8WaVkxybPm2WpMFQfXXfRNFd7LPiXJ'
  )
  expect(tx.dexTxs[0].owner).toEqual(null)
  expect(tx.dexTxs[0].from).toEqual('33jZJDFFBcmpBkx5Zu591em6yZrsSBnzfVvwyhAtAT5L')
  expect(tx.dexTxs[0].to).toEqual('FfaSnXN7Vwn1s4EiHX82q3Dq8sQM6kcy3uHbYp7StWC6')
  expect(tx.dexTxs[0].amount).toEqual(13_086_004)
  expect(tx.dexTxs[0].fee).toEqual(0)
  expect(tx.dexTxs[0].token.tokenName).toEqual('zeus_solana_f153e498')
})

test('Solana: parseTransaction on a token tx', async () => {
  const owner = '2WpsMPKqxztJ8zkwZwSj1axinmV5aewhqkLeMCaYhCMA'
  const tokenAccounts = TOKEN_ACCOUNTS // await api.getTokenAccountsByOwner(owner)
  const tx = api.parseTransaction(owner, TOKEN_TRANSFER_TX, tokenAccounts)
  // console.log('Token transaction:', JSON.stringify(tx, null, 2))

  expect(tx.id).toEqual(TOKEN_TX_ID)
  expect(tx.slot).toEqual(51_207_058)
  expect(tx.error).toEqual(false)
  expect(tx.tokenTxs[0].id).toEqual(TOKEN_TX_ID)
  expect(tx.tokenTxs[0].from).toEqual('2WpsMPKqxztJ8zkwZwSj1axinmV5aewhqkLeMCaYhCMA')
  expect(tx.tokenTxs[0].to).toEqual('71GbXnJkHz15kzjagB2f7N9H7HPA99v6BFuqfdYL5qtf')
  expect(tx.tokenTxs[0].amount).toEqual(36_280)
  expect(tx.tokenTxs[0].fee).toEqual(1e4)
  expect(tx.tokenTxs[0].token).toEqual({
    tokenAccountAddress: 'BB7cjxz123SVzAV5Fvb9WdvEnfYirrq1pYt2EqmUP9KG',
    tokenName: 'Serum',
    ticker: 'SRM',
  })
})

test('Solana: parseTransaction on a simple Serum transfer', async () => {
  const owner = 'EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k' // owner is the receiver (SOL addr) in this test case
  const tokenAccounts = [
    {
      tokenAccountAddress: '71GbXnJkHz15kzjagB2f7N9H7HPA99v6BFuqfdYL5qtf',
      owner: 'EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k',
      tokenName: 'Serum',
      ticker: 'SRM',
      balance: '138000',
    },
  ]
  const tx = api.parseTransaction(owner, SIMPLE_SERUM_TRANSFER, tokenAccounts)
  // console.log('serum tx:', JSON.stringify(tx, null, 2))
  expect(tx.id).toEqual(
    '5xcuZSj57qw5uodMDrEctXZjW9yubtJKjeW6KjYRwqsG8Wj7Pa79pZ9TEcPLQgNYr3QE1oiow1rqQZ3JPkVD8TZB'
  )
  expect(tx.tokenTxs[0].id).toEqual(
    '5xcuZSj57qw5uodMDrEctXZjW9yubtJKjeW6KjYRwqsG8Wj7Pa79pZ9TEcPLQgNYr3QE1oiow1rqQZ3JPkVD8TZB'
  )
  expect(tx.tokenTxs[0].from).toEqual('8Z5YeQHwHf4Cf8rJpt2TL2zx4r2ta88EmSrPpZA5KKid')
  expect(tx.tokenTxs[0].to).toEqual('EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k')
  expect(tx.slot).toEqual(56_939_843)
  expect(tx.tokenTxs[0].amount).toEqual(1_807_280)
  expect(tx.tokenTxs[0].fee).toEqual(0) // receiving tx
  expect(tx.tokenTxs[0].token).toBeTruthy()
})

test('Solana: parseTransaction on a simple Raydium swap', async () => {
  const owner = 'G5xnKeJ6pK4YGVfTPgwaHbkoya3jbf3PCVzWRXaDeKfj' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '5cJVdyyduNUaVhvjhMvyScjMsrgfztbLLDKG1Qenn83L',
      owner: 'G5xnKeJ6pK4YGVfTPgwaHbkoya3jbf3PCVzWRXaDeKfj',
      tokenName: 'usdcoin_solana',
      ticker: 'USDCSOL',
      balance: '2949699',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_RAYDIUM_SWAP, tokenAccounts)
  // console.log('raydium tx:', JSON.stringify(tx, null, 2))
  expect(tx.id).toEqual(
    '4gLnaweGbK3boh3jdooCPKpwJRroYscoVgFLG25oxnhGrLUhPSVtgqvYUitpNVXgDFG8rQ7zRjLwkcpsvoE1c9da'
  )

  expect(tx.from).toEqual('HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz')
  expect(tx.to).toEqual('G5xnKeJ6pK4YGVfTPgwaHbkoya3jbf3PCVzWRXaDeKfj') // token address
  expect(tx.slot).toEqual(108_487_844)
  expect(tx.amount).toEqual(2_117_789)
  expect(tx.fee).toEqual(0) // receiving tx
  expect(tx.token.tokenName).toEqual('usdcoin_solana')
})

test('Solana: parseTransaction on a Jupiter DEX swap', async () => {
  const owner = 'AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: 'DwFjmVmtWQKdJCvGCXX9CfJykNKr82FcRwFVfxPjyZrx',
      owner: 'AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq',
      tokenName: 'serum',
      ticker: 'SRM',
      balance: '0',
      mintAddress: SRM_MINT_ADDRESS,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP, tokenAccounts)
  // console.log('Jupiter DEX swap tx:', JSON.stringify(tx, null, 2))

  expect(tx.id).toEqual(
    '2LDaZzo4M9rF8bamfZyvhfS5XVMR47nhdBmHD6cERWcBtgtMHwuf1swNbFfY2r73h5nQHQAWpWNcjPdqyHELh8C1'
  )

  expect(tx.from).toEqual('AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq')
  expect(tx.to).toEqual('2KUDvQNLSbLNqFc6BmfGEhKmMsd64h6yzareCDyH3YDv')
  expect(tx.slot).toEqual(126_288_995)
  expect(tx.amount).toEqual(144_375_911)
  expect(tx.fee).toEqual(5000) // sending SOL tx
  expect(tx.token).toBeFalsy()

  // additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '2LDaZzo4M9rF8bamfZyvhfS5XVMR47nhdBmHD6cERWcBtgtMHwuf1swNbFfY2r73h5nQHQAWpWNcjPdqyHELh8C1'
  )
  expect(tx.dexTxs[0].owner).toEqual(null)
  expect(tx.dexTxs[0].from).toEqual('BCNYwsnz3yXvi4mY5e9w2RmZvwUW3pefzYQ4tsoNdDhp')
  expect(tx.dexTxs[0].to).toEqual('AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq')
  expect(tx.dexTxs[0].amount).toEqual(4_646_016)
  expect(tx.dexTxs[0].fee).toEqual(0)
  expect(tx.dexTxs[0].token.tokenName).toEqual('serum')
})

test('Solana: parseTransaction on a Jupiter DEX swap with 2 SPL tokens', async () => {
  const owner = '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '8LSHSGNfUWb8Qp4ae2wHPWGR6zGjhzYzpDzWSh3cuBch',
      owner: '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq',
      tokenName: 'serum',
      ticker: 'SRM',
      balance: '11829632',
      mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
    {
      tokenAccountAddress: '4Wio6KwPVAr19WF5iaVUUMLtJNMLrMPbkuZgdMv76jhb',
      owner: '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq',
      tokenName: 'raydium',
      ticker: 'RAY',
      balance: '417012',
      mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_TWO_SPL, tokenAccounts)
  // console.log('Jupiter DEX swap with 2 SPL tokens:', JSON.stringify(tx, null, 2))
  expect(tx.id).toEqual(
    'Vi3boAZ7WFR6hox4PNdiSYwq5ZrPcv5W7DSbnnfqoBkeRkNKfJyWv4TuYESgPWFUZNRjqbjnG6nMgmsmnLbNUfJ'
  )

  expect(tx.from).toEqual('8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq')
  expect(tx.to).toEqual('zuLDJ5SEe76L3bpFp2Sm9qTTe5vpJL3gdQFT5At5xXG')
  expect(tx.slot).toEqual(127_240_689)
  expect(tx.amount).toEqual(403_000)
  expect(tx.fee).toEqual(5000) // sending tx
  expect(tx.token.tokenName).toEqual('serum')

  // additional instruction (store as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    'Vi3boAZ7WFR6hox4PNdiSYwq5ZrPcv5W7DSbnnfqoBkeRkNKfJyWv4TuYESgPWFUZNRjqbjnG6nMgmsmnLbNUfJ'
  )
  expect(tx.dexTxs[0].owner).toEqual(null)
  expect(tx.dexTxs[0].from).toEqual('9ASj9zDg7cT6wtvn4euSUiZte8yN2U3Tn6cTVZvMHbU7')
  expect(tx.dexTxs[0].to).toEqual('8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq')
  expect(tx.dexTxs[0].amount).toEqual(406_756)
  expect(tx.dexTxs[0].fee).toEqual(0)
})

test('Solana: parseTransaction on a Jupiter DEX, SOL -> BONK', async () => {
  const owner = '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '8oR7EsCse7YwXknNs2qXu4642r4fi8n9HNmuPTBA7wH1',
      owner: '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws',
      tokenName: 'dezx_solana_3b523050',
      ticker: 'DEZXsolana3B523050',
      balance: '278335173221',
      mintAddress: BONK_MINT_ADDRESS,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_SOL_BONK, tokenAccounts)
  expect(tx.id).toEqual(
    '4EtKvyEEncc8sM8NWa2adVBULZ5rYLhprqGyviCr95ym63N5ufgu9dJpeUdjYRGdztkicFdEqRheckbJEorLSp8S'
  )

  // console.log('Jupiter SOL -> BONK swap tx:', JSON.stringify(tx, null, 2))

  // SOL tx
  expect(tx.from).toEqual('8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws')
  expect(tx.to).toEqual('BWNevwu92XRSD3c9DBhZrq9JFMUGcN9nm1dmKxY19CSR')
  expect(tx.slot).toEqual(240_583_818)
  expect(tx.amount).toEqual(106_661_949)
  expect(tx.fee).toEqual(36_097) // sending tx

  // BONK tx - additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '4EtKvyEEncc8sM8NWa2adVBULZ5rYLhprqGyviCr95ym63N5ufgu9dJpeUdjYRGdztkicFdEqRheckbJEorLSp8S'
  )
  expect(tx.dexTxs[0].owner).toEqual(null)
  expect(tx.dexTxs[0].from).toEqual('6cUdZ7u6AeeRQ6kJ9pE81MXr8PC12UrjxbAnfWyjumdV')
  expect(tx.dexTxs[0].to).toEqual('8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws')
  expect(tx.dexTxs[0].amount).toEqual(95_400_000_000)
  expect(tx.dexTxs[0].fee).toEqual(0)
  expect(tx.dexTxs[0].token.tokenName).toEqual('dezx_solana_3b523050')
  expect(tx.dexTxs[0].token.mintAddress).toEqual('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263')
})

test('Solana: parseTransaction on a Jupiter DEX swap with includeUnparsed', async () => {
  const owner = 'AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: 'DwFjmVmtWQKdJCvGCXX9CfJykNKr82FcRwFVfxPjyZrx',
      owner: 'AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq',
      tokenName: 'serum',
      ticker: 'SRM',
      balance: '0',
      mintAddress: SRM_MINT_ADDRESS,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP, tokenAccounts, {
    includeUnparsed: true,
  })
  // console.log('jupiter tx:', JSON.stringify(tx, null, 2))
  expect(tx.id).toEqual(
    '2LDaZzo4M9rF8bamfZyvhfS5XVMR47nhdBmHD6cERWcBtgtMHwuf1swNbFfY2r73h5nQHQAWpWNcjPdqyHELh8C1'
  )
  expect(tx.unparsed).toEqual(true)
  expect(tx.data.meta).toBeTruthy()

  expect(tx.amount).toEqual(-146_415_191)
  expect(tx.fee).toEqual(5000) // sending SOL tx
  expect(tx.token).toBeFalsy()

  // additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '2LDaZzo4M9rF8bamfZyvhfS5XVMR47nhdBmHD6cERWcBtgtMHwuf1swNbFfY2r73h5nQHQAWpWNcjPdqyHELh8C1'
  )
  expect(tx.dexTxs[0].owner).toEqual(null)
  expect(tx.dexTxs[0].from).toEqual('BCNYwsnz3yXvi4mY5e9w2RmZvwUW3pefzYQ4tsoNdDhp')
  expect(tx.dexTxs[0].to).toEqual('AG4WTn4ftX6JHCsUswqANRuRy1sKC1X9gmKXH94xDUfq')
  expect(tx.dexTxs[0].amount).toEqual('4646016')
  expect(tx.dexTxs[0].fee).toEqual(0)
  expect(tx.dexTxs[0].token.tokenName).toEqual('serum')
})

test('Solana: parseTransaction on a Jupiter DEX swap with 2 SPL tokens with includeUnparsed', async () => {
  const owner = '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '8LSHSGNfUWb8Qp4ae2wHPWGR6zGjhzYzpDzWSh3cuBch',
      owner: '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq',
      tokenName: 'serum',
      ticker: 'SRM',
      balance: '45000000',
      mintAddress: SRM_MINT_ADDRESS,
    },
    {
      tokenAccountAddress: '4Wio6KwPVAr19WF5iaVUUMLtJNMLrMPbkuZgdMv76jhb',
      owner: '8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq',
      tokenName: 'raydium',
      ticker: 'RAY',
      balance: '406756',
      mintAddress: RAY_MINT_ADDRESS,
    },
  ]
  const tx = await api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_TWO_SPL, tokenAccounts, {
    includeUnparsed: true,
  })
  // console.log('jupiter tx:', JSON.stringify(tx, null, 2))
  expect(tx.id).toEqual(
    'Vi3boAZ7WFR6hox4PNdiSYwq5ZrPcv5W7DSbnnfqoBkeRkNKfJyWv4TuYESgPWFUZNRjqbjnG6nMgmsmnLbNUfJ'
  )
  expect(tx.unparsed).toEqual(true)
  expect(tx.data.meta).toBeTruthy()

  expect(tx.amount).toEqual(0)
  expect(tx.fee).toEqual(5000)

  // additional instruction (store as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    'Vi3boAZ7WFR6hox4PNdiSYwq5ZrPcv5W7DSbnnfqoBkeRkNKfJyWv4TuYESgPWFUZNRjqbjnG6nMgmsmnLbNUfJ'
  )
  expect(tx.dexTxs[0].from).toEqual('8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq')
  expect(tx.dexTxs[0].to).toEqual('zuLDJ5SEe76L3bpFp2Sm9qTTe5vpJL3gdQFT5At5xXG')
  expect(tx.dexTxs[0].amount).toEqual('403000')
  expect(tx.dexTxs[0].fee).toEqual(0)

  expect(tx.dexTxs[1].owner).toEqual(null)
  expect(tx.dexTxs[1].from).toEqual('9ASj9zDg7cT6wtvn4euSUiZte8yN2U3Tn6cTVZvMHbU7')
  expect(tx.dexTxs[1].to).toEqual('8pfWkMuCQM1WDAUunbVaWyJ791gQoMqqsLFmjB6RujAq')
  expect(tx.dexTxs[1].amount).toEqual('406756')
  expect(tx.dexTxs[1].fee).toEqual(0)
})

test('Solana: parseTransaction on a Raydium call with includeUnparsed', async () => {
  const owner = '4houxrezgCzSg75Wuu6fL3cyJYtWc5SBwsMKz3TP4iB5' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: 'HyCEsyJUwFjic1VkWerNAes5fu384nuxBdDUHYskuvQe',
      owner: '4houxrezgCzSg75Wuu6fL3cyJYtWc5SBwsMKz3TP4iB5',
      tokenName: 'raydium',
      ticker: 'RAY',
      balance: '0',
      mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    },
    {
      tokenAccountAddress: '4q4GGt8k4rXmqDQbuR8jnyjU2P3xjkN4nB9C9sxZ9NNA',
      owner: '4houxrezgCzSg75Wuu6fL3cyJYtWc5SBwsMKz3TP4iB5',
      tokenName: 'serum',
      ticker: 'SRM',
      balance: '0',
      mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
    },
  ]
  const tx = await api.parseTransaction(owner, SAMPLE_RAYDIUM_NEW_SWAP, tokenAccounts, {
    includeUnparsed: true,
  })

  expect(tx.id).toBe(
    '4jRzAT7sVqWTTmeRfLyFECjproCCApbWRWuqJXvLYPM8BxD3K5tyh5RVQYJmm6XiW4oA5z5LZMGBxehpk3QvDN3F'
  )
  expect(tx.data.meta).toBeTruthy()
  expect(tx.amount).toBe(0)
  expect(tx.fee).toBe(5000)

  expect(tx.dexTxs.length).toBe(1)
  expect(tx.dexTxs[0].id).toEqual(
    '4jRzAT7sVqWTTmeRfLyFECjproCCApbWRWuqJXvLYPM8BxD3K5tyh5RVQYJmm6XiW4oA5z5LZMGBxehpk3QvDN3F'
  )
  expect(tx.dexTxs[0].token.tokenName).toBe('serum')
  expect(tx.dexTxs[0].from).toBe('384kWWf2Km56EReGvmtCKVo1BBmmt2SwiEizjhwpCmrN')
  expect(tx.dexTxs[0].to).toBe('4houxrezgCzSg75Wuu6fL3cyJYtWc5SBwsMKz3TP4iB5')
  expect(tx.dexTxs[0].amount).toBe('38837150')
  expect(tx.dexTxs[0].fee).toBe(0)
})

test('Solana: parseTransaction on a random contract call with includeUnparsed', async () => {
  const owner = 'nsn7DmCMsKWGUWcL92XfPKXFbUz7KtFDRa4nnkc3RiF' // SOL base addr
  const tokenAccounts = []
  const tx = api.parseTransaction(owner, SAMPLE_MAGIC_EDEN_BUY, tokenAccounts, {
    includeUnparsed: true,
  })
  expect(tx.id).toEqual(
    '5QecXzTAzDbq3W7PiryRDWYjJcsJSa5dQVwG8wf7CzTkf9y3Ry8ibW2iSqGbEeSbJNs4MQ9e3LEB1G2c3MPK5hke'
  )
  expect(tx.unparsed).toEqual(true)
  expect(tx.data.meta).toBeTruthy()
  expect(tx.amount).toEqual(-8_039_280)
  expect(tx.fee).toEqual(5000)
})

test('Solana: parseTransaction on a Jupiter DEX, JUP -> SOL', async () => {
  const owner = '5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '4CwdfM3E28hXhyZt4m4YhhuPeSB539SjMGDLSKQ2hqbp',
      owner: '5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk',
      tokenName: 'jupy_solana_ed7ebe51',
      ticker: 'JUPYsolanaED7EBE51',
      balance: '13698800',
      mintAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
    {
      tokenAccountAddress: '6ieAseQh14cNvGYVD3hEb9GA4B2DLWHZ5EQLB1bbNbwM',
      owner: '5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk',
      tokenName: 'usdcoin_solana',
      ticker: 'USDCSOL',
      balance: '116068410',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_JUP_SOL, tokenAccounts)
  expect(tx.id).toEqual(
    '4ZqLGPJkt7DNR36EFeMgR9kFfn1Uf4M9qLKT13areyuzLaPLSnAfHEshYGMhRyhFqdJtivcpWTpLcAsMFFmutp6L'
  )

  // console.log('Jupiter JUP -> SOL swap tx:', JSON.stringify(tx, null, 2))

  // SOL tx
  expect(tx.from).toEqual('8ZBbyDGErfqvY65fRZnm6dtQBe3REuAPqzRN7819fzeW')
  expect(tx.to).toEqual('5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk')
  expect(tx.slot).toEqual(256_521_699)
  expect(tx.amount).toEqual(21_067_475)
  expect(tx.fee).toEqual(26_764) // fee is included although it's received

  // JUP tx - additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '4ZqLGPJkt7DNR36EFeMgR9kFfn1Uf4M9qLKT13areyuzLaPLSnAfHEshYGMhRyhFqdJtivcpWTpLcAsMFFmutp6L'
  )
  expect(tx.dexTxs[0].owner).toEqual('5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk')
  expect(tx.dexTxs[0].from).toEqual('5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk')
  expect(tx.dexTxs[0].to).toEqual('CMtXWvw1CNrtApwDmsxSQmVBBvMS6Ck7ToyPWKEJbR6a')
  expect(tx.dexTxs[0].amount).toEqual(3_000_000)
  expect(tx.dexTxs[0].fee).toEqual(26_764)
  expect(tx.dexTxs[0].token.tokenName).toEqual('jupy_solana_ed7ebe51')
  expect(tx.dexTxs[0].token.mintAddress).toEqual('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN')
})

test('Solana: parseTransaction on a Jupiter DEX, USDC -> SOL', async () => {
  const owner = 'atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3' // SOL base addr
  const tokenAccounts = [
    {
      tokenAccountAddress: '96j6Ej74Acppj92qjWWuBYHXZ6hSFfoZDJejqjC7qGBA',
      owner: 'atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3',
      tokenName: 'usdcoin_solana',
      ticker: 'USDCSOL',
      balance: '29468695',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
  ]
  const tx = api.parseTransaction(owner, SAMPLE_JUPITER_SWAP_USDC_SOL, tokenAccounts)
  expect(tx.id).toEqual(
    '5YMfhsTpqN6JR7YCtBDCZZPjwcYyRJKtfwyKjFztkwZt3NxAvAnLz85WAToBrLSYCrwfN31tAvzCJ63pxKvdMyau'
  )

  // console.log('Jupiter USDC -> SOL swap tx:', JSON.stringify(tx, null, 2))

  // SOL tx
  expect(tx.from).toEqual('DSN3j1ykL3obAVNv7ZX49VsFCPe4LqzxHnmtLiPwY6xg')
  expect(tx.to).toEqual('atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3')
  expect(tx.slot).toEqual(256_522_001)
  expect(tx.amount).toEqual(11_460_069)
  expect(tx.fee).toEqual(80_700) // fee is included although it's received

  // USDC tx - additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].id).toEqual(
    '5YMfhsTpqN6JR7YCtBDCZZPjwcYyRJKtfwyKjFztkwZt3NxAvAnLz85WAToBrLSYCrwfN31tAvzCJ63pxKvdMyau'
  )
  expect(tx.dexTxs[0].owner).toEqual('atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3')
  expect(tx.dexTxs[0].from).toEqual('atBkHUPcHAXPopfKmoTfT45AaAYNnSCLnWkXnnhDYh3')
  expect(tx.dexTxs[0].to).toEqual('FbruxBVHi463Agw2B3Vy27cBkGnEN5g1f4NcHe3REXfe')
  expect(tx.dexTxs[0].amount).toEqual(2_222_000)
  expect(tx.dexTxs[0].fee).toEqual(80_700)
  expect(tx.dexTxs[0].token.tokenName).toEqual('usdcoin_solana')
  expect(tx.dexTxs[0].token.mintAddress).toEqual('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
})
