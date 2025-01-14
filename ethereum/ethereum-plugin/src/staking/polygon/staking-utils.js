import assert from 'minimalistic-assert'

import { mainnetContracts, methodIds as methodIds_ } from './contracts/index.js'
import { txFiltersFactory } from './tx-filters/index.js'

/**
 * Used in ethereum-hooks to extract the final tx amount and the staking type
 *
 * tx.amount is altered for staking txs
 *
 * - amount is set to ZERO
 * - rewards are derived from the tx (only applicable to Polygon. Ethereum has more complicated rewards distribution)
 * -
 */
function getStakingTxDetailsFactory({
  isDelegateTx,
  isUndelegateTx,
  isClaimUndelegateTx,
  decodeStakingTxAmount,
  calculateRewardsFromStakeTx,
}) {
  return function ({ tx, currency }) {
    if (
      ['delegate', 'undelegate', 'claimUndelegate'].some((stakingType) => tx.data?.[stakingType]) &&
      tx.coinAmount.isZero
    ) {
      return
    }

    const txAmount = tx.coinAmount.toDefaultString()

    if (isDelegateTx(tx)) {
      const delegate = currency.baseUnit(decodeStakingTxAmount(tx)).toDefaultString()
      // MATIC returned in unstake tx is always reward
      const rewards = calculateRewardsFromStakeTx({ tx, currency })
      return { delegate, txAmount, ...(rewards ? { rewards } : {}) }
    }

    if (isUndelegateTx(tx)) {
      const undelegate = currency.baseUnit(decodeStakingTxAmount(tx)).toDefaultString()
      // MATIC returned in unstake tx is always reward
      const rewards = txAmount
      return { undelegate, txAmount, rewards }
    }

    if (isClaimUndelegateTx(tx)) {
      return { claimUndelegate: txAmount, txAmount }
    }

    // not a staking tx
  }
}

const calculateRewardsFromStakeTxFactory =
  ({ decodeStakingTxAmount }) =>
  ({ tx, currency }) => {
    const stakedAmount = currency.baseUnit(decodeStakingTxAmount(tx))
    const { rewards } = tx.data
    // stake tx might have rewards in it,
    // i.e: https://etherscan.io/tx/0x0a81d266109034a3a70c6f1b9601c105d8caebbd0de652a0619344f9559ae4fa
    // thus rewards = txInputAmount(amount to stake) - tx.coinAmount
    // tx.coinAmount is already computed from monitor; incoming - outgoing ERC20 token txs
    const stakeTxContainsReward = !stakedAmount.equals(tx.coinAmount.abs())

    if (rewards) {
      // cache rewards
      return currency.defaultUnit(rewards)
    }

    if (stakeTxContainsReward) {
      const txAmount = stakedAmount.sub(tx.coinAmount.abs()).abs()
      // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only -- TODO: Fix this the next time the file is edited.
      return txAmount.toDefaultString()
    }
  }

const decodeStakingTxAmountFactory =
  ({ validatorShareContract }) =>
  (tx) => {
    const {
      data: { data: txInput },
    } = tx

    const {
      values: [amount], // stake or unstake amount
    } = validatorShareContract.decodeInput(txInput)

    return amount
  }

export const txUtilsFactory = ({
  stakingServer,
  contracts = mainnetContracts,
  methodIds = methodIds_,
}) => {
  assert(stakingServer, 'stakingServer is required')

  const { isDelegateTx, isUndelegateTx, isClaimUndelegateTx, getStakingTxLogFilter } =
    txFiltersFactory({ contracts, methodIds })

  const { validatorShareContract } = stakingServer
  const decodeStakingTxAmount = decodeStakingTxAmountFactory({ validatorShareContract })
  const calculateRewardsFromStakeTx = calculateRewardsFromStakeTxFactory({ decodeStakingTxAmount })

  const getStakingTxDetails = getStakingTxDetailsFactory({
    isDelegateTx,
    isUndelegateTx,
    isClaimUndelegateTx,
    decodeStakingTxAmount,
    calculateRewardsFromStakeTx,
  })

  return {
    getStakingTxLogFilter,
    getStakingTxDetails,
  }
}
