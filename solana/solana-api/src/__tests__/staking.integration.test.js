import { Api } from '../index.js'
import assets from './assets.js'
import { SAMPLE_DELEGATE_TX, SAMPLE_UNDELEGATE_TX, SAMPLE_WITHDRAW_TX } from './fixtures.js'

const api = new Api({ assets })

const ADDRESS = 'Bb44g79UH5b7EqPRTStSqNWuBRy1mCPS9GHSteh3ai5j' // main SOL address (owner)
const STAKE_ADDRESS = '3XGtroRneSQbbAWfeanaZeSmZRTyrHmCnHsYugnYzBzW' // derived from main SOL address at stake:1
const EXPECTED_VOTE_ACCOUNT = 'FkK9cat6c8zhLXeYFn4UTvy6fnSLB4p6SCbRQQfdFkkP' // baker/validator vote acc

const ACCOUNT_OWNER = 'EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k'
const DELEGATE_TX_ID =
  'Q7BXFNrfkjwWZ3j8FyqDtezPyv6t8NJGyGpaCNnQTPhVbHAurUShCDcneJHpunubU39BSwKUqiBubz6C7BikqMu'
const UNDELEGATE_TX_ID =
  '6bsiwBZWY5nMb6Sbg4LgSJ5y9v4Z8UWj398f2ifunwimMLzUNQSozGy3yJEET86ZrqmNJzbQmBxvyTMJdFsFMxj'
const WITHDRAW_TX_ID =
  '7mo5H9yMSi4dSQBCHRgwmttqHEfqgbUSah6SGyB6kP7f2CqS1KrzLBdj2GjXgsk6how3JyU5VHDUMuNQ6UYsCTx'

test('Solana: getEpochInfo', async () => {
  const epoch = await api.getEpochInfo()
  console.log(epoch)
  expect(epoch > 0).toBeTruthy()
})

test('Solana: getRewards', async () => {
  const rewards = await api.getRewards('EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k')
  console.log('rewards:', rewards)
  expect(rewards >= 31_084_037).toBeTruthy() // rewards at 24-09-21
})

test('Solana: getStakeActivation', async () => {
  const state = await api.getStakeActivation(STAKE_ADDRESS)
  expect(state).toEqual('inactive')
  const active = await api.getStakeActivation('HHEG7vTqVNZWdpeDqi62fPE1ovpg8r7XWjxwwh8tvkUo')
  expect(['active', 'activating']).toContain(active)
})

test('Solana: getStakeAccountsInfo from a base SOL address', async () => {
  const { accounts, totalStake, locked, withdrawable } = await api.getStakeAccountsInfo(ADDRESS)
  // console.log(accounts)
  console.log('totalStake', totalStake)
  console.log('locked', locked)
  console.log('withdrawable', withdrawable)
  expect(Object.keys(accounts).length).toEqual(2)
  expect(totalStake).toBeTruthy()
  expect(locked).toEqual(0)
  expect(typeof withdrawable).toEqual('number')
  const account = accounts[STAKE_ADDRESS]
  expect(account).toBeTruthy()
  expect(typeof account.stake).toEqual('number')
  expect(account.stake > 2_700_100).toBeTruthy() // active staked amount
  expect(account.lamports > 0).toBeTruthy() // sol amount
  expect(account.voter).toEqual(EXPECTED_VOTE_ACCOUNT)
  expect(account.deactivationEpoch).toBeTruthy()
  expect(typeof account.isDeactivating).toEqual('boolean')
  expect(typeof account.canWithdraw).toEqual('boolean')
  expect(typeof account.state).toEqual('string')
})

test('Solana: got expected results from delegate transaction', async () => {
  const tx = await api.getTransactionById(DELEGATE_TX_ID)
  const parsedTx = api.parseTransaction(ACCOUNT_OWNER, tx)
  expect(parsedTx).toEqual(SAMPLE_DELEGATE_TX)
})

test('Solana: got expected results from undelegate transaction', async () => {
  const tx = await api.getTransactionById(UNDELEGATE_TX_ID)
  const parsedTx = api.parseTransaction(ACCOUNT_OWNER, tx)
  expect(parsedTx).toEqual(SAMPLE_UNDELEGATE_TX)
})

test('Solana: got expected results from withdraw transaction', async () => {
  const tx = await api.getTransactionById(WITHDRAW_TX_ID)
  const parsedTx = api.parseTransaction(ACCOUNT_OWNER, tx)
  expect(parsedTx).toEqual(SAMPLE_WITHDRAW_TX)
})
