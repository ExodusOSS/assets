import { isNumberUnit } from '@exodus/currency'
import { estimateGasLimit, stakingProviderClientFactory } from '@exodus/ethereum-api'
import BN from 'bn.js'

export function stakingServiceFactory({ assetClientInterface, server, stakingServer }) {
  const stakingProvider = stakingProviderClientFactory()

  function amountToCurrency({ asset, amount }) {
    return isNumberUnit(amount) ? amount : asset.currency.parse(amount)
  }

  async function getStakeAssets() {
    const { polygon: asset, ethereum: feeAsset } = await assetClientInterface.getAssetsForNetwork({
      baseAssetName: 'ethereum', // Polygon token lives in ETH network
    })
    return { asset, feeAsset }
  }

  async function approveDelegateAmount({ walletAccount, amount } = {}) {
    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    amount = amountToCurrency({ asset, amount })

    const txApproveData = await stakingServer.approveStakeManager(amount)
    const { gasPrice, gasLimit, fee } = await estimateTxFee(
      delegatorAddress,
      asset.contracts.TOKEN_CONTRACT,
      txApproveData
    )

    return prepareAndSendTx({
      walletAccount,
      waitForConfirmation: true,
      to: asset.contracts.TOKEN_CONTRACT,
      txData: txApproveData,
      gasPrice,
      gasLimit,
      fee,
    })
  }

  async function delegate({ walletAccount, amount } = {}) {
    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    amount = amountToCurrency({ asset, amount })

    // const txApproveData = await stakingServer.approveStakeManager(amount)
    // let { gasPrice, gasLimit, fee } = await estimateTxFee(
    //   delegatorAddress,
    //   contracts.TOKEN_CONTRACT,
    //   txApproveData
    // )
    // await prepareAndSendTx({
    //   walletAccount,
    //   waitForConfirmation: true,
    //   to: contracts.TOKEN_CONTRACT,
    //   txData: txApproveData,
    //   gasPrice,
    //   gasLimit,
    //   fee,
    // })

    const txDelegateData = await stakingServer.delegate({ amount })
    const { gasPrice, gasLimit, fee } = await estimateTxFee(
      delegatorAddress,
      asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txDelegateData
    )

    const txId = await prepareAndSendTx({
      walletAccount,
      to: asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txData: txDelegateData,
      gasPrice,
      gasLimit,
      fee,
    })

    await stakingProvider.notifyStaking({
      txId,
      asset: asset.name,
      delegator: delegatorAddress,
      amount: amount.toBaseString(),
    })

    return txId
  }

  async function undelegate({ walletAccount, amount } = {}) {
    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    amount = amountToCurrency({ asset, amount })

    const txUndelegateData = await stakingServer.undelegate({ amount })
    const { gasPrice, gasLimit, fee } = await estimateTxFee(
      delegatorAddress.toLowerCase(),
      asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txUndelegateData
    )
    return prepareAndSendTx({
      walletAccount,
      to: asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txData: txUndelegateData,
      gasPrice,
      gasLimit,
      fee,
    })
  }

  async function claimRewards({ walletAccount } = {}) {
    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    const txWithdrawRewardsData = await stakingServer.withdrawRewards()
    const { gasPrice, gasLimit, fee } = await estimateTxFee(
      delegatorAddress,
      asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txWithdrawRewardsData
    )
    return prepareAndSendTx({
      walletAccount,
      to: asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txData: txWithdrawRewardsData,
      gasPrice,
      gasLimit,
      fee,
    })
  }

  async function claimUndelegatedBalance({ walletAccount, unbondNonce } = {}) {
    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    const { currency } = asset
    const unstakedClaimInfo = await fetchUnstakedClaimInfo({
      stakingServer,
      delegator: delegatorAddress,
    })

    const { unclaimedUndelegatedBalance } = await getUnstakedUnclaimedInfo({
      stakingServer,
      currency,
      delegator: delegatorAddress,
      ...unstakedClaimInfo,
    })

    const txClaimUndelegatedData = await stakingServer.claimUndelegatedBalance({ unbondNonce })
    const { gasPrice, gasLimit, fee } = await estimateTxFee(
      delegatorAddress,
      asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txClaimUndelegatedData
    )
    const txId = await prepareAndSendTx({
      walletAccount,
      to: asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      txData: txClaimUndelegatedData,
      gasPrice,
      gasLimit,
      fee,
    })

    await stakingProvider.notifyUnstaking({
      txId,
      asset: asset.name,
      delegator: delegatorAddress,
      amount: unclaimedUndelegatedBalance.toBaseString(),
    })

    return txId
  }

  async function estimateDelegateOperation({ walletAccount, operation, args }) {
    const delegateOperation = stakingServer[operation]

    if (!delegateOperation) {
      return
    }

    const { asset } = await getStakeAssets()
    const address = await assetClientInterface.getReceiveAddress({
      assetName: asset.name,
      walletAccount,
    })
    const delegatorAddress = address.toLowerCase()

    const { amount } = args
    if (amount) {
      args = { ...args, amount: amountToCurrency({ asset, amount }) }
    }

    const operationTxData = await delegateOperation({ ...args, walletAccount })
    const { fee } = await estimateTxFee(
      delegatorAddress,
      asset.contracts.EVERSTAKE_VALIDATOR_CONTRACT_ADDR,
      operationTxData
    )

    return fee
  }

  /**
   * Estimating delegete tx using {estimateGasLimit} function does not work
   * as the execution reverts (due to missing MATIC approval).
   * Instead, a fixed gas limit is use, which is:
   *
   * delegateGasLimit = ERC20ApproveGas + delegateGas
   *
   * This is just for displaying purposes and it's just an aproximation of the delegate gas cost,
   * NOT the real fee cost
   */
  async function estimateDelegateTxFee() {
    // approx gas limits
    const { feeAsset } = await getStakeAssets()
    const erc20ApproveGas = 4900
    const delegateGas = 240_000
    const gasPrice = parseInt(await server.gasPrice(), 16)
    const extraPercentage = 20

    const gasLimit = erc20ApproveGas + delegateGas
    const gasLimitWithBuffer = new BN(gasLimit)
      .imuln(100 + extraPercentage)
      .idivn(100)
      .toString()

    const fee = new BN(gasLimitWithBuffer).mul(new BN(gasPrice))

    return {
      gasLimit: gasLimitWithBuffer,
      gasPrice,
      fee: feeAsset.currency.baseUnit(fee.toString()),
    }
  }

  async function estimateTxFee(from, to, txInput, gasPrice = '0x0') {
    const { feeAsset } = await getStakeAssets()

    const amount = feeAsset.currency.ZERO
    const gasLimit = await estimateGasLimit(
      feeAsset,
      from,
      to,
      amount, // staking contracts does not require ETH amount to interact with
      txInput,
      gasPrice
    )

    if (gasPrice === '0x0') {
      gasPrice = await server.gasPrice()
    }

    gasPrice = parseInt(gasPrice, 16)
    const fee = new BN(gasPrice).mul(new BN(gasLimit))

    return {
      gasLimit,
      gasPrice: feeAsset.currency.baseUnit(gasPrice),
      fee: feeAsset.currency.baseUnit(fee.toString()),
    }
  }

  async function prepareAndSendTx({
    walletAccount,
    to,
    txData: txInput,
    gasPrice,
    gasLimit,
    fee,
    waitForConfirmation = false,
  } = {}) {
    const { asset, feeAsset } = await getStakeAssets()

    const sendTxArgs = {
      asset: feeAsset,
      walletAccount,
      address: to,
      amount: feeAsset.currency.ZERO,
      // used in desktop,
      // remove once, txSend is unified
      receiver: {
        address: to,
        amount: feeAsset.currency.ZERO,
      },
      options: {
        shouldLog: true,
        txInput,
        gasPrice,
        gasLimit,
        feeAmount: fee,
      },
      waitForConfirmation,
    }

    const { txId } = await asset.api.sendTx(sendTxArgs)

    return txId
  }

  const getStakingInfo = getPolygonStakingInfo({ assetClientInterface, stakingServer })

  return {
    approveDelegateAmount,
    delegate,
    undelegate,
    claimRewards,
    claimUndelegatedBalance,
    getStakingInfo,
    estimateDelegateTxFee,
    estimateDelegateOperation,
  }
}

async function fetchUnstakedClaimInfo({ stakingServer, delegator }) {
  const [unbondNonce, withdrawalDelay, currentEpoch, withdrawExchangeRate] = await Promise.all([
    stakingServer.getCurrentUnbondNonce(delegator),
    stakingServer.getWithdrawalDelay(),
    stakingServer.getCurrentCheckpoint(),
    stakingServer.getWithdrawExchangeRate(),
  ])

  return {
    unbondNonce,
    withdrawalDelay,
    currentEpoch,
    withdrawExchangeRate,
  }
}

function calculateUnclaimedTokens({
  currency,
  exchangeRatePrecision,
  withdrawExchangeRate,
  shares,
  canClaimUndelegatedBalance,
  isUndelegateInProgress,
}) {
  // see contract implementation
  // https://github.com/maticnetwork/contracts/blob/1eb6960e511a967c15d4936904570a890d134fa6/contracts/staking/validatorShare/ValidatorShare.sol#L304
  if (canClaimUndelegatedBalance || isUndelegateInProgress) {
    const unclaimedTokens = withdrawExchangeRate
      .mul(shares) // shares === validator tokens
      .div(exchangeRatePrecision)
      .toString()

    return currency.baseUnit(unclaimedTokens)
  }

  return currency.ZERO
}

function canClaimUndelegatedBalance({ shares, withdrawEpoch, isUndelegateInProgress }) {
  const undelegateNotStarted = shares.isZero() && withdrawEpoch.isZero()
  return !(isUndelegateInProgress || undelegateNotStarted)
}

async function getUnstakedUnclaimedInfo({
  stakingServer,
  currency,
  delegator,
  unbondNonce,
  currentEpoch,
  withdrawalDelay,
  withdrawExchangeRate,
}) {
  const { withdrawEpoch, shares } = await stakingServer.getUnboundInfo(delegator, unbondNonce)
  const exchangeRatePrecision = stakingServer.EXCHANGE_RATE_PRECISION
  const isUndelegateInProgress =
    !withdrawEpoch.isZero() && withdrawEpoch.add(withdrawalDelay).gte(currentEpoch)
  const isUndelegatedBalanceClaimable = canClaimUndelegatedBalance({
    shares,
    withdrawEpoch,
    isUndelegateInProgress,
  })
  const unclaimedUndelegatedBalance = calculateUnclaimedTokens({
    currency,
    exchangeRatePrecision,
    withdrawExchangeRate,
    shares,
    canClaimUndelegatedBalance: isUndelegatedBalanceClaimable,
    isUndelegateInProgress,
  })
  return {
    isUndelegateInProgress,
    canClaimUndelegatedBalance: isUndelegatedBalanceClaimable,
    unclaimedUndelegatedBalance,
  }
}

async function fetchRewardsInfo({ stakingServer, delegator, currency }) {
  const [minRewardsToWithdraw, rewardsBalance] = await Promise.all([
    stakingServer.getMinRewardsToWithdraw(),
    stakingServer.getLiquidRewards(delegator),
  ])
  const withdrawable = rewardsBalance.sub(minRewardsToWithdraw).gte(currency.ZERO)
    ? rewardsBalance
    : currency.ZERO

  return {
    rewardsBalance,
    minRewardsToWithdraw,
    withdrawable,
  }
}

export function getPolygonStakingInfo({ assetClientInterface, stakingServer }) {
  return async function ({ address }) {
    const { polygon: asset } = await assetClientInterface.getAssetsForNetwork({
      baseAssetName: 'ethereum', // Polygon token lives in ETH network
    })
    const { currency } = asset
    const delegator = address.toLowerCase()
    const [
      delegatedBalance,
      { rewardsBalance, minRewardsToWithdraw, withdrawable },
      { unbondNonce, withdrawalDelay, currentEpoch, withdrawExchangeRate },
    ] = await Promise.all([
      stakingServer.getTotalStake(delegator),
      fetchRewardsInfo({ stakingServer, delegator, currency }),
      fetchUnstakedClaimInfo({ stakingServer, delegator }),
    ])
    const minDelegateAmount = currency.defaultUnit(1)
    const isDelegating = !delegatedBalance.isZero

    const unclaimedUndelegatedInfo = await getUnstakedUnclaimedInfo({
      stakingServer,
      currency,
      delegator,
      unbondNonce,
      currentEpoch,
      withdrawalDelay,
      withdrawExchangeRate,
    })

    return {
      rewardsBalance,
      withdrawable,
      unbondNonce,
      isDelegating,
      delegatedBalance,
      minRewardsToWithdraw,
      minDelegateAmount,
      ...unclaimedUndelegatedInfo,
    }
  }
}
