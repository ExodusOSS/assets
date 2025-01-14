import { fetchival } from '@exodus/fetch'
import assert from 'minimalistic-assert'
import ms from 'ms'

const DEFAULT_STAKING_URL = 'https://staking.a.exodus.io'
const HTTP_POST_TIMEOUT = ms('30s')

const SOLANA_VALIDATOR = '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF' // Everstake

export const stakingProviderClientFactory = (
  { defaultStakingUrl = DEFAULT_STAKING_URL } = Object.create(null)
) => {
  assert(defaultStakingUrl, 'defaultStakingUrl must be provided')
  let stakingUrl = defaultStakingUrl

  const setStakingUrl = (newStakingUrl) => {
    stakingUrl = new URL(newStakingUrl || defaultStakingUrl)
  }

  const stakingRequest = ({ asset: assetName, data }) => {
    return fetchival(stakingUrl, {
      timeout: HTTP_POST_TIMEOUT,
    })(assetName)('stake').post(data)
  }

  const notifyActionFactory = ({ type }) => {
    assert(type, '"type" is required')
    return async ({ asset: assetName, txId, delegator, amount, error }) => {
      assert(assetName, '"asset" must be provided')
      assert(SOLANA_VALIDATOR, '"invalid" validator')
      assert(txId, '"txId" is required')
      assert(delegator, '"delegator" is required')
      assert(amount, '"amount" is required')

      const stakingData = {
        asset: assetName,
        data: {
          delegator,
          actions: [
            {
              type,
              validator: SOLANA_VALIDATOR,
              amount,
              txId,
            },
          ],
        },
      }
      return stakingRequest(stakingData)
    }
  }

  const notifyStaking = notifyActionFactory({
    type: 'start',
  })

  const notifyWithdraw = notifyActionFactory({
    type: 'stop',
  })

  return {
    setStakingUrl,
    notifyStaking,
    notifyWithdraw,
  }
}
