/* eslint-disable camelcase */
import { walletTester } from '@exodus/assets-testing'
import { isNumberUnit } from '@exodus/currency'
import {
  createEthereumStakingService,
  createPolygonStakingService as createMaticStakingService,
  MaticStakingApi,
} from '@exodus/ethereum-api'
import assert from 'minimalistic-assert'

import { createEthereumNoHistoryServerDescribe } from './__utils__/index.js'

jest.setTimeout(60 * 60 * 1000)

const describe = createEthereumNoHistoryServerDescribe({
  port: 8547,
})

const createMockStakingProvider = () => ({
  notifyStaking: () => {},
  notifyUnstaking: () => {},
})

const serializeEthereumStakingInfo = (ethereumStakingInfo) =>
  Object.fromEntries(
    Object.entries(ethereumStakingInfo)
      .filter(([_, v]) => isNumberUnit(v))
      .map(([k, v]) => [k, v.toBaseString()])
  )

const getMaticToken = async ({ asset }) => {
  const tokens = await asset.api.getTokens()
  const matic = tokens.find((e) => e.name === 'polygon')
  assert(matic)

  // HACK: Not sure why this asset isn't connected?
  Object.assign(matic, { baseAsset: asset })
  return matic
}

const expectFeeDataSensitiveWarn = () => {
  const warn = console.warn

  // HACK: Ensure we don't detect any `feeData` related errors.
  console.warn = (...args) => {
    expect(args[0]).not.toEqual(
      'The evm staking service was not explicitly passed `feeData`. This can result in transaction nondeterminism.'
    )
    return warn(...args)
  }

  const reset = () => void (console.warn = warn)
  return { reset }
}

const createWatchTx =
  ({ baseAsset }) =>
  async (txId) => {
    while (!(await baseAsset.server.getTransactionReceipt(txId)));
  }

describe(
  'ethereum staking service integration tests',
  async ({
    TYPE_UINT128_MAX,
    assetName,
    assetPlugin,
    setBalance,
    startNoHistoryMonitor,
    resetFork,
    getEthLikeTokenAddressOrThrow,
    getForkAccount,
    getStorageAt,
    setStorageAt,
  }) => {
    // Ensures staking operations continue to complete successfully
    // whilst we transition between staking clients choosing to either
    // specify, or not specify, a source of `feeData`.
    const feeDataAgnosticEthereumStakeAndUnstakePendingTests = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
      feeData = null,
    }) => {
      await resetFork({ asset })

      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await setBalance({
        asset,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: asset.currency.parse('100 ETH'),
      })

      const { stopNoHistoryMonitor } = await startNoHistoryMonitor({
        asset,
        assetClientInterface,
        walletAccount,
      })

      const ethereumStakingService = createEthereumStakingService({
        asset,
        assetClientInterface,
        stakingProvider: createMockStakingProvider(),
        createWatchTx,
      })

      const amountToStake = asset.currency.parse('11.8246079651 ETH')

      await ethereumStakingService.delegate({
        walletAccount,
        amount: amountToStake,
        feeData,
      })

      const ethereumStakingInfo = await ethereumStakingService.getEthereumStakingInfo({
        address: walletAddress,
        asset,
        server: asset.server,
      })

      // Using the app's logic, we should be able to unstake the
      // activeStakedBalance.add(pendingBalance) when the value
      // is greater than `0.1 ether`:
      // https://github.com/ExodusMovement/exodus-mobile/blob/51cce2c26ddb2bb42c366a83b0d08cecc13d0db9/src/screens/Wallet/staking/StakingEthereum.js#L496C12-L496C51
      const amountToUnstake = ethereumStakingInfo.activeStakedBalance.add(
        ethereumStakingInfo.pendingBalance
      )
      expect(amountToUnstake.toDefaultString()).toBe('0.100009999964601403')

      expect(serializeEthereumStakingInfo(ethereumStakingInfo)).toStrictEqual({
        rewardsBalance: '0',
        activeStakedBalance: '33131369464604457',
        delegatedBalance: '11824607965100000000',
        pendingBalance: '66878630499996946',
        pendingDepositedBalance: '11724597965135398597',
        minDelegateAmount: '100000000000000000',
        unclaimedUndelegatedBalance: '0',
      })

      await ethereumStakingService.undelegate({ walletAccount, amount: amountToUnstake, feeData })
      await stopNoHistoryMonitor()
    }

    const walletTesterTest_stakeAndUnstakePendingEthereumWithoutExplicitFeeData = async (
      walletTesterProps
    ) => feeDataAgnosticEthereumStakeAndUnstakePendingTests({ ...walletTesterProps })

    const walletTesterTest_stakeAndUnstakePendingEthereumWithExplicitFeeData = async ({
      assetClientInterface,
      ...walletTesterProps
    }) => {
      const { reset } = expectFeeDataSensitiveWarn()

      await feeDataAgnosticEthereumStakeAndUnstakePendingTests({
        ...walletTesterProps,
        assetClientInterface,
        feeData: await assetClientInterface.getFeeData({ assetName }),
      })

      return reset()
    }

    const walletTesterTest_dealMatic = async ({
      asset,
      assetClientInterface,
      addressesCollector,
      walletAccounts,
    }) => {
      const [matic, { walletAccount, walletAddress }] = await Promise.all([
        getMaticToken({ asset }),
        getForkAccount({
          addressesCollector,
          walletAccounts,
        }),
      ])

      await setBalance({
        asset: matic,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: matic.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
      })

      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: matic })

      const {
        confirmed: { [tokenAssetAddress]: maticBalance },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(maticBalance).toString(16)).toBe(TYPE_UINT128_MAX.toString(16))
    }

    const feeDataAgnosticMaticStakeAndUnstakePendingTests = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
      feeData = null,
    }) => {
      await resetFork({ asset })

      const [matic, { walletAccount, walletAddress }] = await Promise.all([
        getMaticToken({ asset }),
        getForkAccount({
          addressesCollector,
          walletAccounts,
        }),
      ])

      const { stopNoHistoryMonitor } = await startNoHistoryMonitor({
        asset,
        assetClientInterface,
        walletAccount,
      })

      const amountToDelegate = matic.currency.parse('1000000 base')

      await Promise.all([
        setBalance({
          asset: matic,
          assetClientInterface,
          walletAddress,
          walletAccount,
          amount: amountToDelegate,
        }),
        setBalance({
          asset,
          assetClientInterface,
          walletAddress,
          walletAccount,
          amount: asset.currency.parse('1000 ETH'),
        }),
      ])

      const maticStakingService = createMaticStakingService({
        assetClientInterface,
        stakingProvider: createMockStakingProvider(),
        createWatchTx,
        asset,
      })

      // Attempt estimation for various `feeData` configurations.
      await Promise.all(
        (feeData ? [{ feeData }] : [undefined, {}]).map((args) =>
          maticStakingService.estimateDelegateTxFee(args)
        )
      )

      await maticStakingService.estimateDelegateOperation({
        walletAccount,
        operation: 'delegate',
        args: { amount: amountToDelegate },
        feeData,
      })

      await maticStakingService.delegate({
        walletAccount,
        amount: amountToDelegate,
        feeData,
      })

      expect(
        serializeEthereumStakingInfo(
          await maticStakingService.getPolygonStakingInfo({
            address: walletAddress,
            asset: matic,
            server: matic.server,
          })
        )
      ).toStrictEqual({
        rewardsBalance: '0',
        withdrawable: '0',
        delegatedBalance: amountToDelegate.toBaseString(),
        activeStakedBalance: amountToDelegate.toBaseString(),
        minRewardsToWithdraw: '1000000000000000000',
        minDelegateAmount: '1000000000000000000',
        unclaimedUndelegatedBalance: '0',
      })

      const undelegateEstimatedFee = await maticStakingService.estimateDelegateOperation({
        walletAccount,
        operation: 'undelegate',
        args: { amount: amountToDelegate },
        feeData,
      })

      const undelegateBalanceBefore = BigInt(await asset.server.getBalance(walletAddress))
      await maticStakingService.undelegate({
        walletAccount,
        amount: amountToDelegate,
        feeData,
        waitForConfirmation: true,
      })
      const undelegateBalanceAfter = BigInt(await asset.server.getBalance(walletAddress))
      const realizedUndelegationFee = asset.currency.parse(
        `${(undelegateBalanceBefore - undelegateBalanceAfter).toString()} wei`
      )

      expect(undelegateEstimatedFee.gt(realizedUndelegationFee)).toBeTrue()

      expect(
        serializeEthereumStakingInfo(
          await maticStakingService.getPolygonStakingInfo({
            address: walletAddress,
            asset: matic,
            server: matic.server,
          })
        )
      ).toStrictEqual({
        rewardsBalance: '0',
        withdrawable: '0',
        delegatedBalance: '0',
        activeStakedBalance: '0',
        minRewardsToWithdraw: '1000000000000000000',
        minDelegateAmount: '1000000000000000000',
        // we need to claim
        unclaimedUndelegatedBalance: amountToDelegate.toBaseString(),
      })

      const { unbondNonce } = await maticStakingService.getPolygonStakingInfo({
        address: walletAddress,
        asset: matic,
      })

      const [withdrawalDelay, currentEpoch] = await Promise.all([
        getStorageAt({
          asset,
          address: MaticStakingApi.STAKING_MANAGER_ADDR,
          slot: BigInt(8),
        }),
        getStorageAt({
          asset,
          address: MaticStakingApi.STAKING_MANAGER_ADDR,
          slot: BigInt(9),
        }),
      ])

      const elapsedEpoch = BigInt(withdrawalDelay) + BigInt(currentEpoch)

      // HACK: Simulate the unstaking delay; this will allow us to
      //       claim our undelegated balance.
      await setStorageAt({
        asset,
        address: MaticStakingApi.STAKING_MANAGER_ADDR,
        slot: BigInt(9),
        word: elapsedEpoch,
      })

      const claimEstimatedFee = await maticStakingService.estimateDelegateOperation({
        walletAccount,
        operation: 'claimUndelegatedBalance',
        args: {
          unbondNonce,
        },
        feeData,
      })

      const claimBalanceBefore = BigInt(await asset.server.getBalance(walletAddress))
      await maticStakingService.claimUndelegatedBalance({ walletAccount, unbondNonce, feeData })
      const claimBalanceAfter = BigInt(await asset.server.getBalance(walletAddress))

      const realizedClaimFee = asset.currency.parse(
        `${(claimBalanceBefore - claimBalanceAfter).toString()} wei`
      )

      expect(claimEstimatedFee.gt(realizedClaimFee)).toBeTrue()

      return stopNoHistoryMonitor()
    }

    const walletTesterTest_stakeAndUnstakePendingMaticWithoutExplicitFeeData = (
      walletTesterProps
    ) => feeDataAgnosticMaticStakeAndUnstakePendingTests({ ...walletTesterProps })

    const walletTesterTest_stakeAndUnstakePendingMaticWithExplicitFeeData = async ({
      assetClientInterface,
      ...walletTesterProps
    }) => {
      const { reset } = expectFeeDataSensitiveWarn()
      await feeDataAgnosticMaticStakeAndUnstakePendingTests({
        ...walletTesterProps,
        assetClientInterface,
        feeData: await assetClientInterface.getFeeData({ assetName }),
      })
      return reset()
    }

    walletTester({
      assetPlugin,
      assetName,
      seed: 'test test test test test test test test test test test junk',
      expectedAddresses: {
        ethereum_44_exodus_0_0_0: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
      walletAccountCount: 1,
      availableAssetNames: ['ethereum', 'polygon'],
      tests: {
        walletTesterTest_stakeAndUnstakePendingEthereumWithoutExplicitFeeData,
        walletTesterTest_stakeAndUnstakePendingEthereumWithExplicitFeeData,
        walletTesterTest_dealMatic,
        walletTesterTest_stakeAndUnstakePendingMaticWithoutExplicitFeeData,
        walletTesterTest_stakeAndUnstakePendingMaticWithExplicitFeeData,
      },
    })
  },
  { blockNumber: 22_216_186 }
)
