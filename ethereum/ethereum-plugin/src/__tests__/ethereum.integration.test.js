import { connectAssetsList } from '@exodus/assets'
import {
  createEthereumStakingService,
  estimateGasLimit,
  EthereumStaking,
} from '@exodus/ethereum-api'
import { getServer } from '@exodus/ethereum-api/src/exodus-eth-server/index.js'
import { createFeeData } from '@exodus/ethereum-api/src/fee-data-factory.js'
import { createAndSignTxFactory } from '@exodus/ethereum-lib'
import * as ethereumAssets from '@exodus/ethereum-meta'
import { privateToAddress } from '@exodus/ethereumjs/util'
import { hex0xStringToBuffer } from '@exodus/web3-ethereum-utils'
import delay from 'delay'

import ethereumAssetPlugin from '../index.js'

jest.setTimeout(30_000)
const DELAY_BETWEEN_TXS = 10_000

const PRIVATE_KEY = '8a84854cb97af6dae8122d5ac393445c383483b9c95b33a7e3a3d5ecb12e3077'
const delegatorPrivateKey = Buffer.from(PRIVATE_KEY, 'hex')
// address: 0x916AADb859F98f8D033b189D7e7039482F19247e
const delegatorAddress = PRIVATE_KEY && `0x${privateToAddress(delegatorPrivateKey).toString('hex')}`

const assets = connectAssetsList(ethereumAssets.assetsList)

const ethereum = assets.ethereum

const ethServer = getServer(ethereum)

const createAndSignTx = createAndSignTxFactory({ chainId: 1 })

const describeWithAci = ({ eip1559Enabled }, fn) =>
  describe(`Ethereum Staking integration tests (eip1559Enabled: ${eip1559Enabled})`, () =>
    fn({
      assetClientInterface: {
        getReceiveAddress: ({ walletAccount }) => walletAccount,
        getFeeData: async () =>
          createFeeData({
            currency: ethereum.currency,
            feeDataConfig: {
              baseFeePerGas: '5192068890 wei',
              tipGasPrice: '2000000000 wei',
              serverGasPrice: '4191879285 wei',
              eip1559Enabled,
              gasPrice: '7192068890 wei',
            },
          }),
      },
    }))

// Here we test staking operations using a variety of
// all possible pricing systems.
void [{ eip1559Enabled: false }, { eip1559Enabled: true }].map((partialFeeData) =>
  describeWithAci(partialFeeData, ({ assetClientInterface }) => {
    test('Validator creation proximity', async () => {
      const staking = new EthereumStaking(
        ethereumAssetPlugin.createAsset({
          assetClientInterface,
        })
      )

      const { activatedSlots } = await staking.getDepositEffects(
        delegatorAddress,
        ethereum.currency.defaultUnit('0.1')
      )

      expect(typeof activatedSlots).toBe('bigint')
    })

    test('Compare delegation transaction calldata', () => {
      ;[undefined, null, false].forEach((e) =>
        expect(EthereumStaking.isDelegationTransactonCalldata(e)).toBeFalse()
      )
      ;[
        '0x3a29dbae',
        '0x3A29DBAE',
        '0x3a29dbae0000000000000000000000000000000000000000000000000000000000000000',
        '0x3a29dbae0000000000000000000000000000000000000000000000000000000000000001',
        '0x3a29dbae0000000000000000000000000000000000000000000000000000000000000002',
      ].forEach((e) => expect(EthereumStaking.isDelegationTransactonCalldata(e)).toBeTrue())

      expect(
        EthereumStaking.isDelegationTransactonCalldata(hex0xStringToBuffer('0x3a29dbae'))
      ).toBeTrue()
      expect(EthereumStaking.isDelegationTransactonCalldata(Buffer.from([]))).toBeFalse()
    })

    test('getDelegateSelectAllAmount', async () => {
      const asset = ethereumAssetPlugin.createAsset({ assetClientInterface })
      const { getDelegateSelectAllAmount } = createEthereumStakingService({
        asset,
        assetClientInterface,
      })

      // Each should return a realistic fee, but not suggest a spendable amount.
      const insufficientLiquidityChecks = await Promise.all([
        getDelegateSelectAllAmount({
          walletAccount: delegatorAddress,
          spendableForStaking: asset.currency.ZERO,
        }),
        getDelegateSelectAllAmount({
          walletAccount: delegatorAddress,
          spendableForStaking:
            asset.currency.parse('99999999999999999 wei') /* 0.1 ether - 1 wei */,
        }),
        getDelegateSelectAllAmount({
          walletAccount: delegatorAddress,
          spendableForStaking: asset.currency.defaultUnit('0.1'),
        }),
        getDelegateSelectAllAmount({
          walletAccount: delegatorAddress,
          spendableForStaking: asset.currency.defaultUnit('0.101'),
        }),
      ])

      insufficientLiquidityChecks.forEach(({ calculatedFee, selectAllAmount }) => {
        expect(calculatedFee.gt(asset.currency.ZERO)).toBeTrue()
        expect(selectAllAmount.equals(asset.currency.ZERO)).toBeTrue()
      })

      const spendableForStaking = asset.currency.defaultUnit('420')

      // Should recommend realistic values for valid spendable amounts.
      const { selectAllAmount, calculatedFee } = await getDelegateSelectAllAmount({
        walletAccount: delegatorAddress,
        spendableForStaking,
      })

      expect(calculatedFee.gt(asset.currency.ZERO)).toBeTrue()
      expect(spendableForStaking.sub(calculatedFee).equals(selectAllAmount)).toBeTrue()
    })

    test.skip('Stake amount', async () => {
      const staking = new EthereumStaking(ethereum)
      // stake currencyStakeAMount to everstakePoolAddr with autocompound enabled
      const currencyStakeAmount = ethereum.currency.defaultUnit('0.1') // current min amount
      const { to, amount, data } = await staking.stake({
        amount: currencyStakeAmount,
      })
      console.log('delegateTxDataEncoded:', data)

      console.log(
        `delegator address ${delegatorAddress} trying to stake ${currencyStakeAmount.toDefaultString(
          {
            unit: true,
          }
        )}`
      )
      const nonce = await ethServer.getTransactionCount(delegatorAddress)
      const gasPrice = await ethServer.gasPrice()

      const gasLimit = await estimateGasLimit({
        asset: ethereum,
        fromAddress: delegatorAddress,
        toAddress: to,
        amount,
        data,
      })

      const { rawTx: delegateRawTX } = await createAndSignTx(
        {
          asset: ethereum,
          fromAddress: delegatorAddress,
          address: to,
          amount,
          nonce: parseInt(nonce, 16),
          gasLimit,
          // fees are quite high estimating with exodus node
          gasPrice: ethereum.currency.baseUnit(gasPrice), // eventually subtract a percentage
          txInput: data,
        },
        delegatorPrivateKey
      )

      console.log('staking tx:', delegateRawTX.toString('hex'))
      // broadcast tx
      await ethServer.sendRawTransaction(delegateRawTX.toString('hex'))

      await delay(DELAY_BETWEEN_TXS)

      // check staked balance
      const pendingBalance = await staking.pendingBalanceOf(delegatorAddress)
      console.log('pendingBalance after stake:', pendingBalance.toDefaultString({ unit: true }))
      const stakedBalance = await staking.autocompoundBalanceOf(delegatorAddress)
      console.log('stakedBalance after stake:', stakedBalance.toDefaultString({ unit: true }))
      expect(stakedBalance.isZero).toEqual(true)
    })

    // Unstake and withdraw
    test.skip('Unstake amount', async () => {
      const staking = new EthereumStaking(ethereum)
      // unstake
      const unstakeAmount = ethereum.currency.defaultUnit('0.1') // amount to unstake
      const { to, amount, data } = await staking.unstake({
        address: delegatorAddress,
        amount: unstakeAmount,
      })
      console.log('undelegateTxDataEncoded:', data)

      console.log(
        `delegator address ${delegatorAddress} trying to unstake ${unstakeAmount.toDefaultString({
          unit: true,
        })}`
      )
      const nonce = await ethServer.getTransactionCount(delegatorAddress)
      const gasPrice = await ethServer.gasPrice()

      const gasLimit = await estimateGasLimit({
        asset: ethereum,
        fromAddress: delegatorAddress,
        toAddress: to,
        amount,
        data,
      })

      const { rawTx: delegateRawTX } = await createAndSignTx(
        {
          asset: ethereum,
          fromAddress: delegatorAddress,
          address: to,
          amount,
          nonce: parseInt(nonce, 16),
          gasLimit,
          // fees are quite high estimating with exodus node
          gasPrice: ethereum.currency.baseUnit(gasPrice), // eventually subtract a percentage
          txInput: data,
        },
        delegatorPrivateKey
      )

      console.log('unstaking tx:', delegateRawTX.toString('hex'))
      // broadcast tx
      await ethServer.sendRawTransaction(delegateRawTX.toString('hex'))

      await delay(DELAY_BETWEEN_TXS)

      // check unstaked balance
      const pendingBalance = await staking.pendingBalanceOf(delegatorAddress)
      console.log('pendingBalance after unstake:', pendingBalance.toDefaultString({ unit: true }))
      const stakedBalance = await staking.autocompoundBalanceOf(delegatorAddress)
      console.log('stakedBalance after unstake:', stakedBalance.toDefaultString({ unit: true }))
      expect(pendingBalance.isZero).toEqual(true)
      expect(stakedBalance.isZero).toEqual(true)
    })

    // Unstake pending funds
    test.skip('Unstake pending funds (not yet staked to a Validator)', async () => {
      const staking = new EthereumStaking(ethereum)
      // unstake
      const pendingAmount = ethereum.currency.defaultUnit('0.1') // pending amount to unstake
      const { to, amount, data } = await staking.unstakePending({
        address: delegatorAddress,
        amount: pendingAmount,
      })
      console.log('undelegateTxDataEncoded:', data)

      console.log(
        `delegator address ${delegatorAddress} trying to unstake pending ${pendingAmount.toDefaultString(
          {
            unit: true,
          }
        )}`
      )
      const nonce = await ethServer.getTransactionCount(delegatorAddress)
      const gasPrice = await ethServer.gasPrice()

      const gasLimit = await estimateGasLimit({
        asset: ethereum,
        fromAddress: delegatorAddress,
        toAddress: to,
        amount,
        data,
      })

      const { rawTx: delegateRawTX } = await createAndSignTx(
        {
          asset: ethereum,
          fromAddress: delegatorAddress,
          address: to,
          amount,
          nonce: parseInt(nonce, 16),
          gasLimit,
          // fees are quite high estimating with exodus node
          gasPrice: ethereum.currency.baseUnit(gasPrice), // eventually subtract a percentage
          txInput: data,
        },
        delegatorPrivateKey
      )

      console.log('unstaking tx:', delegateRawTX.toString('hex'))
      // broadcast tx
      await ethServer.sendRawTransaction(delegateRawTX.toString('hex'))

      await delay(DELAY_BETWEEN_TXS)

      // check unstaked balance
      const pendingBalance = await staking.pendingBalanceOf(delegatorAddress)
      console.log(
        'pendingBalance after unstake pending:',
        pendingBalance.toDefaultString({ unit: true })
      )
      const stakedBalance = await staking.autocompoundBalanceOf(delegatorAddress)
      console.log('stakedBalance after unstake:', stakedBalance.toDefaultString({ unit: true }))
      expect(pendingBalance.isZero).toEqual(true)
    })

    // Unstake pending funds
    test.skip('Withdraw unstaked funds (removed from a Validator)', async () => {
      const staking = new EthereumStaking(ethereum)
      // claim withdraw
      const { to, amount, data } = await staking.claimWithdrawRequest({
        address: delegatorAddress,
      })
      console.log('claimWithdrawTxDataEncoded:', data)

      console.log(`delegator address ${delegatorAddress} trying to withdraw unstaked amount`)
      const nonce = await ethServer.getTransactionCount(delegatorAddress)
      const gasPrice = await ethServer.gasPrice()

      const gasLimit = await estimateGasLimit({
        asset: ethereum,
        fromAddress: delegatorAddress,
        toAddress: to,
        amount,
        data,
      })

      const { rawTx: delegateRawTX } = await createAndSignTx(
        {
          asset: ethereum,
          fromAddress: delegatorAddress,
          address: to,
          amount,
          nonce: parseInt(nonce, 16),
          gasLimit,
          // fees are quite high estimating with exodus node
          gasPrice: ethereum.currency.baseUnit(gasPrice), // eventually subtract a percentage
          txInput: data,
        },
        delegatorPrivateKey
      )

      // check ready for claim amount
      const info = await staking.withdrawRequest(delegatorAddress)
      console.log('ready for claim:', info.readyForClaim.toDefaultString({ unit: true }))
      expect(info.readyForClaim.isZero).toEqual(false)

      console.log('sending claim withdraw tx:', delegateRawTX.toString('hex'))
      // broadcast tx
      await ethServer.sendRawTransaction(delegateRawTX.toString('hex'))
    })
  })
)
