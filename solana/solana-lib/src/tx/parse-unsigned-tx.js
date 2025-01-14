export function parseUnsignedTx({ asset, unsignedTx }) {
  const {
    from,
    to,
    recentBlockhash,
    tokenMintAddress,
    destinationAddressType,
    isAssociatedTokenAccountActive,
    fromTokenAddresses,
    method,
    stakeAddresses,
    seed,
    pool,
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
    ...txData
  } = unsignedTx.txData

  const amount = asset.currency.baseUnit(txData.amount)
  const fee = asset.currency.baseUnit(txData.fee)
  return {
    from: [from],
    to,
    amount,
    fee,
    recentBlockhash,
    // token related
    tokenMintAddress,
    destinationAddressType,
    isAssociatedTokenAccountActive,
    fromTokenAddresses,
    // staking related
    method,
    stakeAddresses,
    seed,
    pool,
    // MagicEden escrow/related:
    initializerAddress,
    initializerDepositTokenAddress,
    takerAmount: takerAmount ? asset.currency.baseUnit(takerAmount) : null,
    escrowAddress,
    escrowBump,
    pdaAddress,
    takerAddress,
    expectedTakerAmount: expectedTakerAmount ? asset.currency.baseUnit(expectedTakerAmount) : null,
    expectedMintAddress,
    metadataAddress,
    creators,
  }
}
