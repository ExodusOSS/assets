import { PublicKey, StakeProgram, SystemProgram } from './vendor/index.js'

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)
export const SYSTEM_PROGRAM_ID = SystemProgram.programId

export const STAKE_PROGRAM_ID = StakeProgram.programId

export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

export const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

export const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

export const MAGIC_EDEN_ESCROW_PROGRAM_ID = new PublicKey(
  'MEisE1HzehtrDpAAT8PnLHjpSSkRYakotTuJRPjTpo8'
)

export const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

export const SYSVAR_INSTRUCTIONS_PUBKEY = new PublicKey(
  'Sysvar1nstructions1111111111111111111111111'
)

export const SEED = 'stake:0'

export const LAMPORTS_PER_SOL = 1_000_000_000

export const SOL_DECIMAL = Math.log10(LAMPORTS_PER_SOL)

export const SUPPORTED_TRANSACTION_VERSIONS = new Set(['legacy', 0])
