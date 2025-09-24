import { fetchival } from '@exodus/fetch'
import {
  createUnsignedTx,
  deserializeTransaction,
  findAssociatedTokenAddress,
  parseTxBuffer,
  prepareForSigning,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  verifyOnlyFeePayerChanged,
} from '@exodus/solana-lib'
import assert from 'minimalistic-assert'

const CU_FOR_COMPUTE_BUDGET_INSTRUCTIONS = 300
const TOKEN_ACCOUNT_CREATION_SIZE = 165 // size of the token account

export const createUnsignedTxForSend = async ({
  api,
  asset,
  feeData,
  toAddress,
  fromAddress,
  amount,
  reference,
  memo,
  nft,
  feePayerApiUrl,
  useFeePayer = true,
  // token related
  tokenStandard,
  customMintAddress,
  // staking
  method,
  stakeAddresses,
  accounts,
  seed,
  pool,
  // <MagicEden>
  initializerAddress,
  initializerDepositTokenAddress,
  takerAmount,
  escrowAddress,
  escrowBump,
  pdaAddress,
  takerAddress,
  expectedTakerAmount,
  expectedMintAddress,
  metadataAddress,
  creators,
  // </MagicEden>
  isExchange,
}) => {
  assert(api, 'api is required')
  assert(asset, 'asset is required')
  assert(feeData, 'feeData is required')
  let tokenParams = Object.create(null)
  const baseAsset = asset.baseAsset

  if (nft) {
    const [, nftAddress] = nft.id.split(':')
    customMintAddress = nftAddress
    tokenStandard = nft.tokenStandard
    method = tokenStandard === 4 ? 'metaplexTransfer' : undefined
    amount = asset.currency.baseUnit(1)
  }

  const isToken = asset.assetType === api.tokenAssetType

  // Check if receiver has address active when sending tokens.
  if (isToken) {
    // check address mint is the same
    const targetMint = await api.getAddressMint(toAddress) // null if it's a SOL address
    if (targetMint && targetMint !== asset.mintAddress) {
      const err = new Error('Wrong Destination Wallet')
      err.mintAddressMismatch = true
      throw err
    }
  } else {
    // sending SOL
    const addressType = await api.getAddressType(toAddress)
    if (addressType === 'token') {
      const err = new Error('Destination Wallet is a Token address')
      err.wrongAddressType = true
      throw err
    }
  }

  if (isToken || customMintAddress) {
    const tokenMintAddress = customMintAddress || asset.mintAddress
    const tokenProgramPublicKey =
      (await api.getAddressType(tokenMintAddress)) === 'token-2022'
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID

    const tokenProgram = tokenProgramPublicKey.toBase58()
    const tokenAddress = findAssociatedTokenAddress(toAddress, tokenMintAddress, tokenProgram)

    const [destinationAddressType, isAssociatedTokenAccountActive, fromTokenAccountAddresses] =
      await Promise.all([
        api.getAddressType(toAddress),
        api.isAssociatedTokenAccountActive(tokenAddress),
        api.getTokenAccountsByOwner(fromAddress),
      ])

    const changedOwnership = await api.ataOwnershipChangedCached(toAddress, tokenAddress)
    if (changedOwnership) {
      const err = new Error('Destination ATA changed ownership')
      err.ownershipChanged = true
      throw err
    }

    const fromTokenAddresses = fromTokenAccountAddresses.filter(
      ({ mintAddress }) => mintAddress === tokenMintAddress
    )

    tokenParams = {
      tokenMintAddress,
      destinationAddressType,
      isAssociatedTokenAccountActive,
      fromTokenAddresses,
      tokenStandard,
      tokenProgram,
    }
  }

  const stakingParams = {
    method,
    stakeAddresses,
    accounts,
    seed,
    pool,
  }

  const recentBlockhash = await api.getRecentBlockHash()

  const magicEdenParams = {
    method,
    initializerAddress,
    initializerDepositTokenAddress,
    takerAmount,
    escrowAddress,
    escrowBump,
    pdaAddress,
    takerAddress,
    expectedTakerAmount,
    expectedMintAddress,
    metadataAddress,
    creators,
  }

  const unsignedTx = createUnsignedTx({
    asset,
    from: fromAddress,
    to: toAddress,
    amount,
    recentBlockhash,
    reference,
    memo,
    useFeePayer,
    ...tokenParams,
    ...stakingParams,
    ...magicEdenParams,
  })

  const resolveUnitConsumed = async () => {
    // this avoids unnecessary simulations. Also the simulation fails with InsufficientFundsForRent when sending all.
    if (asset.name === asset.baseAsset.name && amount && !nft && !method) {
      return 150 + CU_FOR_COMPUTE_BUDGET_INSTRUCTIONS
    }

    const transactionForFeeEstimation = await maybeAddFeePayer({
      unsignedTx,
      feePayerApiUrl,
      assetName: asset.baseAsset.name,
    })
    const message = transactionForFeeEstimation.txMeta.usedFeePayer
      ? deserializeTransaction(transactionForFeeEstimation.txData.transactionBuffer).message
      : prepareForSigning(transactionForFeeEstimation).message

    const { unitsConsumed, err } = await api.simulateUnsignedTransaction({
      message,
    })
    if (err) {
      // we use this method to compute unitsConsumed
      // we can throw error here and fallback to ~0.025 SOL or estimate fee based on the method
      console.log('error getting units consumed:', err)
      if (!unitsConsumed) throw new Error(err)
    }

    return unitsConsumed + CU_FOR_COMPUTE_BUDGET_INSTRUCTIONS
  }

  const priorityFee = feeData.priorityFee
  let computeUnits
  if (priorityFee) {
    const unitsConsumed = await resolveUnitConsumed()
    computeUnits = unitsConsumed * feeData.computeUnitsMultiplier
    unsignedTx.txData.priorityFee = priorityFee
    unsignedTx.txData.computeUnits = computeUnits
  }

  unsignedTx.txMeta.stakingParams = stakingParams

  // we add token account creation fee
  let tokenCreationFee = asset.feeAsset.currency.ZERO
  if (isToken && (!unsignedTx.txData.isAssociatedTokenAccountActive || isExchange)) {
    tokenCreationFee = asset.feeAsset.currency.baseUnit(
      await api.getMinimumBalanceForRentExemption(TOKEN_ACCOUNT_CREATION_SIZE)
    )
  }

  const fee = feeData.baseFee
    .add(
      asset.feeAsset.currency
        .baseUnit(unsignedTx.txData.priorityFee ?? 0)
        .mul(unsignedTx.txData.computeUnits ?? 0)
        .div(1_000_000) // micro lamports to lamports
    )
    .add(tokenCreationFee)

  // serialization friendlier
  unsignedTx.txMeta.fee = fee.toBaseNumber()

  const rentExemptValue = await api.getRentExemptionMinAmount(toAddress)
  const rentExemptAmount = baseAsset.currency.baseUnit(rentExemptValue)

  // differentiate between SOL and Solana token
  let isEnoughForRent = false
  if (asset.name === baseAsset.name && !nft) {
    // sending SOL
    isEnoughForRent = amount.gte(rentExemptAmount)
  } else {
    // sending token/nft
    const baseAssetBalance = await api.getBalance(fromAddress)
    isEnoughForRent = baseAsset.currency
      .baseUnit(baseAssetBalance)
      .sub(fee || asset.feeAsset.currency.ZERO)
      .gte(rentExemptAmount)
  }

  const tx = await maybeAddFeePayer({
    unsignedTx,
    feePayerApiUrl,
    assetName: asset.baseAsset.name,
  })

  if (!isEnoughForRent && !tx.txMeta.usedFeePayer) {
    const err = new Error('Sending SOL amount is too low to cover the rent exemption fee.')
    err.rentExemptAmount = true
    throw err
  }

  return tx
}

export const extractTxLogData = async ({ unsignedTx, api }) => {
  if (!unsignedTx.txData.transactionBuffer) {
    return {
      method: unsignedTx.txData.method,
      from: unsignedTx.txData.from,
      to: unsignedTx.txData.to,
      amount: unsignedTx.txData.amount,
      stakingParams: unsignedTx.txMeta.stakingParams,
      usedFeePayer: unsignedTx.txMeta.usedFeePayer,
      fee: unsignedTx.txMeta.fee,
    }
  }

  const txData = await parseTxBuffer(unsignedTx.txData.transactionBuffer, api)
  return {
    ...txData,
    stakingParams: unsignedTx.txMeta.stakingParams,
    usedFeePayer: unsignedTx.txMeta.usedFeePayer,
    fee: unsignedTx.txMeta.fee,
  }
}

export const maybeAddFeePayer = async ({ unsignedTx, feePayerApiUrl, assetName }) => {
  let unsignedTxWithFeePayer = unsignedTx
  let newFeePayer = false
  if (feePayerApiUrl && unsignedTx.txMeta.useFeePayer !== false) {
    try {
      const unsignedTxVersionedTransaction = prepareForSigning(unsignedTx)

      const { transaction: newTransactionString } = await fetchival(
        new URL(feePayerApiUrl).toString()
      ).post({
        assetName,
        transaction: Buffer.from(unsignedTxVersionedTransaction.serialize()).toString('base64'),
      })

      const newTransactionBuffer = Buffer.from(newTransactionString, 'base64')
      const newTransaction = deserializeTransaction(newTransactionBuffer)

      verifyOnlyFeePayerChanged(unsignedTxVersionedTransaction, newTransaction)

      unsignedTxWithFeePayer = {
        txData: {
          transactionBuffer: newTransactionBuffer,
        },
        txMeta: unsignedTx.txMeta,
      }
      newFeePayer = true
    } catch (err) {
      console.log('error adding a new fee payer, sending original transaction', err)
    }
  }

  unsignedTxWithFeePayer.txMeta.usedFeePayer = newFeePayer

  return unsignedTxWithFeePayer
}
