import * as BufferLayout from '@exodus/buffer-layout'

import {
  MPL_TOKEN_METADATA_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TOKEN_PROGRAM_ID,
} from '../constants.js'
import {
  findAssociatedTokenAddress,
  getMasterEditionPDA,
  getMetadataAccount,
  getTokenRecordPDA,
} from '../encode.js'
import { PublicKey, Transaction, TransactionInstruction } from '../vendor/index.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID } from './spl-token.js'

const TRANSFER_INSTRUCTION_DISCRIMINATOR = 49
const TOKEN_AUTH_RULES_ID = new PublicKey('auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg')

export const TOKEN_STANDARD = {
  NonFungible: 0,
  FungibleAsset: 1,
  Fungible: 2,
  NonFungibleEdition: 3,
  ProgrammableNonFungible: 4,
}

export const AUTHORITY_TYPE = {
  None: 0,
  Metadata: 1,
  Holder: 2,
  MetadataDelegate: 3,
  TokenDelegate: 4,
}

export const prepareMetaplexTransferTx = ({
  token,
  tokenOwner,
  destination,
  destinationOwner,
  mint,
  metadata,
  edition,
  ownerTokenRecord,
  destinationTokenRecord,
  authority,
  payer,
  authorizationRulesProgram,
  authorizationRules,
  amount,
  authorityType,
  programId = MPL_TOKEN_METADATA_PROGRAM_ID,
  tokenProgram,
}) => {
  const transaction = new Transaction()
  const data = encodeData({ amount, authorityType })
  const keys = [
    {
      pubkey: token,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: tokenOwner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: destination,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: destinationOwner,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: metadata,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: edition ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: ownerTokenRecord ?? programId,
      isWritable: ownerTokenRecord != null,
      isSigner: false,
    },
    {
      pubkey: destinationTokenRecord ?? programId,
      isWritable: destinationTokenRecord != null,
      isSigner: false,
    },
    {
      pubkey: authority,
      isWritable: false,
      isSigner: true,
    },
    {
      pubkey: payer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: SYSTEM_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: tokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: authorizationRulesProgram ?? programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: authorizationRules ?? programId,
      isWritable: false,
      isSigner: false,
    },
  ]

  transaction.add(
    new TransactionInstruction({
      programId,
      keys,
      data,
    })
  )

  return transaction
}

export function createMetaplexTransferTransaction({
  from,
  to,
  tokenMintAddress,
  tokenStandard,
  recentBlockhash,
  amount = 1,
  tokenProgram = TOKEN_PROGRAM_ID.toBase58(),
}) {
  const fromAccount = findAssociatedTokenAddress(from, tokenMintAddress, tokenProgram)

  const toAccount = findAssociatedTokenAddress(to, tokenMintAddress, tokenProgram)

  const metadata = getMetadataAccount(tokenMintAddress)
  const edition = getMasterEditionPDA(tokenMintAddress)
  const ownerTokenRecord = getTokenRecordPDA(tokenMintAddress, fromAccount)
  const destinationTokenRecord = getTokenRecordPDA(tokenMintAddress, toAccount)
  const isProgrammable = tokenStandard === TOKEN_STANDARD.ProgrammableNonFungible

  const transaction = prepareMetaplexTransferTx({
    token: new PublicKey(fromAccount),
    tokenOwner: new PublicKey(from),
    destination: new PublicKey(toAccount),
    destinationOwner: new PublicKey(to),
    mint: new PublicKey(tokenMintAddress),
    metadata: new PublicKey(metadata),
    edition: new PublicKey(edition),
    ownerTokenRecord: isProgrammable ? new PublicKey(ownerTokenRecord) : undefined,
    destinationTokenRecord: isProgrammable ? new PublicKey(destinationTokenRecord) : undefined,
    authority: new PublicKey(from),
    payer: new PublicKey(from),
    authorizationRulesProgram: TOKEN_AUTH_RULES_ID,
    amount,
    tokenProgram: new PublicKey(tokenProgram),
  })

  transaction.recentBlockhash = recentBlockhash

  return transaction
}

export function encodeData({ amount, authorityType }) {
  const TransferArgsV1 = BufferLayout.struct(
    [
      BufferLayout.u8('variant'), // For variant 'V1' of TransferArgs
      BufferLayout.nu64('amount'),
      BufferLayout.u8('authorizationData'),
    ],
    'transferArgs'
  )

  const TransferInstructionLayout = BufferLayout.struct([
    BufferLayout.u8('instructionDiscriminator'),
    TransferArgsV1,
  ])

  const buffer = Buffer.alloc(TransferInstructionLayout.span)
  const data = {
    instructionDiscriminator: TRANSFER_INSTRUCTION_DISCRIMINATOR,
    transferArgs: {
      variant: 0, // Variant 'V1' is represented as 0
      amount,
    },
  }
  TransferInstructionLayout.encode(data, buffer)

  return buffer
}
