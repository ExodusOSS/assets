import { tokens } from '@exodus/solana-meta'

import { TOKEN_2022_PROGRAM_ID } from '../constants.js'
import {
  findAssociatedTokenAddress,
  getAddressFromPrivateKey,
  getAddressFromPublicKey,
  getMetadataAccount,
  isValidAddress,
} from '../encode.js'

const serum = tokens.find((token) => token.name === 'serum')
const catwifhat = tokens.find((token) => token.name === '7atg_solana_3506aeb0')

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627'
const PUBLIC_KEY = '2694741f79e105feac100ae2dbfc7d3ef0fc7fdeced1c9b1c2f7f927d8460e10'
const ADDRESS = '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH'

test('Solana: getAddressFromPublicKey', () => {
  expect(getAddressFromPublicKey(PUBLIC_KEY)).toEqual(ADDRESS)
  expect(getAddressFromPublicKey(Buffer.from(PUBLIC_KEY, 'hex'))).toEqual(ADDRESS)
})

test('Solana: getAddressFromPrivateKey', () => {
  expect(getAddressFromPrivateKey(PRIVATE_KEY)).toEqual(ADDRESS)
  expect(getAddressFromPrivateKey(Buffer.from(PRIVATE_KEY, 'hex'))).toEqual(ADDRESS)
})

describe('Solana: isValidAddress', () => {
  test('Solana: returns true with valid address', () => {
    expect(isValidAddress(ADDRESS)).toBeTruthy()
  })

  test('Solana: returns false with incorrect address', () => {
    expect(isValidAddress('1b1nZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL2rumVh')).toBeFalsy()
  })
})

test('Solana: findAssociatedTokenAddress', () => {
  expect(findAssociatedTokenAddress(ADDRESS, serum.mintAddress)).toEqual(
    '4GGdxbXzXYfpp5LbrJq4ixDU8CATyrhPhJrhLCG9wGY1'
  )
})

test('Solana: findAssociatedTokenAddress for a token-2022', () => {
  expect(findAssociatedTokenAddress(ADDRESS, catwifhat.mintAddress, TOKEN_2022_PROGRAM_ID)).toEqual(
    '4V6HRYBrYJx4cCnS3vh1yD2mTxLo4H9vsSDLZqu4Dm3o'
  )
})

test('Solana: metaplex getMetadataAccount', () => {
  const MANGO_SPL_TOKEN = 'MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac'
  const METAPLEX_PDA = '3BhDWhUaejkSbgYUzPATtHBgCqBwZFmviEzE28piyn8b'
  expect(getMetadataAccount(MANGO_SPL_TOKEN)).toEqual(METAPLEX_PDA)
})
