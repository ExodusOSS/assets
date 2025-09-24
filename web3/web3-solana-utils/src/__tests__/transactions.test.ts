import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@exodus/solana-web3.js'

import { MAX_SIGNATURES, sign } from './../signatures.js'
import {
  buildRawTransaction,
  deserializeTransaction,
  isTransactionMessage,
  serializeTransaction,
} from './../transactions.js'

// https://explorer.solana.com/block/121572737.
const recentBlockhash = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'

describe('buildRawTransaction', () => {
  const signer = Keypair.generate()

  let transaction
  let versionedTransaction
  let signData
  let versionedSignData

  beforeEach(() => {
    transaction = new Transaction({
      recentBlockhash,
      feePayer: signer.publicKey,
    })
    transaction.add(
      new TransactionInstruction({
        keys: [
          {
            isSigner: true,
            isWritable: true,
            pubkey: signer.publicKey,
          },
        ],
        programId: Keypair.generate().publicKey,
      }),
    )
    signData = transaction.serializeMessage()

    const transactionMessage = new TransactionMessage({
      recentBlockhash,
      payerKey: signer.publicKey,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: signer.publicKey,
          lamports: 1000,
        }),
      ],
    })
    const messageV0 = transactionMessage.compileToV0Message()

    versionedTransaction = new VersionedTransaction(messageV0)
    versionedSignData = Buffer.from(versionedTransaction.message.serialize())
  })

  it('serialize/deserialize legacy transaction', () => {
    const signature = sign(signData, signer.secretKey)
    const originalRawTransaction = buildRawTransaction(signData, [signature])

    const serialized = serializeTransaction(transaction)
    const deserialized = deserializeTransaction(serialized)

    expect(deserialized.version).toBe(undefined)

    const deserializedSignData = deserialized.serializeMessage()
    const signature2 = sign(deserializedSignData, signer.secretKey)
    const rawTransaction = buildRawTransaction(deserializedSignData, [
      signature2,
    ])

    expect(originalRawTransaction).toEqual(rawTransaction)
  })

  it('serialize/deserialize versioned transaction', () => {
    const signature = sign(versionedSignData, signer.secretKey)
    const originalRawTransaction = buildRawTransaction(versionedSignData, [
      signature,
    ])

    const serialized = serializeTransaction(versionedTransaction)
    const deserialized = deserializeTransaction(serialized)

    expect(deserialized.version).not.toBe(undefined)

    const deserializedSignData = Buffer.from(deserialized.message.serialize())
    const signature2 = sign(deserializedSignData, signer.secretKey)
    const rawTransaction = buildRawTransaction(deserializedSignData, [
      signature2,
    ])

    expect(originalRawTransaction).toEqual(rawTransaction)
  })

  it('returns raw transaction with valid signature (versioned tx)', () => {
    const signature = sign(versionedSignData, signer.secretKey)
    const rawTransaction = buildRawTransaction(versionedSignData, [signature])
    versionedTransaction.addSignature(signer.publicKey, signature)

    expect(rawTransaction).toEqual(
      Buffer.from(versionedTransaction.serialize()),
    )
  })

  it('returns raw transaction with valid signature (legacy tx)', () => {
    const signature = sign(signData, signer.secretKey)
    const rawTransaction = buildRawTransaction(signData, [signature])
    transaction.addSignature(signer.publicKey, signature)

    expect(rawTransaction).toEqual(transaction.serialize())
  })

  it('returns raw transaction with null signature (versioned tx)', () => {
    const rawTransaction = buildRawTransaction(versionedSignData, [null])

    expect(rawTransaction).toEqual(
      Buffer.from(versionedTransaction.serialize()),
    )
  })

  it('returns raw transaction with null signature', () => {
    const rawTransaction = buildRawTransaction(signData, [null])

    expect(rawTransaction).toEqual(
      transaction.serialize({ verifySignatures: false }),
    )
  })

  it('throws if transaction is too large', () => {
    for (let i = 0; i < 30; i++) {
      transaction.add(
        new TransactionInstruction({
          keys: [
            {
              isSigner: false,
              isWritable: true,
              pubkey: signer.publicKey,
            },
          ],
          programId: Keypair.generate().publicKey,
        }),
      )
    }

    const signatures = [signer.secretKey]

    expect(() =>
      buildRawTransaction(transaction.serializeMessage(), signatures),
    ).toThrow(/^Transaction too large/)
  })

  it('throws if too many signatures', () => {
    const signature = sign(signData, signer.secretKey)
    const signatures = Array.from({ length: MAX_SIGNATURES + 1 }).fill(
      signature,
    )

    expect(() => buildRawTransaction(signData, signatures)).toThrow(
      /^Too many signatures/,
    )
  })

  it('throws if invalid signature length', () => {
    const signature = sign(signData, signer.secretKey)

    expect(() =>
      buildRawTransaction(transaction.serializeMessage(), [
        signature,
        'invalid',
      ]),
    ).toThrow('Invalid signature length')
  })
})

describe('.isTransactionMessage()', () => {
  const signer = Keypair.generate()
  let messageLegacy = null
  let messageV0 = null

  beforeEach(() => {
    const transactionMessage = new TransactionMessage({
      recentBlockhash,
      payerKey: signer.publicKey,
      instructions: [
        SystemProgram.transfer({
          fromPubkey: signer.publicKey,
          toPubkey: signer.publicKey,
          lamports: 1000,
        }),
      ],
    })
    messageLegacy = transactionMessage.compileToLegacyMessage().serialize()
    messageV0 = transactionMessage.compileToV0Message().serialize()
  })

  it('should return true on legacy message', () => {
    expect(isTransactionMessage(messageLegacy)).toBeTruthy()
  })

  it('should return true on versioned message', () => {
    expect(isTransactionMessage(messageV0)).toBeTruthy()
  })
})
