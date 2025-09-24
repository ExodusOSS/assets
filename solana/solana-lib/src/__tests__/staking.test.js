import { createStakeAddress, isValidAddress } from '../encode.js'
import Transaction from '../transaction.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627'
const ADDRESS = '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH'
const STAKE_ADDRESS = 'A6hAszhrraD94SEmMGkHsZmZBTXS9SowG21gddRcnxrj'
const EVERSTAKE_POOL = '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF'
const RECENT_BLOCKHASH = '6XKHiG9hFP6fE5bqUmL2KgYo3F9DAFGsBiomtDK3Nb9H'

test('Solana: create a stake address', () => {
  expect(createStakeAddress(ADDRESS)).toEqual(STAKE_ADDRESS)
})

test('Solana: returns true with valid stake address', () => {
  expect(isValidAddress(STAKE_ADDRESS)).toBeTruthy()
})

test('Solana: createStakeAccount Transaction', () => {
  const tx = Transaction.createStakeAccountTransaction({
    // + delegate instruction
    address: ADDRESS,
    amount: 123,
    pool: EVERSTAKE_POOL,
    recentBlockhash: RECENT_BLOCKHASH,
  })
  expect(tx.instructions.length).toEqual(3)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)
  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toBeTruthy()
  const serialized = Transaction.serialize(tx)
  expect(serialized).toBeTruthy()
})

test('Solana: undelegate Transaction', () => {
  const tx = Transaction.undelegate({
    address: ADDRESS,
    stakeAddresses: [STAKE_ADDRESS],
    recentBlockhash: RECENT_BLOCKHASH,
  })
  expect(tx.instructions.length).toEqual(1)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)
  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toBeTruthy()
  const serialized = Transaction.serialize(tx)
  expect(serialized).toBeTruthy()
})

test('Solana: withdraw Transaction', () => {
  const tx = Transaction.withdraw({
    address: ADDRESS,
    accounts: {
      [STAKE_ADDRESS]: {
        activationEpoch: 776,
        deactivationEpoch: 778,
        stake: 7_722_670,
        voter: EVERSTAKE_POOL,
        warmupCooldownRate: 0.25,
        lamports: 10_005_550,
        state: 'inactive',
        isDeactivating: false,
        canWithdraw: true,
      },
    },
    amount: 123,
    recentBlockhash: RECENT_BLOCKHASH,
  })
  expect(tx.instructions.length).toEqual(1)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)
  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toBeTruthy()
  const serialized = Transaction.serialize(tx)
  expect(serialized).toBeTruthy()
})
