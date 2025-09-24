export function createUnsignedTx({
  asset,
  from,
  to,
  amount,
  fee,
  feeData,
  recentBlockhash,
  useFeePayer,
  // Tokens related:
  tokenMintAddress,
  destinationAddressType,
  isAssociatedTokenAccountActive, // true when recipient balance !== 0
  fromTokenAddresses, // sender token addresses
  tokenStandard,
  tokenProgram,
  // Program interactions:
  method,
  // Staking related:
  stakeAddresses,
  accounts,
  seed,
  pool,
  // MagicEden escrow/related:
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
  // Wallet Connect
  instructions,
  feePayer,
}) {
  return {
    txData: {
      from,
      to,
      amount: amount ? amount.toBaseNumber() : null,
      fee: fee ? fee.toBaseNumber() : null,
      fixedFee: feeData ? feeData.fee.toBaseNumber() : null,
      recentBlockhash,
      // Tokens related:
      tokenMintAddress,
      destinationAddressType,
      isAssociatedTokenAccountActive,
      fromTokenAddresses,
      tokenStandard,
      tokenProgram,
      // Staking related:
      method,
      stakeAddresses,
      accounts,
      seed,
      pool,
      // MagicEden escrow/related:
      initializerAddress,
      initializerDepositTokenAddress,
      takerAmount: takerAmount ? takerAmount.toBaseString() : null,
      escrowAddress,
      escrowBump,
      pdaAddress,
      expectedTakerAmount: expectedTakerAmount ? expectedTakerAmount.toBaseString() : null,
      expectedMintAddress,
      takerAddress,
      metadataAddress,
      creators,
      // Wallet Connect
      instructions,
      feePayer,
    },
    txMeta: {
      assetName: asset.name,
      useFeePayer,
    },
  }
}
