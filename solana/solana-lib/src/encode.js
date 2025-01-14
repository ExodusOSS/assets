import BN from 'bn.js'
import { deserializeUnchecked } from 'borsh'
import bs58 from 'bs58'
import assert from 'minimalistic-assert'

import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  SEED,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from './constants.js'
import { Metadata, METADATA_SCHEMA } from './helpers/metadata-schema.js'
import { getKeyPairFromPrivateKey, getPublicKey } from './keypair.js'
import { PublicKey, StakeProgram } from './vendor/index.js'

export function getAddressFromPublicKey(publicKey) {
  return bs58.encode(Buffer.from(publicKey, 'hex'))
}

export function getAddressFromPrivateKey(privateKey) {
  return getAddressFromPublicKey(getPublicKey(privateKey))
}

export function isValidAddress(address) {
  try {
    // assume base 58 encoding by default
    const decoded = bs58.decode(address)
    if (decoded.length !== 32) {
      return false
    }

    const _bn = new BN(decoded)
    return _bn.byteLength() <= 32
  } catch {
    return false
  }
}

export function getEncodedSecretKey(key) {
  const { privateKey, publicKey } = getKeyPairFromPrivateKey(key)
  return bs58.encode(Buffer.concat([privateKey, publicKey]))
}

export function getPrivateKeyFromSecretKey(secretKey) {
  const privateKey = bs58.decode(secretKey).slice(0, 32) // Buffer
  assert(privateKey.length === 32, 'privateKey has unexpected length')
  return privateKey
}

// doc: https://spl.solana.com/associated-token-account (HACK: refactored to sync)
export function findAssociatedTokenAddress(
  walletAddress,
  tokenMintAddress,
  programId = TOKEN_PROGRAM_ID.toBase58() // or TOKEN_2022_PROGRAM_ID
) {
  walletAddress = new PublicKey(walletAddress)
  tokenMintAddress = new PublicKey(tokenMintAddress)
  programId = programId instanceof PublicKey ? programId : new PublicKey(programId)

  return PublicKey.findProgramAddress(
    [walletAddress.toBuffer(), programId.toBuffer(), tokenMintAddress.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  )[0].toBase58() // returns encoded PublicKey
}

export function createStakeAddress(walletAddress, seed = SEED) {
  const fromPubkey = new PublicKey(walletAddress)

  const newAccountPubkey = PublicKey.createWithSeed(
    // HACK: refactored to sync
    fromPubkey,
    seed,
    StakeProgram.programId
  )

  return newAccountPubkey.toBase58()
}

// get Metaplex Metadata account
export function getMetadataAccount(tokenMintAddress) {
  const METADATA_PREFIX = 'metadata'

  return PublicKey.findProgramAddress(
    [
      Buffer.from(METADATA_PREFIX),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(tokenMintAddress).toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  )[0].toBase58() // returns encoded PublicKey
}

// metaplex NFT Master Edition PDA
export function getMasterEditionPDA(tokenMintAddress) {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata', 'utf8'),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(tokenMintAddress).toBuffer(),
      Buffer.from('edition', 'utf8'),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  )[0].toBase58()
}

// metaplex TokenRecord PDA
export function getTokenRecordPDA(tokenMintAddress, token) {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata', 'utf8'),
      MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(tokenMintAddress).toBuffer(),
      Buffer.from('token_record', 'utf8'),
      new PublicKey(token).toBuffer(),
    ],
    MPL_TOKEN_METADATA_PROGRAM_ID
  )[0].toBase58()
}

export function deserializeMetaplexMetadata(rawData) {
  const metadata = deserializeUnchecked(METADATA_SCHEMA, Metadata, rawData)

  // eslint-disable-next-line no-control-regex
  const METADATA_REPLACE = new RegExp('\u0000', 'g')
  metadata.data.name = metadata.data.name.replace(METADATA_REPLACE, '')
  metadata.data.uri = metadata.data.uri.replace(METADATA_REPLACE, '')
  metadata.data.symbol = metadata.data.symbol.replace(METADATA_REPLACE, '')
  return metadata.data
}
