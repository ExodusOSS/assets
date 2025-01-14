import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '../helpers/spl-token.js'
import { generateKeyPair } from '../keypair.js'
import { decodeTransactionInstructions } from '../tx/decode-tx-instructions.js'
import { SystemProgram, Transaction, TransactionInstruction } from '../vendor/index.js'

// https://explorer.solana.com/block/121572737.
const recentBlockhash = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'

function createTransactionMessage(instruction) {
  const transaction = new Transaction({})

  transaction.recentBlockhash = recentBlockhash
  transaction.feePayer = generateKeyPair().publicKey

  transaction.add(instruction)

  return transaction.compileMessage()
}

const ownerPubkey = generateKeyPair().publicKey
const accountPubkey = generateKeyPair().publicKey
const fromPubkey = generateKeyPair().publicKey
const toPubkey = generateKeyPair().publicKey
const mintPubkey = generateKeyPair().publicKey
const mintAuthority = generateKeyPair().publicKey
const freezeAuthority = generateKeyPair().publicKey
const programId = generateKeyPair().publicKey
const mint = generateKeyPair().publicKey
const authorizedPubkey = generateKeyPair().publicKey
const noncePubkey = generateKeyPair().publicKey
const newAuthorizedPubkey = generateKeyPair().publicKey
const basePubkey = generateKeyPair().publicKey
const newAccountPubkey = generateKeyPair().publicKey

const knownTable = [
  {
    instruction: SystemProgram.createAccount({
      fromPubkey,
      newAccountPubkey: ownerPubkey,
      programId: SystemProgram.programId,
      space: 1000,
      lamports: 500,
    }),
    expected: {
      type: 'systemCreate',
      title: 'Create Account',
      data: {
        fromPubkey,
        newAccountPubkey: ownerPubkey,
        programId: SystemProgram.programId,
        lamports: 500,
        space: 1000,
      },
    },
  },
  {
    instruction: SystemProgram.createAccountWithSeed({
      authorizedPubkey,
      basePubkey,
      fromPubkey,
      newAccountPubkey,
      noncePubkey,
      lamports: 500,
      seed: 'seed',
      space: 10,
      programId: SystemProgram.programId,
    }),
    expected: {
      type: 'systemCreateWithSeed',
      title: 'Create Account With Seed',
      data: {
        basePubkey,
        fromPubkey,
        newAccountPubkey,
        lamports: 500,
        seed: 'seed',
        space: 10,
        programId: SystemProgram.programId,
      },
    },
  },
  {
    instruction: SystemProgram.assign({
      accountPubkey: ownerPubkey,
      programId: SystemProgram.programId,
    }),
    expected: {
      type: 'systemAssign',
      title: 'Assign',
      data: {
        accountPubkey: ownerPubkey,
        programId: SystemProgram.programId,
      },
    },
  },
  {
    instruction: SystemProgram.allocate({
      accountPubkey: ownerPubkey,
      space: 500,
    }),
    expected: {
      type: 'systemAllocate',
      title: 'Allocate',
      data: {
        accountPubkey: ownerPubkey,
        space: 500,
      },
    },
  },
  {
    instruction: SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports: 1000,
    }),
    expected: {
      type: 'systemTransfer',
      title: 'Transfer SOL',
      data: {
        fromPubkey,
        toPubkey,
        lamports: 1000,
      },
    },
  },
  {
    instruction: SystemProgram.nonceInitialize({
      authorizedPubkey,
      noncePubkey,
    }),
    expected: {
      type: 'systemInitializeNonceAccount',
      title: 'Initialize Nonce Account',
      data: {
        authorizedPubkey,
        noncePubkey,
      },
    },
  },
  {
    instruction: SystemProgram.nonceAdvance({
      authorizedPubkey,
      noncePubkey,
    }),
    expected: {
      type: 'systemAdvanceNonceAccount',
      title: 'Advance Nonce Account',
      data: {
        authorizedPubkey,
        noncePubkey,
      },
    },
  },
  {
    instruction: SystemProgram.nonceAuthorize({
      authorizedPubkey,
      newAuthorizedPubkey,
      noncePubkey,
    }),
    expected: {
      type: 'systemAuthorizeNonceAccount',
      title: 'Authorize Nonce Account',
      data: {
        authorizedPubkey,
        newAuthorizedPubkey,
        noncePubkey,
      },
    },
  },
  {
    instruction: SystemProgram.nonceWithdraw({
      authorizedPubkey,
      noncePubkey,
      toPubkey,
      lamports: 500,
    }),
    expected: {
      type: 'systemWithdrawNonceAccount',
      title: 'Withdraw Nonce Account',
      data: {
        authorizedPubkey,
        noncePubkey,
        toPubkey,
        lamports: 500,
      },
    },
  },
  {
    instruction: Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      programId,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey
    ),
    expected: {
      type: 'createAssociatedTokenAccount',
      title: 'Create Token Account',
      data: {
        programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      },
    },
  },
  {
    instruction: Token.createSyncNativeInstruction(TOKEN_PROGRAM_ID, toPubkey),
    expected: {
      type: 'createSyncNativeInstruction',
      title: 'Create Sync Native Account',
      data: {
        pubkey: toPubkey,
      },
    },
  },
  {
    instruction: Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      mintPubkey,
      accountPubkey,
      ownerPubkey
    ),
    expected: {
      type: 'initializeAccount',
      title: 'Initialize Account',
      data: {
        mintPubKey: mintPubkey,
        accountPubkey,
        ownerPubKey: ownerPubkey,
      },
    },
  },
  {
    instruction: Token.createInitMintInstruction(
      TOKEN_PROGRAM_ID,
      mint,
      6,
      mintAuthority,
      freezeAuthority
    ),
    expected: {
      type: 'initializeMint',
      title: 'Initialize Mint',
      data: {
        decimals: 6,
        mintAuthority,
        freezeAuthority,
        freezeAuthorityOption: 1,
      },
    },
  },
  {
    instruction: Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      fromPubkey,
      toPubkey,
      ownerPubkey,
      [],
      500
    ),
    expected: {
      type: 'transfer',
      title: 'Transfer Token',
      data: {
        sourcePubkey: fromPubkey,
        destinationPubKey: toPubkey,
        ownerPubKey: ownerPubkey,
        amount: 500,
      },
    },
  },
  {
    instruction: Token.createApproveInstruction(
      TOKEN_PROGRAM_ID,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      [],
      650
    ),
    expected: {
      type: 'approve',
      title: 'Approve',
      data: {
        amount: 650,
      },
    },
  },
  {
    instruction: Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      generateKeyPair().publicKey,
      [],
      500
    ),
    expected: {
      type: 'mintTo',
      title: 'Mint To',
      data: {
        amount: 500,
      },
    },
  },
  {
    instruction: Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      fromPubkey,
      toPubkey,
      ownerPubkey,
      []
    ),
    expected: {
      type: 'closeAccount',
      title: 'Close Account',
      data: {
        sourcePubkey: fromPubkey,
        destinationPubKey: toPubkey,
        ownerPubKey: ownerPubkey,
      },
    },
  },
  // TODO: Add more TOKEN known types.
]

const unknownTable = [
  {
    instruction: new TransactionInstruction({
      keys: [],
      programId,
    }),
  },
]

test('decodes known instructions', () => {
  Object.values(knownTable).forEach(({ instruction, expected }) => {
    const message = createTransactionMessage(instruction)
    const decodedInstructions = decodeTransactionInstructions([message])

    expect(decodedInstructions).toMatchObject([expected])
  })
})

test('decodes unknown instructions', () => {
  Object.values(unknownTable).forEach(({ instruction }) => {
    const message = createTransactionMessage(instruction)
    const decodedInstructions = decodeTransactionInstructions([message])

    expect(decodedInstructions).toEqual([
      {
        type: 'unknown',
        title: 'Unknown',
        data: {
          programId,
          rawData: Buffer.from([]),
        },
      },
    ])
  })
})
