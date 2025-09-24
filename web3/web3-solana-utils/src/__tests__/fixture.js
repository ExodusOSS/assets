import { Token } from '@exodus/solana-lib'
import { TOKEN_PROGRAM_ID } from '@exodus/solana-lib/src/helpers/spl-token.js'
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionMessage,
  VersionedTransaction,
} from '@exodus/solana-web3.js'

const fromPubkey = new PublicKey('GxYXF9zLy3jaTPSfbLFs9iJBXreaQefUB92qNStNCGCi')
const toPubkey = new PublicKey('5XAzFBy3RJnR5ZyaY9EVt1q3LWXc8Q53DoEEYodoTtSk')
const toTokenPubkey = new PublicKey(
  'HepCfJ2Y7aftckvDFzN5PHTLd3NVr28We2ir729szDAa',
)

const systemTransfer = SystemProgram.transfer({
  fromPubkey,
  toPubkey,
  lamports: 1000,
})

const transactionMessage = new TransactionMessage({
  recentBlockhash: '11111111111111111111111111111111',
  payerKey: fromPubkey,
  instructions: [systemTransfer],
})

const messageV0 = transactionMessage.compileToV0Message()
export const SOLANA_TX = new VersionedTransaction(messageV0)

const tokenTransfer = Token.createTransferInstruction(
  TOKEN_PROGRAM_ID,
  fromPubkey,
  toTokenPubkey,
  fromPubkey,
  [],
  500,
)

const tokenTransferMessage = new TransactionMessage({
  recentBlockhash: '11111111111111111111111111111111',
  payerKey: fromPubkey,
  instructions: [tokenTransfer],
})

export const SOLANA_TOKEN_TRANSFER = new VersionedTransaction(
  tokenTransferMessage.compileToV0Message(),
)

export const SOLANA_LEGACY_TX = new Transaction({
  feePayer: fromPubkey,
  recentBlockhash: '11111111111111111111111111111111',
})

export const SOLANA_VERSIONED_LEGACY_TX = new VersionedTransaction(
  transactionMessage.compileToLegacyMessage(),
)

SOLANA_LEGACY_TX.add(systemTransfer)

const multiTransferMessage = new TransactionMessage({
  recentBlockhash: '11111111111111111111111111111111',
  payerKey: fromPubkey,
  instructions: [systemTransfer, tokenTransfer],
})

export const SOLANA_MULTI_TRANSFER_TX = new VersionedTransaction(
  multiTransferMessage.compileToV0Message(),
)
