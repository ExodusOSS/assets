import { Api } from '../index.js'
import assets from './assets.js'

jest.setTimeout(20_000)

const api = new Api({ assets })

const ADDRESS = 'DmUHBhkq3deAEjV6u2kY5TZP9CVQhqXs7sniGCCULiK4' // main SOL address (owner)
const ASSOCIATED_TOKEN_ADDRESS = 'BzB6ViSQtuvaXA1rUWjTB3TpzDmWQJbSL2KchUyYeWqv' // Serum (SRM) associatedTokenAddress
const TOKEN_TX_ID =
  '3ACX53v5ZznEFocbHgEjzVbrN6GCbHxGV2qC7Zhq6x7WKcjCF9ChtFzLq53yTxdo5RunYvgPpSp7X9TRnjqm4H7s'

const SRM_MINT_ADDRESS = 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt'

beforeAll(() => {
  return api.watchAddress({
    address: ADDRESS,
    onMessage: (msg) => console.log(`Received: ${JSON.stringify(msg, null, 2)}`),
  }) // Open WS connection
})

test('Solana: getTransactionById on a token tx', async () => {
  const tx = await api.getTransactionById(TOKEN_TX_ID)
  expect(tx.meta).toBeTruthy()
  expect(tx.slot).toEqual(51_207_058)
  expect(tx.transaction.message.recentBlockhash).toEqual(
    'HfARGEPbBqXUHeEEX1nGtdL76uWzgT9YSufe5bBb61gP'
  )
  expect(tx.transaction.signatures[0]).toEqual(TOKEN_TX_ID)
  expect(tx.transaction.message.accountKeys[0].pubkey).toEqual(
    '2WpsMPKqxztJ8zkwZwSj1axinmV5aewhqkLeMCaYhCMA'
  )
})

test('Solana: getTokenAccountsByOwner', async () => {
  const srmAccounts = await api.getTokenAccountsByOwner(ADDRESS, 'SRM')
  // console.log(srmAccounts)
  expect(srmAccounts.length).toBeTruthy()
  expect(srmAccounts[0].tokenName).toEqual('serum')
  expect(srmAccounts[0].ticker).toEqual('SRM')
  expect(srmAccounts[0].owner).toEqual(ADDRESS)
  expect(srmAccounts[0].tokenAccountAddress).toEqual(ASSOCIATED_TOKEN_ADDRESS)
  expect(srmAccounts[0].balance).toEqual('100') // in lamports

  // expect no usdc tokens
  const usdcAccounts = await api.getTokenAccountsByOwner(ADDRESS, 'USDCSOL')
  expect(usdcAccounts.length).toEqual(0)
})

test('Solana: getTokensBalancesAndAccounts', async () => {
  const { balances: tokensBalance, accounts } = await api.getTokensBalancesAndAccounts({
    address: ADDRESS,
  })
  expect(tokensBalance).toEqual({ serum: 100 })
  expect(accounts.length).toBeTruthy()
  expect(accounts[0].tokenName).toEqual('serum')
  expect(accounts[0].ticker).toEqual('SRM')
  expect(accounts[0].owner).toEqual(ADDRESS)
  expect(accounts[0].tokenAccountAddress).toEqual(ASSOCIATED_TOKEN_ADDRESS)
  expect(accounts[0].balance).toEqual('100') // in lamports

  // expect no usdc tokens
  const usdcAccounts = await api.getTokenAccountsByOwner(ADDRESS, 'USDCSOL')
  expect(usdcAccounts.length).toEqual(0)
})

test('Solana: getTokenAddressOwner', async () => {
  const owner = await api.getTokenAddressOwner('5jvtTmrGFQFX1YHa4ibGhMc9Nu2n3SKncHGTVjGsHc2c')
  expect(owner).toEqual('HfPrmxTGBnVoEjpcCN5ekSCtg8b6ZPJLvnCRnH8owtUf')
})

test('Solana: isAssociatedTokenAccountActive', async () => {
  expect(await api.isAssociatedTokenAccountActive(ADDRESS)).toEqual(false) // false because needs a SPL addr
  expect(await api.isAssociatedTokenAccountActive(ASSOCIATED_TOKEN_ADDRESS)).toEqual(true)
})

test('Solana: isTokenAddress', async () => {
  expect(await api.isTokenAddress(ASSOCIATED_TOKEN_ADDRESS)).toBeTruthy()
})

test('Solana: isSOLaddress', async () => {
  // ADDRESS has never been initialized
  expect(await api.isSOLaddress(ADDRESS)).toBeFalsy()
  expect(await api.getAddressType(ADDRESS)).toEqual(null)
  expect(await api.isSOLaddress('EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k')).toBeTruthy()
})

test('Solana: check getAddressMint returns the expected mint address', async () => {
  const mintAddr = await api.getAddressMint(ASSOCIATED_TOKEN_ADDRESS)
  expect(mintAddr).toEqual(SRM_MINT_ADDRESS)
})

test('Solana: parseTransaction on a Jupiter DEX, USDC -> SOL (2)', async () => {
  const owner = '8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws' // SOL base addr
  const txId =
    'B4mfDApARHsiB8eJiWhmhLGWrDTxPUECkah7mqfzSzRMydN9Hj5V2wMwAwZUkXwuRmz2AyvAfcHGoi7fy54Fn4c'

  const tokenAccountsByOwner = await api.getTokenAccountsByOwner(owner) // Array
  const transaction = await api.getTransactionById(txId)

  const tx = api.parseTransaction(owner, transaction, tokenAccountsByOwner)
  expect(tx.id).toEqual(txId)

  console.log('Jupiter USDC -> SOL swap tx (2):', JSON.stringify(tx, null, 2))

  // SOL tx
  expect(tx.from).toEqual('EXHyQxMSttcvLPwjENnXCPZ8GmLjJYHtNBnAkcFeFKMn')
  expect(tx.to).toEqual('8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws')
  expect(tx.slot).toEqual(277_117_775)
  expect(tx.amount).toEqual(73_686_600)
  expect(tx.fee).toEqual(54_104) // fee is included although it's received

  // USDC tx - additional instruction (stored as separate txLog in wallet)
  expect(tx.dexTxs[0].owner).toEqual('8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws')
  expect(tx.dexTxs[0].from).toEqual('8cBxsCL2q2jMXqHweMaHmP7v2RbB4WG5buTXmjXa8Yws')
  expect(tx.dexTxs[0].to).toEqual('9PeQs7co3NtYnkV2CuWCSC6MXxwrMgHBX1E2qNEUj7MY')
  expect(tx.dexTxs[0].amount).toEqual(10_000_000)
  expect(tx.dexTxs[0].fee).toEqual(54_104)
  expect(tx.dexTxs[0].token.tokenName).toEqual('usdcoin_solana')
  expect(tx.dexTxs[0].token.mintAddress).toEqual('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
})

afterAll(async () => {
  return api.unwatchAddress({ address: ADDRESS })
})
