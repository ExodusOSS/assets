import BN from 'bn.js'
import bs58 from 'bs58'
import assert from 'minimalistic-assert'

import { MEMO_PROGRAM_ID, SEED, STAKE_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from './constants.js'
import { createStakeAddress, findAssociatedTokenAddress } from './encode.js'
import { createTransferCheckedWithFeeInstruction } from './helpers/spl-token-2022.js'
import {
  createAssociatedTokenAccount,
  createCloseAccountInstruction,
  createTokenTransferInstruction,
} from './helpers/tokenTransfer.js'
import { MagicEdenEscrowProgram } from './magiceden/escrow-program.js'
import {
  Account,
  Authorized,
  Lockup,
  PublicKey,
  StakeInstruction,
  StakeProgram,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from './vendor/index.js'

class Tx {
  constructor(
    {
      from,
      to,
      amount,
      recentBlockhash,
      fee, // (Fee per Signature: 5000 lamports)
      // Tokens related:
      // pass either name or mintAddress, if both, mintAddress has priority
      tokenMintAddress,
      destinationAddressType,
      isAssociatedTokenAccountActive, // true when recipient balance !== 0
      fromTokenAddresses, // sender token addresses
      instructions,
      feePayer,
      memo,
      reference,
    } = {},
    options = {}
  ) {
    if (!instructions) {
      assert(from, 'from is required')
      assert(to, 'to is required')
      assert(amount, 'amount is required')
      assert(typeof amount === 'number', 'amount must be a number')
    }

    assert(recentBlockhash, 'recentBlockhash is required')
    if (tokenMintAddress) {
      assert(
        destinationAddressType !== undefined,
        'destinationAddressType is required when sending tokens'
      )
      assert(
        isAssociatedTokenAccountActive !== undefined,
        'isAssociatedTokenAccountActive is required when sending tokens'
      ) // needed to create the recipient account
      assert(Array.isArray(fromTokenAddresses), 'fromTokenAddresses Array is required')
      assert(fromTokenAddresses.length > 0, 'fromTokenAddresses is empty')
    }

    this.txObj = {
      from,
      to,
      amount,
      recentBlockhash,
      tokenMintAddress,
      destinationAddressType,
      isAssociatedTokenAccountActive,
      fromTokenAddresses,
      instructions,
      feePayer,
      reference,
    }

    if (tokenMintAddress) {
      // TOKEN transfer tx
      this.buildTokenTransaction(this.txObj, options)
    } else if (instructions) {
      this.buildInstructionsTransaction(this.txObj)
    } else {
      // SOL tx
      this.buildSOLtransaction(this.txObj)
    }

    // If a memo is provided, add it to the transaction before adding the transfer instruction
    if (memo) {
      this.transaction.add(
        new TransactionInstruction({
          programId: MEMO_PROGRAM_ID,
          keys: [],
          data: Buffer.from(memo, 'utf8'),
        })
      )
    }
  }

  buildSOLtransaction({ from, to, amount, recentBlockhash, feePayer, reference }) {
    const txInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(from),
      toPubkey: new PublicKey(to),
      lamports: amount,
    })

    // If reference accounts are provided, add them to the transfer instruction
    if (reference) {
      if (!Array.isArray(reference)) {
        reference = [reference]
      }

      for (const pubkey of reference) {
        txInstruction.keys.push({ pubkey, isWritable: false, isSigner: false })
      }
    }

    this.transaction = new Transaction({
      instructions: [txInstruction],
      recentBlockhash,
      feePayer: feePayer ? new PublicKey(feePayer) : undefined,
    })
  }

  buildInstructionsTransaction({ feePayer, recentBlockhash, instructions }) {
    this.transaction = new Transaction({
      feePayer: new PublicKey(feePayer),
      instructions: instructions.map((i) => ({
        programId: new PublicKey(i.programId),
        data: i.data ? Buffer.from(bs58.decode(i.data)) : Buffer.from([]),
        keys: i.keys.map((k) => ({
          ...k,
          pubkey: new PublicKey(k.pubkey),
        })),
      })),
      recentBlockhash,
    })
  }

  buildTokenTransaction(
    {
      from,
      to,
      amount,
      recentBlockhash,
      tokenMintAddress,
      destinationAddressType,
      isAssociatedTokenAccountActive,
      fromTokenAddresses,
      feePayer,
      reference,
    },
    { checkBalances = true } = {}
  ) {
    this.transaction = new Transaction({
      recentBlockhash,
      feePayer: feePayer ? new PublicKey(feePayer) : undefined,
    })
    // const isUnknown = destinationAddressType === null
    // if (isUnknown) throw new Error('Destination SOL balance cannot be zero (address not active)') // cannot initialize without knowing the owner
    const isSOLaddress = ['solana', null].includes(destinationAddressType)
    const rawTokenProgram = fromTokenAddresses[0]?.tokenProgram
    if (!rawTokenProgram) throw new Error('Cannot detect token program')
    const tokenProgram = new PublicKey(rawTokenProgram).toBase58()
    // crete account instruction
    if (isSOLaddress && !isAssociatedTokenAccountActive)
      this.transaction.add(createAssociatedTokenAccount(from, tokenMintAddress, to, tokenProgram))

    let amountLeft = amount
    let amountToSend
    let isNotEnoughBalance = false
    for (let {
      mintAddress,
      tokenAccountAddress,
      balance,
      decimals,
      feeBasisPoints,
      maximumFee,
    } of fromTokenAddresses) {
      // need to add more of this instruction until we reach the desired balance (amount) to send
      assert(mintAddress === tokenMintAddress, `Got unexpected mintAddress ${mintAddress}`)

      if (checkBalances) {
        if (amountLeft === 0) break

        balance = Number(balance)
        if (balance >= amountLeft) {
          amountToSend = amountLeft
          amountLeft = 0
        } else {
          // Not enough balance case.
          isNotEnoughBalance = true
          amountToSend = balance
          amountLeft -= amountToSend
        }
      } else {
        amountToSend = amountLeft
      }

      const dest = isSOLaddress
        ? findAssociatedTokenAddress(to, tokenMintAddress, tokenProgram)
        : to
      let tokenTransferInstruction
      if (tokenProgram === TOKEN_2022_PROGRAM_ID.toBase58()) {
        // token transfer fee
        const fee = Math.ceil((amountToSend * feeBasisPoints) / 10_000)
        const feeCharged = fee > maximumFee ? maximumFee : fee

        tokenTransferInstruction = createTransferCheckedWithFeeInstruction(
          tokenAccountAddress,
          tokenMintAddress,
          dest,
          from,
          amountToSend,
          decimals, // token decimals
          feeCharged // token fee (not SOL fee)
        )
      } else {
        tokenTransferInstruction = createTokenTransferInstruction(
          from,
          tokenAccountAddress,
          dest,
          amountToSend
        )
      }

      // If reference accounts are provided, add them to the transfer instruction
      if (reference) {
        if (!Array.isArray(reference)) {
          reference = [reference]
        }

        for (const pubkey of reference) {
          tokenTransferInstruction.keys.push({ pubkey, isWritable: false, isSigner: false })
        }
      }

      // add transfer token instruction
      this.transaction.add(tokenTransferInstruction)
    }

    assert(isNotEnoughBalance === false, `Not enough balance to send ${amount} ${tokenMintAddress}`)
  }

  static createStakeAccountTransaction({ address, amount, seed = SEED, pool, recentBlockhash }) {
    const fromPubkey = new PublicKey(address)
    const stakeAddress = createStakeAddress(address, seed)
    const stakePublicKey = new PublicKey(stakeAddress)
    const poolKey = new PublicKey(pool)

    const authorized = new Authorized(fromPubkey, fromPubkey) // staker, withdrawer
    const lockup = new Lockup(0, 0, fromPubkey) // no lockup

    // create account instruction
    const programTx = StakeProgram.createAccountWithSeed({
      fromPubkey,
      stakePubkey: stakePublicKey,
      basePubkey: fromPubkey,
      seed,
      authorized,
      lockup,
      lamports: amount, // number
    })

    // delegate funds instruction
    const delegateTx = StakeProgram.delegate({
      stakePubkey: stakePublicKey,
      authorizedPubkey: fromPubkey,
      votePubkey: poolKey, // pool vote key
    })

    return new Transaction({ recentBlockhash }).add(programTx).add(delegateTx)
  }

  static undelegate({ address, stakeAddresses, recentBlockhash }) {
    // undelegate all stake addresses
    assert(Array.isArray(stakeAddresses), 'stakeAddresses Array is required')

    const fromPubkey = new PublicKey(address)
    const transaction = new Transaction({ recentBlockhash })

    stakeAddresses.forEach((stakeAddress) => {
      const stakePublicKey = new PublicKey(stakeAddress)
      const programTx = StakeProgram.deactivate({
        stakePubkey: stakePublicKey,
        authorizedPubkey: fromPubkey,
      })
      transaction.add(programTx)
    })

    return transaction
  }

  static withdraw({ address, stakeAddresses, amount, recentBlockhash }) {
    const fromPubkey = new PublicKey(address)
    const stakeAddress = Array.isArray(stakeAddresses) ? stakeAddresses[0] : stakeAddresses
    const stakePublicKey = new PublicKey(stakeAddress)

    const transaction = StakeProgram.withdraw({
      stakePubkey: stakePublicKey,
      authorizedPubkey: fromPubkey,
      toPubkey: fromPubkey,
      lamports: amount,
    })
    transaction.recentBlockhash = recentBlockhash
    return transaction
  }

  static magicEdenInitializeEscrow({
    initializerAddress,
    initializerDepositTokenAddress,
    takerAmount,
    escrowAddress,
    escrowBump,
    recentBlockhash,
  }) {
    const initializerPubkey = new PublicKey(initializerAddress)
    const initializerDepositTokenPubkey = new PublicKey(initializerDepositTokenAddress)
    const escrowPubkey = new PublicKey(escrowAddress)

    const transaction = MagicEdenEscrowProgram.initializeEscrow({
      initializerPubkey,
      initializerDepositTokenPubkey,
      escrowPubkey,
      escrowBump,
      takerAmount: new BN(takerAmount),
    })

    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  static magicEdenCancelEscrow({
    initializerAddress,
    initializerDepositTokenAddress,
    escrowAddress,
    pdaAddress,
    recentBlockhash,
  }) {
    const initializerPubkey = new PublicKey(initializerAddress)
    const initializerDepositTokenPubkey = new PublicKey(initializerDepositTokenAddress)
    const escrowPubkey = new PublicKey(escrowAddress)
    const pdaPubkey = new PublicKey(pdaAddress)

    const transaction = MagicEdenEscrowProgram.cancelEscrow({
      initializerPubkey,
      initializerDepositTokenPubkey,
      escrowPubkey,
      pdaPubkey,
    })

    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  static magicEdenExchange({
    expectedTakerAmount,
    expectedMintAddress,
    takerAddress,
    initializerAddress,
    initializerDepositTokenAddress,
    escrowAddress,
    pdaAddress,
    metadataAddress,
    creators,
    recentBlockhash,
  }) {
    const expectedMintPubkey = new PublicKey(expectedMintAddress)
    const takerPubkey = new PublicKey(takerAddress)
    const initializerPubkey = new PublicKey(initializerAddress)
    const initializerDepositTokenPubkey = new PublicKey(initializerDepositTokenAddress)
    const escrowPubkey = new PublicKey(escrowAddress)
    const pdaPubkey = new PublicKey(pdaAddress)
    const metadataPubkey = new PublicKey(metadataAddress)

    const transaction = MagicEdenEscrowProgram.exchange({
      expectedTakerAmount: new BN(expectedTakerAmount),
      expectedMintPubkey,
      takerPubkey,
      initializerPubkey,
      initializerDepositTokenPubkey,
      escrowPubkey,
      pdaPubkey,
      metadataPubkey,
      creators,
    })

    transaction.recentBlockhash = recentBlockhash

    return transaction
  }

  static sign(tx, privateKey, extraSigners = []) {
    if (!privateKey) throw new Error('Please provide a secretKey')
    const signers = [new Account(privateKey), ...extraSigners]

    let transaction = tx
    if (tx instanceof Tx) transaction = tx.transaction

    transaction.sign(...signers)
    if (!transaction.signature) {
      throw new Error('!signature') // should never happen
    }
  }

  serialize() {
    const wireTransaction = this.transaction.serialize()
    return wireTransaction.toString('base64')
  }

  static serialize(tx) {
    let transaction = tx
    if (tx instanceof Tx) transaction = tx.transaction
    return transaction.serialize().toString('base64')
  }

  static decodeStakingTx(serialized) {
    // as base64
    const wireTransaction = Buffer.from(serialized, 'base64')

    let tx
    try {
      tx = Transaction.from(wireTransaction) // Transaction instance
    } catch {
      // versioned transaction
      return null
    }

    const txId = bs58.encode(tx.signature)

    const stakingInstructions = tx.instructions.filter(
      (ix) => ix.programId.toString() === STAKE_PROGRAM_ID.toString()
    )
    const isStakingTx = stakingInstructions.length > 0

    if (!isStakingTx) return null // normal transfer tx

    const info = {
      txId,
      owner: tx.getFeePayer().toString(), // SOL sender
    }
    return stakingInstructions.reduce((info, ix) => {
      const type = StakeInstruction.decodeInstructionType(ix)
      switch (type) {
        case 'Delegate':
          info.type = 'Delegate'
          info.stakeAddress = (ix?.keys?.[0]?.pubkey ?? '').toString()
          info.validator = (ix?.keys?.[1]?.pubkey ?? '').toString() // pool
          return info

        case 'Deactivate': // undelegate
          info.type = 'Deactivate'
          info.stakeAddress = (ix?.keys?.[0]?.pubkey ?? '').toString()
          // TODO: could have multiple addresses undelegating
          return info

        case 'Withdraw':
          info.type = 'Withdraw'
          info.stakeAddress = (ix?.keys?.[0]?.pubkey ?? '').toString()
          const { lamports, toPubkey } = StakeInstruction.decodeWithdraw(ix)
          info.to = toPubkey.toString()
          info.lamports = lamports.toString()
          return info

        default:
          // skip unknown instruction type
          return info
      }
    }, info)
  }

  getTxId() {
    if (!this.transaction.signature) {
      throw new Error('Cannot get txId, tx is not signed')
    }

    return bs58.encode(this.transaction.signature)
  }

  static getTxId(tx) {
    let transaction = tx
    if (tx instanceof Tx) transaction = tx.transaction
    if (!transaction.signature) {
      throw new Error('Cannot get txId, tx is not signed')
    }

    return bs58.encode(transaction.signature)
  }

  static createCloseAccount({ programId, tokenPublicKey, walletPublicKey, recentBlockhash }) {
    const tx = new Transaction()
    tx.add(createCloseAccountInstruction({ programId, tokenPublicKey, walletPublicKey }))
    tx.feePayer = walletPublicKey
    tx.recentBlockhash = recentBlockhash

    return tx
  }
}

export default Tx
