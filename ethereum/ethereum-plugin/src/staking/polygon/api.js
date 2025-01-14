import { fromHexToBN, fromHexToString, splitIn32BytesArray } from '@exodus/ethereum-api'
import { createContract } from '@exodus/ethereum-lib'
import { bufferToHex } from '@exodus/ethereumjs/util'
import { retry } from '@exodus/simple-retry'
import BN from 'bn.js'

import { mainnetContracts } from './contracts/index.js'

const RETRY_DELAYS = ['10s']

class StakingServer {
  constructor({ asset, server, contracts = mainnetContracts }) {
    this.asset = asset
    // harcoded exchange rate from the validator share contract
    // in order to calculate claim unstake amount off-chain
    this.EXCHANGE_RATE_PRECISION = new BN(10).pow(new BN(29))
    this.validatorShareContract = createContract(
      contracts.VALIDATOR_SHARES_CONTRACT_ADDR,
      'maticValidatorShare'
    )
    this.stakingManagerContract = createContract(
      contracts.STAKING_MANAGER_ADDR,
      'maticStakingManager'
    )
    this.polygonContract = createContract(contracts.TOKEN_CONTRACT, 'polygon')
    this.server = server
  }

  #buildTxData = (contract, method, ...args) => {
    return contract[method].build(...args)
  }

  #callReadFunctionContract = (contract, method, ...args) => {
    const callData = this.#buildTxData(contract, method, ...args)
    const data = {
      data: bufferToHex(callData),
      to: contract.address,
      tag: 'latest',
    }

    const eth = this.server
    return retry(eth.ethCall, { delayTimesMs: RETRY_DELAYS })(data)
  }

  getWithdrawalDelay = async () => {
    const withdrawalDelay = await this.#callReadFunctionContract(
      this.stakingManagerContract,
      'withdrawalDelay'
    )
    return fromHexToBN(withdrawalDelay)
  }

  getMinRewardsToWithdraw = async () => {
    const minRewardsToWithdraw = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'minAmount'
    )
    return this.asset.currency.baseUnit(minRewardsToWithdraw)
  }

  /**
   * A checkpoint is an epoch value that increments in the contract, every epoch is
   * stored in a list and points the events that happened in that epoch. (timeline)
   */
  getCurrentCheckpoint = async () => {
    const currentEpoch = await this.#callReadFunctionContract(this.stakingManagerContract, 'epoch')
    return fromHexToBN(currentEpoch)
  }

  /**
   * Unbond is a struct in the staking contract that holds the number of shares and
   * the withdrawEpoch for a delegator (used when delegators unstaked their tokens)
   * @returns {number}
   */
  getUnboundInfo = async (address, nonce) => {
    let _nonce = nonce
    if (!Number.isInteger(_nonce)) {
      _nonce = await this.getCurrentUnbondNonce(address)
    }

    const unboundInfo = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'unbonds_new',
      address,
      _nonce
    )

    const [shares, withdrawEpoch] = splitIn32BytesArray(unboundInfo)
    return {
      withdrawEpoch: fromHexToBN(withdrawEpoch),
      shares: fromHexToBN(shares),
    }
  }

  /**
   * UnbondNonce is a counter stored in the contract that tracks each time a delegator unstakes
   * @param address delegator address
   * @returns current unbonded nonce
   */
  getCurrentUnbondNonce = async (address) => {
    const unbondNonce = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'unbondNonces',
      address
    )
    return parseInt(unbondNonce, 16)
  }

  getLiquidRewards = async (address) => {
    const liquidRewards = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'getLiquidRewards',
      address
    )
    return this.asset.currency.baseUnit(liquidRewards)
  }

  getTotalStake = async (address) => {
    const stakeInfo = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'getTotalStake',
      address
    )
    const [amount] = splitIn32BytesArray(stakeInfo)
    return this.asset.currency.baseUnit(fromHexToString(amount))
  }

  getWithdrawExchangeRate = async () => {
    const withdrawExchangeRate = await this.#callReadFunctionContract(
      this.validatorShareContract,
      'withdrawExchangeRate'
    )

    return fromHexToBN(withdrawExchangeRate)
  }

  /**
   * Approves StakeManager contract for withdrawing {amount} in Matic tokens
   * when users stakes.
   * This function needs to be called before calling delegate function so that staking
   * can properly work
   * This also partially address the front running attack on ERC20 approve function:
   * https://github.com/OpenZeppelin/openzeppelin-contracts/blob/f959d7e4e6ee0b022b41e5b644c79369869d8411/contracts/token/ERC20/ERC20.sol#L165-L206
   * @param amount Matic tokens to be approved for StakeManager to withdraw (polygon currency)
   */
  approveStakeManager = (amount) => {
    return this.#buildTxData(
      this.polygonContract,
      'increaseAllowance',
      this.stakingManagerContract.address,
      amount.toBaseString()
    )
  }

  restakeReward = () => {
    return this.#buildTxData(this.validatorShareContract, 'restake')
  }

  withdrawRewards = () => {
    return this.#buildTxData(this.validatorShareContract, 'withdrawRewards')
  }

  delegate = ({ amount }) => {
    return this.#buildTxData(this.validatorShareContract, 'buyVoucher', amount.toBaseString(), '0')
  }

  undelegate = ({ amount, maximumSharesToBurn }) => {
    const _maximumSharesToBurn = maximumSharesToBurn || amount
    return this.#buildTxData(
      this.validatorShareContract,
      'sellVoucher_new',
      amount.toBaseString(),
      _maximumSharesToBurn.toBaseString()
    )
  }

  /**
   * @param {number} unbondNonce the unbond nonce from where delegator claim its staked tokens
   */
  claimUndelegatedBalance = ({ unbondNonce }) => {
    return this.#buildTxData(this.validatorShareContract, 'unstakeClaimTokens_new', unbondNonce)
  }
}

export const stakingServerFactory = ({ asset, contracts, server }) =>
  new StakingServer({ asset, contracts, server })
