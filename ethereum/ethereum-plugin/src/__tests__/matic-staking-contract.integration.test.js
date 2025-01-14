import assetPlugin from '../index.js'
import { stakingServerFactory } from '../staking/polygon/api.js'
import { mainnetContracts as contracts } from '../staking/polygon/contracts/index.js'
import assets from './assets.js'

jest.setTimeout(30_000)

describe('Matic Staking', () => {
  const asset = assets.polygon
  const { server } = assetPlugin.createAsset({ assetClientInterface: Object.create(null) })

  test('Can get current checkpoint', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })

    const res = await staking.getCurrentCheckpoint()
    expect(res.gte(33_267)).toEqual(true)
  })

  test('Can decode input of getWithdrawalDelay method', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const result = await staking.getWithdrawalDelay()
    expect(result.isZero()).toBe(false)
  })

  test('Can decode input of getMinRewardsToWithdraw method', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const result = await staking.getMinRewardsToWithdraw()
    expect(result.isZero).toBe(false)
  })

  test('Can decode input of getCurrentCheckpoint method', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const result = await staking.getCurrentCheckpoint()
    expect(result.isZero()).toBe(false)
  })

  test('Can decode input of getWithdrawExchangeRate method', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const result = await staking.getWithdrawExchangeRate()
    expect(result.isZero()).toBe(false)
  })

  test('Can get current unbond-info of a specific address', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const address = '0xde997f975bb8ccecf7dfb6e5725cdc9a2cd3e86d'
    const { withdrawEpoch, shares } = await staking.getUnboundInfo(address)

    expect(withdrawEpoch.isZero()).toEqual(true)
    expect(shares.isZero()).toEqual(true)
  })

  test('Can get current unbond-info of a specific address', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const address = '0xde997f975bb8ccecf7dfb6e5725cdc9a2cd3e86d'
    const unbondNonce = await staking.getCurrentUnbondNonce(address)

    expect(unbondNonce).toEqual(1)
  })

  test('Can get current liquid-rewards of a specific address', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    const address = '0xde997f975bb8ccecf7dfb6e5725cdc9a2cd3e86d'
    const result = await staking.getLiquidRewards(address)
    expect(result.toBaseString()).toEqual('0')
  })

  test('Can get current total staked amount of a specific address', async () => {
    const staking = stakingServerFactory({ asset, contracts, server })
    // tx: https://etherscan.io/tx/0xa1a7364e356d67fe6ad739095636665bcb9b02deefa5e9fa2bece1c6fe57d305
    const address = '0x602eb409cbfcf133cf51eca3f678c087921fbc56'
    const result = await staking.getTotalStake(address)
    expect(result.toBaseString()).toEqual('76760345650000000000')
  })
})
