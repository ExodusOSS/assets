import { isNumberUnit } from '@exodus/currency'
import { VersionedTransaction } from '@exodus/solana-web3.js'
import BN from 'bn.js'

import { createMetaplexTransferTransaction } from '../helpers/metaplex-transfer.js'
import Transaction from '../transaction.js'
import { ComputeBudgetProgram, PublicKey } from '../vendor/index.js'

const addPriorityFeeToTransaction = ({ transaction, priorityFee }) => {
  const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityFee,
  }) // 1 microLamport = 0.000001 lamports
  transaction.instructions.unshift(priorityFeeInstruction)
}

const addComputeBudgetToTransaction = ({ transaction, computeUnits }) => {
  const computeBudgetInstruction = ComputeBudgetProgram.setComputeUnitLimit({
    units: computeUnits,
  })
  transaction.instructions.unshift(computeBudgetInstruction)
}

const deserializeTransactionBytes = (wireTransactionBuffer) => {
  return VersionedTransaction.deserialize(Uint8Array.from(wireTransactionBuffer))
}

/**
 * Prepares the transaction to be signed (exodus & ledger).
 * @param {UnsignedTx} unsignedTx
 * @param {checkBalances?: boolean} options
 * @returns a Solana Web3.js VersionedTransaction object (supports both Legacy & Versioned transactions)
 */
export function prepareForSigning(unsignedTx, { checkBalances = true } = {}) {
  const {
    amount: unitAmount,
    fee: feeAmount,
    from,
    method,
    transaction,
    transactionBuffer,
  } = unsignedTx.txData

  // Recreate a Web3.js Transaction instance if the buffer provided.
  if (transactionBuffer) {
    return deserializeTransactionBytes(transactionBuffer)
  }

  if (!transaction) {
    // Create a transaction in web3.js format
    const address = from

    const amount = unitAmount
      ? new BN(isNumberUnit(unitAmount) ? unitAmount.toBaseString() : unitAmount).toNumber()
      : unitAmount

    const fee = feeAmount
      ? new BN(isNumberUnit(feeAmount) ? feeAmount.toBaseString() : feeAmount).toNumber()
      : feeAmount

    const txData = { ...unsignedTx.txData, address, amount, fee }

    const legacyTransaction = createTx({ txData, method, from }, { checkBalances })
    return VersionedTransaction.deserialize(
      legacyTransaction.serialize({ requireAllSignatures: false, verifySignatures: false })
    )
  }

  // unsignedTx contained a transaction in web3.js format
  return VersionedTransaction.deserialize(
    transaction.serialize({ requireAllSignatures: false, verifySignatures: false })
  )
}

const createTx = ({ txData, method, from }, options) => {
  let tx
  switch (method) {
    case 'delegate':
      tx = createDelegateTransaction(txData)
      break
    case 'undelegate':
      tx = createUndelegateTransaction(txData)
      break
    case 'withdraw':
      tx = createWithdrawTransaction(txData)
      break
    case 'closeAccount':
      tx = createCloseAccountTransaction(txData)
      break
    case 'initializeEscrow': {
      tx = createMagicEdenInitializeEscrowTransaction(txData)
      break
    }

    case 'cancelEscrow':
      tx = createMagicEdenCancelEscrowTransaction(txData)
      break
    case 'exchange':
      tx = createMagicEdenExchangeTransaction(txData)
      break
    case 'metaplexTransfer':
      tx = createMetaplexTransferTransaction(txData)
      break
    default:
      // SOL and Token tx
      tx = createTokenTransaction(txData, options)
      break
  }

  if (txData.priorityFee) {
    addPriorityFeeToTransaction({
      transaction: tx,
      priorityFee: txData.priorityFee,
    })
  }

  if (txData.computeUnits) {
    addComputeBudgetToTransaction({ transaction: tx, computeUnits: txData.computeUnits })
  }

  const publicKey = new PublicKey(from)
  if (!tx.feePayer) {
    tx.feePayer = publicKey
  }

  return tx
}

const createDelegateTransaction = ({ address, amount, pool, recentBlockhash, seed }) =>
  Transaction.createStakeAccountTransaction({
    address,
    amount,
    recentBlockhash,
    seed,
    pool,
  })

const createUndelegateTransaction = ({ address, recentBlockhash, stakeAddresses }) =>
  Transaction.undelegate({
    address,
    recentBlockhash,
    stakeAddresses,
  })

const createWithdrawTransaction = ({ address, amount, recentBlockhash, accounts }) =>
  Transaction.withdraw({
    address,
    amount,
    recentBlockhash,
    accounts,
  })

const createMagicEdenInitializeEscrowTransaction = ({
  escrowAddress,
  escrowBump,
  initializerDepositTokenAddress,
  recentBlockhash,
  takerAmount,
  initializerAddress,
}) =>
  Transaction.magicEdenInitializeEscrow({
    escrowAddress,
    escrowBump,
    initializerAddress,
    initializerDepositTokenAddress,
    recentBlockhash,
    takerAmount,
  })

const createMagicEdenCancelEscrowTransaction = ({
  escrowAddress,
  initializerAddress,
  initializerDepositTokenAddress,
  pdaAddress,
  recentBlockhash,
}) =>
  Transaction.magicEdenCancelEscrow({
    escrowAddress,
    initializerAddress,
    initializerDepositTokenAddress,
    pdaAddress,
    recentBlockhash,
  })

const createMagicEdenExchangeTransaction = ({
  creators,
  escrowAddress,
  expectedMintAddress,
  expectedTakerAmount,
  initializerAddress,
  initializerDepositTokenAddress,
  metadataAddress,
  pdaAddress,
  recentBlockhash,
  takerAddress,
}) =>
  Transaction.magicEdenExchange({
    creators,
    escrowAddress,
    expectedMintAddress,
    expectedTakerAmount,
    initializerAddress,
    initializerDepositTokenAddress,
    metadataAddress,
    pdaAddress,
    recentBlockhash,
    takerAddress,
  })

const createTokenTransaction = (
  {
    amount,
    destinationAddressType,
    fee,
    feePayer,
    from,
    fromTokenAddresses,
    instructions,
    isAssociatedTokenAccountActive,
    recentBlockhash,
    to,
    tokenMintAddress,
    memo,
    reference,
  },
  options
) =>
  new Transaction(
    {
      amount,
      destinationAddressType,
      fee,
      feePayer,
      from,
      fromTokenAddresses,
      instructions,
      isAssociatedTokenAccountActive,
      recentBlockhash,
      to,
      tokenMintAddress,
      memo,
      reference,
    },
    options
  ).transaction

const createCloseAccountTransaction = ({ account, programId, recentBlockhash, walletPublicKey }) =>
  Transaction.createCloseAccount({
    account,
    programId,
    recentBlockhash,
    walletPublicKey,
  })
