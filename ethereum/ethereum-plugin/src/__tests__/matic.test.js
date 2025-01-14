import assetPlugin from '../index.js'
import { stakingServerFactory } from '../staking/polygon/api.js'
import { mainnetContracts as contracts } from '../staking/polygon/contracts/index.js'
import assets from './assets.js'

const { currency: polygonCurrency } = assets.polygon

describe('Matic Staking', () => {
  const asset = assets.polygon
  const { server } = assetPlugin.createAsset({ assetClientInterface: Object.create(null) })

  test('Should get valid address of contracts', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    expect(staking.validatorShareContract.address).toBe(
      '0xf30cf4ed712d3734161fdaab5b1dbb49fd2d0e5c'
    )
    expect(staking.stakingManagerContract.address).toBe(
      '0x5e3ef299fddf15eaa0432e6e66473ace8c13d908'
    )
  })

  test('Can decode input of approve method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.approveStakeManager(polygonCurrency.baseUnit('100000000'))
    const { method, values } = staking.validatorShareContract.decodeInput(txInput)
    expect(method).toBe('increaseAllowance')
    expect(values).toEqual(['0x5e3ef299fddf15eaa0432e6e66473ace8c13d908', '100000000'])
  })

  test('Can decode input of delegate method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.delegate({
      amount: polygonCurrency.baseUnit('100000000'),
    })
    const { method, values } = staking.validatorShareContract.decodeInput(txInput)
    expect(method).toBe('buyVoucher')
    expect(values).toEqual(['100000000', '0'])
  })

  test('Can decode input of undelegate method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.undelegate({
      amount: polygonCurrency.baseUnit('100000000'),
    })
    const decoded = staking.validatorShareContract.decodeInput(txInput)
    expect(decoded.method).toBe('sellVoucher_new')
    expect(decoded.values).toEqual(['100000000', '100000000'])
  })

  test('Can decode input of restake method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.restakeReward()
    const { method, values } = staking.validatorShareContract.decodeInput(txInput)
    expect(method).toBe('restake')
    expect(values).toEqual([])
  })

  test('Can decode input of claimUndelegatedBalance method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.claimUndelegatedBalance({
      unbondNonce: '100000000',
    })
    const { method, values } = staking.validatorShareContract.decodeInput(txInput)
    expect(method).toBe('unstakeClaimTokens_new')
    expect(values).toEqual(['100000000'])
  })

  test('Can decode input of withdrawRewards method', () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const txInput = staking.withdrawRewards()
    const { method, values } = staking.validatorShareContract.decodeInput(txInput)
    expect(method).toBe('withdrawRewards')
    expect(values).toEqual([])
  })
})
