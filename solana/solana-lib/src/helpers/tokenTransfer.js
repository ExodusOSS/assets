import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants.js'
import { findAssociatedTokenAddress } from '../encode.js'
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '../vendor/index.js'
import { Token } from './spl-token.js'

// https://github.com/paul-schaaf/spl-token-ui/blob/main/src/solana/token/associatedToken.ts#L59
export const createAssociatedTokenAccount = (
  senderAddress,
  tokenMintAddress,
  ownerAddress, // destination SOL address
  tokenProgram
) => {
  const associatedTokenAccountPublicKey = new PublicKey(
    findAssociatedTokenAddress(ownerAddress, tokenMintAddress, tokenProgram)
  )

  const feePayerPublicKey = new PublicKey(senderAddress)
  const ownerPublicKey = new PublicKey(ownerAddress)
  const tokenMintPublicKey = new PublicKey(tokenMintAddress)
  const tokenProgramPublicKey = new PublicKey(tokenProgram)

  return createIx(
    feePayerPublicKey, // feePayer
    associatedTokenAccountPublicKey,
    ownerPublicKey,
    tokenMintPublicKey,
    tokenProgramPublicKey
  ) // returns the instruction
}

function createIx(
  funderPubkey,
  associatedTokenAccountPublicKey,
  ownerPublicKey,
  tokenMintPublicKey,
  tokenProgramPublicKey
) {
  return new TransactionInstruction({
    programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    data: Buffer.from([]),
    keys: [
      { pubkey: funderPubkey, isSigner: true, isWritable: true },
      {
        pubkey: associatedTokenAccountPublicKey,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: ownerPublicKey, isSigner: false, isWritable: false },
      { pubkey: tokenMintPublicKey, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: tokenProgramPublicKey || TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ],
  })
}

// https://github.com/paul-schaaf/spl-token-ui/blob/main/src/solana/token/editing.ts#L211
export const createTokenTransferInstruction = (owner, fromTokenAddress, to, amount) => {
  const sourcePubkey = new PublicKey(fromTokenAddress) // the token ADDRESS needed!
  const destinationPubkey = new PublicKey(to)
  console.log(`destination token address: ${destinationPubkey.toBase58()}`)
  const ownerAccountOrWalletPublicKey = new PublicKey(owner) // the only native SOL address

  return Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    sourcePubkey,
    destinationPubkey,
    ownerAccountOrWalletPublicKey,
    [],
    amount
  )
}

export const createCloseAccountInstruction = ({
  programId = TOKEN_PROGRAM_ID,
  tokenPublicKey,
  walletPublicKey,
}) => {
  return Token.createCloseAccountInstruction(
    programId,
    tokenPublicKey,
    walletPublicKey,
    walletPublicKey,
    []
  )
}
