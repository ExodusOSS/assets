import { MPL_TOKEN_METADATA_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '../constants.js'
import {
  createMetaplexTransferTransaction,
  encodeData,
  TOKEN_STANDARD,
} from '../helpers/metaplex-transfer.js'

const RECENT_BLOCKHASH = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'

const PROGRAMMABLE_NFT_TEST = {
  from: '9qPGTK92cRkfXzPVVEgz1bUYweNBY9PvoeoiavkMKmMs',
  to: '3LtDVz2HYAXakiZhv5pi9cetZXoWGutGjc8g4bQnRmWb',
  tokenMintAddress: '3YYjPyjkiV8KkiWNJV5SMdDJDjaTj8VZiJeuekMhVd7e',
  tokenStandard: TOKEN_STANDARD.ProgrammableNonFungible,
}

const NORMAL_NFT_TEST = {
  fromOwner: '9qPGTK92cRkfXzPVVEgz1bUYweNBY9PvoeoiavkMKmMs',
  toOwner: '3LtDVz2HYAXakiZhv5pi9cetZXoWGutGjc8g4bQnRmWb',
  mint: '3h9z827XPq51UyrV2WiD4Bx3Ku7W6RYbeyPzvZttrz8E',
}

test('Solana programmable NFT transaction', () => {
  const tx = createMetaplexTransferTransaction({
    ...PROGRAMMABLE_NFT_TEST,
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.instructions[0].keys.length).toEqual(17)
  expect(tx.instructions[0].keys[7].pubkey.toBase58()).not.toEqual(
    MPL_TOKEN_METADATA_PROGRAM_ID.toBase58()
  )
  expect(tx.instructions[0].keys[8].pubkey.toBase58()).not.toEqual(
    MPL_TOKEN_METADATA_PROGRAM_ID.toBase58()
  )
  expect(tx.instructions[0].keys).toMatchSnapshot()
})

test('Solana programmable NFT transaction using token 2022', () => {
  const tx = createMetaplexTransferTransaction({
    ...PROGRAMMABLE_NFT_TEST,
    tokenProgram: TOKEN_2022_PROGRAM_ID.toBase58(),
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.instructions[0].keys.length).toEqual(17)
  expect(tx.instructions[0].keys[13].pubkey.toBase58()).toEqual(TOKEN_2022_PROGRAM_ID.toBase58())
  expect(tx.instructions[0].keys).toMatchSnapshot()
})

test('Solana normal NFT transaction using metaplex transfer', () => {
  const tx = createMetaplexTransferTransaction({
    ...NORMAL_NFT_TEST,
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.instructions[0].keys.length).toEqual(17)
  expect(tx.instructions[0].keys[7].pubkey.toBase58()).toEqual(
    MPL_TOKEN_METADATA_PROGRAM_ID.toBase58()
  )
  expect(tx.instructions[0].keys[8].pubkey.toBase58()).toEqual(
    MPL_TOKEN_METADATA_PROGRAM_ID.toBase58()
  )
  expect(tx.instructions[0].keys).toMatchSnapshot()
})

test('Solana metaplex transfer data', () => {
  const expectedBuffer = Buffer.from('3100010000000000000000', 'hex')

  const myBuffer = encodeData({ amount: 1 })

  expect(Buffer.compare(myBuffer, expectedBuffer)).toEqual(0)
})
