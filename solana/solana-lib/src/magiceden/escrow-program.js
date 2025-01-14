import { MAGIC_EDEN_ESCROW_PROGRAM_ID, SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants.js'
import { PublicKey, Transaction } from '../vendor/index.js'
import { encodeData } from './coders.js'

const PLATFORM_FEES_PROGRAM_ID = new PublicKey('2NZukH2TXpcuZP4htiuT8CFxcaQSWzkkR6kepSWnZ24Q')

export const MagicEdenEscrowProgram = {
  get programId() {
    return MAGIC_EDEN_ESCROW_PROGRAM_ID
  },

  get space() {
    return 80
  },

  initializeEscrow(params) {
    const {
      initializerPubkey,
      initializerDepositTokenPubkey,
      escrowPubkey,
      escrowBump,
      takerAmount,
    } = params

    const transaction = new Transaction()

    return transaction.add({
      keys: [
        {
          pubkey: initializerPubkey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: initializerDepositTokenPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: escrowPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSTEM_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.programId,
      data: encodeData('initializeEscrow', { takerAmount, escrowBump }),
    })
  },

  cancelEscrow(params) {
    const { initializerPubkey, initializerDepositTokenPubkey, pdaPubkey, escrowPubkey } = params

    return new Transaction().add({
      keys: [
        {
          pubkey: initializerPubkey,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: initializerDepositTokenPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pdaPubkey,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: escrowPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: this.programId,
      data: encodeData('cancelEscrow'),
    })
  },

  exchange(params) {
    const {
      expectedTakerAmount,
      expectedMintPubkey,
      takerPubkey,
      initializerDepositTokenPubkey,
      initializerPubkey,
      escrowPubkey,
      pdaPubkey,
      metadataPubkey,
      creators,
    } = params

    const remainingAccounts = creators.map((c) => ({
      pubkey: new PublicKey(c.address),
      isWritable: true,
      isSigner: false,
    }))

    return new Transaction().add({
      keys: [
        {
          pubkey: takerPubkey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: initializerDepositTokenPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: initializerPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: escrowPubkey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: pdaPubkey,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SYSTEM_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: PLATFORM_FEES_PROGRAM_ID,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: metadataPubkey,
          isSigner: false,
          isWritable: false,
        },
        ...remainingAccounts,
      ],
      programId: this.programId,
      data: encodeData('exchange', {
        expectedTakerAmount,
        expectedMint: expectedMintPubkey.toBuffer(),
      }),
    })
  },
}
