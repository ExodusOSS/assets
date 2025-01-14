import {
  createUnsignedTx,
  findAssociatedTokenAddress,
  prepareForSigning,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@exodus/solana-lib'
import assert from 'minimalistic-assert'

export const createAndBroadcastTXFactory =
  ({ api, assetClientInterface }) =>
  async ({ asset, walletAccount, address, amount, options = {} }) => {
    const assetName = asset.name
    assert(assetClientInterface, `assetClientInterface must be supplied in sendTx for ${assetName}`)

    const {
      feeAmount,
      stakeAddresses,
      seed,
      pool,
      nft,
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
      priorityFee,
      // </MagicEden>
      reference,
      memo,
    } = options

    let { method, customMintAddress, tokenStandard } = options

    const { baseAsset } = asset
    const from = await assetClientInterface.getReceiveAddress({
      assetName: baseAsset.name,
      walletAccount,
    })

    if (nft) {
      customMintAddress = nft.mintAddress
      tokenStandard = nft.tokenStandard
      method = tokenStandard === 4 ? 'metaplexTransfer' : undefined
      amount = asset.currency.baseUnit(1)
    }

    const isToken = asset.assetType === api.tokenAssetType

    // Check if receiver has address active when sending tokens.
    if (isToken) {
      // check address mint is the same
      const targetMint = await api.getAddressMint(address) // null if it's a SOL address
      if (targetMint && targetMint !== asset.mintAddress) {
        const err = new Error('Wrong Destination Wallet')
        err.reason = { mintAddressMismatch: true }
        throw err
      }
    } else {
      // sending SOL
      const addressType = await api.getAddressType(address)
      if (addressType === 'token') {
        const err = new Error('Destination Wallet is a Token address')
        err.reason = { wrongAddressType: true }
        throw err
      }
    }

    const recentBlockhash = options.recentBlockhash || (await api.getRecentBlockHash())

    const feeData = await assetClientInterface.getFeeData({ assetName })

    let tokenParams = Object.create(null)
    if (isToken || customMintAddress) {
      const tokenMintAddress = customMintAddress || asset.mintAddress
      const tokenProgramPublicKey =
        (await api.getAddressType(tokenMintAddress)) === 'token-2022'
          ? TOKEN_2022_PROGRAM_ID
          : TOKEN_PROGRAM_ID

      const tokenProgram = tokenProgramPublicKey.toBase58()
      const tokenAddress = findAssociatedTokenAddress(address, tokenMintAddress, tokenProgram)
      const [destinationAddressType, isAssociatedTokenAccountActive, fromTokenAccountAddresses] =
        await Promise.all([
          api.getAddressType(address),
          api.isAssociatedTokenAccountActive(tokenAddress),
          api.getTokenAccountsByOwner(from),
        ])

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
      seed,
      pool,
    }

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

    const unsignedTransaction = createUnsignedTx({
      asset,
      from,
      to: address,
      amount,
      fee: feeData.fee, // feeAmount includes the priortyFee
      recentBlockhash,
      feeData,
      reference,
      memo,
      ...tokenParams,
      ...stakingParams,
      ...magicEdenParams,
    })

    const transactionForFeeEstimation = prepareForSigning(unsignedTransaction)

    const { unitsConsumed: computeUnits, err } = await api.simulateUnsignedTransaction({
      message: transactionForFeeEstimation.message,
    })
    if (err) throw new Error(JSON.stringify(err))

    unsignedTransaction.txData.priorityFee = priorityFee ?? 0
    unsignedTransaction.txData.computeUnits = computeUnits * feeData.computeUnitsMultiplier

    const { txId, rawTx } = await assetClientInterface.signTransaction({
      assetName: baseAsset.name,
      unsignedTx: unsignedTransaction,
      walletAccount,
    })

    await baseAsset.api.broadcastTx(rawTx)

    const selfSend = from === address
    const isStakingTx = ['delegate', 'undelegate', 'withdraw'].includes(method)
    const coinAmount = isStakingTx
      ? amount.abs()
      : selfSend
        ? asset.currency.ZERO
        : amount.abs().negate()

    const data = isStakingTx
      ? { staking: { ...stakingParams, stake: coinAmount.toBaseNumber() } }
      : Object.create(null)
    const tx = {
      txId,
      confirmations: 0,
      coinName: assetName,
      coinAmount,
      feeAmount,
      feeCoinName: asset.feeAsset.name,
      selfSend,
      to: address,
      data,
      currencies: { [assetName]: asset.currency, [asset.feeAsset.name]: asset.feeAsset.currency },
    }
    await assetClientInterface.updateTxLogAndNotify({ assetName, walletAccount, txs: [tx] })

    if (isToken) {
      // write tx entry in solana for token fee
      const txForFee = {
        txId,
        confirmations: 0,
        coinName: baseAsset.name,
        coinAmount: baseAsset.currency.ZERO,
        tokens: [assetName],
        feeAmount,
        feeCoinName: baseAsset.feeAsset.name,
        to: address,
        selfSend,
        currencies: {
          [baseAsset.name]: baseAsset.currency,
          [baseAsset.feeAsset.name]: baseAsset.feeAsset.currency,
        },
      }
      await assetClientInterface.updateTxLogAndNotify({
        assetName: baseAsset.name,
        walletAccount,
        txs: [txForFee],
      })
    }

    return { txId }
  }
