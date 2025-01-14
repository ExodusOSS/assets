import { estimateGasLimit } from '@exodus/ethereum-api'
import { createAndSignTxFactory } from '@exodus/ethereum-lib'
import { bufferToHex, privateToAddress } from '@exodus/ethereumjs/util'
import BN from 'bn.js'

import assetPlugin from '../index.js'
import { stakingServerFactory } from '../staking/polygon/api.js'
import { mainnetContracts as contracts } from '../staking/polygon/contracts/index.js'
import assets from './assets.js'

jest.setTimeout(600_000)

const feeAsset = assetPlugin.createAsset({ assetClientInterface: Object.create(null) })
const asset = assets.polygon
const server = feeAsset.server

const PRIVATE_KEY = '' // fill in your private key, but do not commit it

const DELAY_BETWEEN_TXS = 80_000

const SUBTRACT_FEE_PERCENTAGE = 30

const createAndSignTx = createAndSignTxFactory({ chainId: 1 })
describe('Integration tests Matic Staking', () => {
  // tests run with address https://etherscan.io/address/0x4120bcf06eb02564aad5e938a76ef82ad6196d63
  const delegatorPrivateKey = Buffer.from(PRIVATE_KEY, 'hex')
  const delegatorAddress =
    PRIVATE_KEY && `0x${privateToAddress(delegatorPrivateKey).toString('hex')}`

  const wei = new BN(10).pow(new BN(18))
  const stakeAmount = new BN(10).mul(wei).toString()
  const currencyStakeAmount = asset.currency.baseUnit(stakeAmount)

  test.skip('should stake the given amount of tokens', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })

    // approve staking manager to withdraw delegator's amount (amount to be staked)
    const approveTxData = staking.approveStakeManager(currencyStakeAmount)

    const approveTxDataEncoded = bufferToHex(approveTxData)
    let nonce = await server.getTransactionCount(delegatorAddress)
    let gasPrice = await server.gasPrice()
    let gasLimit = await estimateGasLimit(
      feeAsset,
      delegatorAddress,
      asset.contract?.current?.toLowerCase(),
      feeAsset.currency.ZERO,
      approveTxDataEncoded
    )

    const { rawTx: approveRawTx } = await createAndSignTx(
      {
        asset,
        fromAddress: delegatorAddress,
        nonce: parseInt(nonce, 16),
        gasLimit,
        // sub some amount since fees are quite high estimating with exodus node
        // the amount subtracted is considering the current gas fees in explorer (just a bit higher than the average)
        gasPrice: feeAsset.currency.baseUnit(subtractPercentageFee(gasPrice)),
        txInput: approveTxDataEncoded,
      },
      delegatorPrivateKey
    )

    await server.sendRawTransaction(approveRawTx.toString('hex'))

    await delay(DELAY_BETWEEN_TXS)

    // stake delegator amount
    const delegateTxData = staking.delegate({ amount: currencyStakeAmount })
    const delegateTxDataEncoded = bufferToHex(delegateTxData)
    const everstakeValidatorContractAddr = staking.validatorShareContract.address

    nonce = await server.getTransactionCount(delegatorAddress)
    gasPrice = await server.gasPrice()

    gasLimit = await estimateGasLimit(
      feeAsset,
      delegatorAddress,
      everstakeValidatorContractAddr,
      feeAsset.currency.ZERO,
      delegateTxDataEncoded
    )

    const { rawTx: delegateRawTX } = await createAndSignTx(
      {
        asset: feeAsset,
        fromAddress: delegatorAddress,
        address: everstakeValidatorContractAddr,
        amount: feeAsset.currency.ZERO,
        nonce: parseInt(nonce, 16),
        gasLimit,
        // sub some amount since fees are quite high estimating with exodus node
        // the amount subtracted is considering the current gas fees in explorer (just a bit higher than the average)
        gasPrice: feeAsset.currency.baseUnit(subtractPercentageFee(gasPrice)),
        txInput: delegateTxDataEncoded,
      },
      delegatorPrivateKey
    )

    await server.sendRawTransaction(delegateRawTX.toString('hex'))

    await delay(DELAY_BETWEEN_TXS)

    const liquidRewardsAfterWithdraw = await staking.getLiquidRewards(delegatorAddress)
    expect(liquidRewardsAfterWithdraw && liquidRewardsAfterWithdraw.isZero).toEqual(true)
  })

  test.skip('should claim rewards', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const everstakeValidatorContractAddr = staking.validatorShareContract.address
    const liquidRewards = await staking.getLiquidRewards(delegatorAddress)

    expect(!(liquidRewards && liquidRewards.isZero)).toEqual(true)

    const txData = staking.withdrawRewards()
    const txDataEncoded = bufferToHex(txData)

    const nonce = await server.getTransactionCount(delegatorAddress)
    const gasPrice = await server.gasPrice()
    const gasLimit = await estimateGasLimit(
      feeAsset,
      delegatorAddress, // from
      everstakeValidatorContractAddr, // to
      feeAsset.currency.ZERO,
      txDataEncoded
    )

    const { rawTx } = await createAndSignTx(
      {
        asset: feeAsset,
        fromAddress: delegatorAddress,
        address: everstakeValidatorContractAddr, // to
        amount: feeAsset.currency.ZERO,
        nonce: parseInt(nonce, 16),
        gasLimit,
        gasPrice: feeAsset.currency.baseUnit(subtractPercentageFee(gasPrice)),
        txInput: txDataEncoded,
      },
      delegatorPrivateKey
    )

    await server.sendRawTransaction(rawTx.toString('hex'))

    await delay(DELAY_BETWEEN_TXS)

    const liquidRewardsAfterWithdraw = await staking.getLiquidRewards(delegatorAddress)
    expect(!(liquidRewardsAfterWithdraw && liquidRewardsAfterWithdraw.isZero)).toEqual(true)
  })

  test.skip('should unstake amount and withdraw rewards', async () => {
    // exit from staking using sell voucher (sell shares)
    const staking = stakingServerFactory({ asset, contracts, server })
    const everstakeValidatorContractAddr = staking.validatorShareContract.address
    const amountStaked = await staking.getTotalStake(delegatorAddress)

    const undelegateTxData = staking.undelegate({
      amount: asset.currency.baseUnit(amountStaked.toBaseString()),
    })
    const undelegateTxDataEncoded = bufferToHex(undelegateTxData)

    let nonce = await server.getTransactionCount(delegatorAddress)
    let gasPrice = await server.gasPrice()
    let gasLimit = await estimateGasLimit(
      feeAsset,
      delegatorAddress, // from
      everstakeValidatorContractAddr, // to
      feeAsset.currency.ZERO,
      undelegateTxDataEncoded
    )

    const { rawTx: undelegateRawTx } = await createAndSignTx(
      {
        asset: feeAsset,
        fromAddress: delegatorAddress,
        address: everstakeValidatorContractAddr, // to
        amount: feeAsset.currency.ZERO,
        nonce: parseInt(nonce, 16),
        gasLimit,
        // sub some amount since fees are quite high estimating with exodus node
        // the amount subtracted is considering the current gas fees in explorer (just a bit higher than the average)
        gasPrice: feeAsset.currency.baseUnit(subtractPercentageFee(gasPrice)),
        txInput: undelegateTxDataEncoded,
      },
      delegatorPrivateKey
    )

    await server.sendRawTransaction(undelegateRawTx.toString('hex'))

    await delay(DELAY_BETWEEN_TXS)

    // claim staked tokens
    const unbondedNonce = await staking.getCurrentUnbondNonce(delegatorAddress)
    const claimStakeTxData = staking.claimUndelegatedBalance({ unbondedNonce })
    const claimStakeTxDataEncoded = bufferToHex(claimStakeTxData)

    nonce = await server.getTransactionCount(delegatorAddress)
    gasPrice = await server.gasPrice()
    gasLimit = await estimateGasLimit(
      feeAsset,
      delegatorAddress, // from
      everstakeValidatorContractAddr, // to
      feeAsset.currency.ZERO,
      claimStakeTxDataEncoded
    )

    const { rawTx: claimStakeRawTx } = await createAndSignTx(
      {
        asset: feeAsset,
        fromAddress: delegatorAddress,
        address: everstakeValidatorContractAddr, // to
        amount: feeAsset.currency.ZERO,
        nonce: parseInt(nonce, 16),
        gasLimit,
        // sub some amount since fees are quite high estimating with exodus node
        // the amount subtracted is considering the current gas fees in explorer (just a bit higher than the average)
        gasPrice: feeAsset.currency.baseUnit(subtractPercentageFee(gasPrice)),
        txInput: claimStakeTxDataEncoded,
      },
      delegatorPrivateKey
    )

    await server.sendRawTransaction(claimStakeRawTx.toString('hex'))

    await delay(DELAY_BETWEEN_TXS)
    const amountStakedAfterUnstake = await staking.getTotalStake(delegatorAddress)
    expect(amountStakedAfterUnstake && amountStakedAfterUnstake.isZero).toEqual(true)
  })
})

function subtractPercentageFee(actualGasPrice) {
  return new BN(parseInt(actualGasPrice, 16))
    .mul(new BN(100))
    .div(new BN(100 + SUBTRACT_FEE_PERCENTAGE))
    .toString()
}

function delay(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  })
}
