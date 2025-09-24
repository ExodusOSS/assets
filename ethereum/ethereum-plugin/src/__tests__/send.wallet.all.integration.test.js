/* eslint-disable camelcase */
import { walletTester } from '@exodus/assets-testing'
import { createApprove, getSpendingAllowance, transactionExists } from '@exodus/ethereum-api'
import { resolveGasPrice } from '@exodus/ethereum-api/src/fee-utils.js'
import createEthereumJsTx from '@exodus/ethereum-lib/src/unsigned-tx/create-ethereumjs-tx.js'
import assert from 'minimalistic-assert'

import { createEthereumNoHistoryServerDescribe } from './__utils__/index.js'

jest.setTimeout(60 * 1000)

const describe = createEthereumNoHistoryServerDescribe({
  port: 8546,
})

const blockNumber = 22_117_723

const randomRange = ({ asset, min = Math.random(), unit = asset.currency.ETH } = {}) => {
  assert(asset)
  return {
    min: unit(min.toFixed(18)),
    max: unit((min + 1 * Math.random()).toFixed(18)),
    unit,
  }
}

const HACK_maybeRefineSendAllAmount = async ({
  amount: providedAmount,
  asset,
  assetClientInterface,
  walletAccount,
  gasLimit,
  gasPrice,
}) => {
  try {
    const { name: assetName, estimateL1DataFee } = asset

    // HACK: For the interim, we won't attempt to
    //       reconcile transaction dust on L2s due
    //       to the nondeterminism about the calldata
    //       fee.
    if (typeof estimateL1DataFee === 'function') return null

    const [txLog, accountState] = await Promise.all([
      assetClientInterface.getTxLog({
        assetName,
        walletAccount,
      }),
      assetClientInterface.getAccountState({
        assetName,
        walletAccount,
      }),
    ])

    const { spendable } = await asset.api.getBalances({ asset, txLog, accountState })
    const maxGasCost = gasPrice.mul(gasLimit)

    if (maxGasCost.gt(spendable)) throw new Error('transaction gas cost exceeds spendable balance')

    const expectedSendAllAmount = spendable.sub(maxGasCost)

    // If the client attempted to send the correct
    // amount, good job! You get a cookie!
    if (providedAmount.equals(expectedSendAllAmount)) return null

    // The client attempted to `sendAll` using the incorrect amount.
    return expectedSendAllAmount
  } catch (e) {
    console.error('failed to refine send all amount', e)
    return null
  }
}

let signTransaction = null

describe(
  'ethereum tx-send all invariant rpc tests',
  async ({
    ADDRESS_DEAD,
    TYPE_UINT256_MAX,
    assetName,
    assetPlugin,
    getStorageAt,
    mine,
    pseudoRandomAmount,
    setBalance,
    setAutomine,
    setNextBlockBaseFeePerGas,
    setStorageAt,
    getEthLikeTokenAddressOrThrow,
    getForkAccount,
  }) => {
    // HACK: Verifies that we can modify the contents
    //       of accountState for the purposes of our tests.
    //       Since we can programmatically change balances
    //       using irregular state transitions, we need to
    //       keep accountState in check.
    const walletTesterTest_checkMutableAccountState = async ({
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      Object.assign(
        await assetClientInterface.getAccountState({
          assetName,
          walletAccount,
        }),
        { __DNU__: true }
      )

      const { __DNU__ } = await assetClientInterface.getAccountState({
        assetName,
        walletAccount,
      })

      expect(__DNU__).toBeTrue()
    }

    const walletTesterTest_pseudoRandomAmount = async ({ asset }) => {
      const expectPseudoRandomWithinRange = ({ min, max, unit }) => {
        const amount = pseudoRandomAmount({ asset, min, max, unit })
        expect(amount.gte(min)).toBeTrue()
        expect(amount.lte(max)).toBeTrue()
        return amount
      }

      void Array.from({ length: 100 })
        .map(() => randomRange({ asset }))
        .map(expectPseudoRandomWithinRange)
    }

    const walletTesterTest_getBlockNumber = async ({ asset }) => {
      expect(await asset.server.blockNumber()).toBe(`0x${blockNumber.toString(16)}`)
    }

    const walletTesterTest_getBalance = async ({ asset, addressesCollector, walletAccounts }) => {
      const { walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })
      expect(await asset.server.getBalance(walletAddress)).toBe('0x21e19e0c9bab2400000')
    }

    const walletTesterTest_setBalance = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await asset.api.getBalances({
        asset,
        txLog: await assetClientInterface.getTxLog({
          assetName,
          walletAccount,
        }),
        accountState: await setBalance({
          asset,
          assetClientInterface,
          walletAccount,
          walletAddress,
          amount: asset.currency.parse('0 ETH'),
        }),
      })

      expect(await asset.server.getBalance(walletAddress)).toBe('0x0')

      const { spendable } = await asset.api.getBalances({
        asset,
        txLog: await assetClientInterface.getTxLog({
          assetName,
          walletAccount,
        }),
        accountState: await setBalance({
          asset,
          assetClientInterface,
          walletAccount,
          walletAddress,
          amount: asset.currency.parse('420 ETH'),
        }),
      })

      expect(`0x${BigInt(spendable.toBaseString()).toString(16)}`).toBe('0x16c4abbebea0100000')
      expect(await asset.server.getBalance(walletAddress)).toBe('0x16c4abbebea0100000')
    }

    const walletTesterTest_sendTx_transferToDeadAddress = async ({ asset, walletAccounts }) => {
      const [walletAccount] = Object.values(walletAccounts.getAll({ assetName }))

      const deadBalanceBefore = await asset.server.getBalance(ADDRESS_DEAD)

      const amount = asset.currency.parse('69 ETH')

      const sendTxParams = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount,
      }

      const expectedTxId = '0xf0f8d38013bf958fcc5076256f13cd079023843315e741c19c7878b724df9472'

      expect(await transactionExists({ asset, txId: expectedTxId })).toBeFalse()

      const { txId, nonce } = await asset.api.sendTx(sendTxParams)
      expect({ txId, nonce }).toEqual({
        txId: expectedTxId,
        nonce: 914,
      })

      expect(await transactionExists({ asset, txId: expectedTxId })).toBeTrue()

      const deadBalanceAfter = await asset.server.getBalance(ADDRESS_DEAD)

      expect(BigInt(deadBalanceAfter) - BigInt(deadBalanceBefore)).toBe(
        BigInt(amount.toBaseString())
      )
    }

    const walletTesterTest_sendTx_insufficientBalance = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: asset.currency.parse('0 ETH'),
      })

      await expect(
        asset.api.sendTx({
          asset,
          walletAccount,
          address: ADDRESS_DEAD,
          amount: asset.currency.parse('1 ETH'),
        })
      ).rejects.toEqual(new Error('Bad rpc response: Insufficient funds for gas * price + value'))
    }

    const walletTesterTest_sendTx_resolveNonce = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      await setAutomine({ asset, disabled: true })

      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: asset.currency.parse('100 ETH'),
      })

      const baseSendTransactionProps = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('0.1 ETH'),
        options: { tipGasPrice: asset.currency.parse('42 Gwei') },
      }

      const { nonce, txId } = await asset.api.sendTx(baseSendTransactionProps)
      expect(nonce).toBe(915)
      expect(await transactionExists({ asset, txId })).toBeTrue()

      const { nonce: nonceAfter, txId: txIdAfter } = await asset.api.sendTx({
        ...baseSendTransactionProps,
        // It should be possible to override a transaction by
        // increasing the `tipGasPrice`.
        options: { nonce, tipGasPrice: asset.currency.parse('69 Gwei') },
      })
      expect(nonceAfter).toBe(915)
      expect(await transactionExists({ asset, txId })).toBeFalse()
      expect(await transactionExists({ asset, txId: txIdAfter })).toBeTrue()

      return setAutomine({ asset })
    }

    const walletTesterTest_sendTx_bumpTx = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      await setAutomine({ asset, disabled: true })

      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: asset.currency.parse('1 ETH'),
      })

      const baseSendTransactionProps = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('0.1 ETH'),
      }

      const { nonce, txId } = await asset.api.sendTx(baseSendTransactionProps)

      expect(await asset.server.getTransactionReceipt(txId)).toBe(null)

      const { nonce: nonceAfter, txId: txIdAfter } = await asset.api.sendTx({
        ...baseSendTransactionProps,
        options: { bumpTxId: txId, nonce },
      })

      expect(nonce).toBe(nonceAfter)

      await setAutomine({ asset })

      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()
      expect(await asset.server.getTransactionReceipt(txIdAfter)).toBeTruthy()
    }

    const walletTesterTest_sendTx_sendAll = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const feeData = await asset.api.getFeeData()
      const gasPrice = asset.currency.parse(`${resolveGasPrice({ feeData }).toBaseString()} wei`)

      const walletBalance = asset.currency.parse('1 ETH')

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: walletBalance,
      })

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: walletBalance.sub(gasPrice.mul(BigInt(21_000))),
        options: { isSendAll: true },
      })

      expect(await asset.server.getBalance(walletAddress)).toBe('0x0')
    }

    const walletTesterTest_sendTx_sendAllCustomGasPrice = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const feeData = await asset.api.getFeeData()
      const gasPrice = asset.currency.parse(`${resolveGasPrice({ feeData }).toBaseString()} wei`)
      const customGasPrice = gasPrice.mul(BigInt(2))

      const walletBalance = asset.currency.parse('1 ETH')

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: walletBalance,
      })

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: walletBalance.sub(customGasPrice.mul(BigInt(21_000))),
        options: { customFee: customGasPrice, isSendAll: true },
      })

      expect(await asset.server.getBalance(walletAddress)).toBe('0x0')
    }

    const walletTesterTest_setBaseFeePerGas = async ({ asset, assetClientInterface }) => {
      const currentBaseFeePerGasBigInt = BigInt(await asset.server.getBaseFeePerGas())
      const minimumNextBlockBaseFeePerGasBigInt =
        (currentBaseFeePerGasBigInt * BigInt(875)) / BigInt(1000) + BigInt(1)

      // Assuming the `baseFeePerGas decreases to the minimum
      // in the next block:
      const nextBlockBaseFeePerGas = asset.currency.parse(
        `${minimumNextBlockBaseFeePerGasBigInt.toString()} wei`
      )

      await setNextBlockBaseFeePerGas({ asset, assetClientInterface, nextBlockBaseFeePerGas })
      await mine({ asset })

      expect(BigInt(await asset.server.getBaseFeePerGas())).toBe(
        minimumNextBlockBaseFeePerGasBigInt
      )
    }

    const walletTesterTest_sendTx_sendAll_useBaseFeePerGas = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const walletBalance = asset.currency.parse('1 ETH')

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: walletBalance,
      })

      const feeData = await asset.api.getFeeData()

      const gasPrice = asset.currency.parse(`${resolveGasPrice({ feeData }).toBaseString()} wei`)

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: walletBalance.sub(gasPrice.mul(BigInt(21_000))),
        options: { isSendAll: true },
      })

      expect(await asset.server.getBalance(walletAddress)).toBe('0x0')
    }

    const walletTesterTest_sendTx_HACK_maybeRefineSendAllAmount = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      // This represents a good client which has correctly the
      // calculated the precise amount to send to ensure no dust
      // is left on the account.
      const createNominalTestCase = ({ amount, gasPrice, gasLimit = BigInt(21_000) }) => ({
        balanceBefore: amount.add(gasPrice.mul(gasLimit)),
        amount,
        gasPrice,
        gasLimit,
        expectedToBe: null,
      })

      // This represents a client which has incorrectly calculated
      // the amount to send; for example, due to discrepencies in
      // `gasPrice` during sends.
      const createRecoverableTestCase = ({ amount, gasPrice, gasLimit = BigInt(21_000) }) => {
        const totalCost = gasPrice.mul(gasLimit)
        const dustAmount = pseudoRandomAmount({
          asset,
          unit: asset.currency.Gwei,
          min: asset.currency.Gwei(1),
          max: asset.currency.Gwei(500),
        })
        // The total transaction cost should be the user's balance:
        // `amountTriedToSend + dust + transactionFee`
        const sendAmountToAvoidDust = amount.add(dustAmount)
        return {
          balanceBefore: sendAmountToAvoidDust.add(totalCost),
          amount,
          gasPrice,
          gasLimit,
          expectedToBe: sendAmountToAvoidDust,
        }
      }

      const testCases = [
        ...Array.from({ length: 1000 }).flatMap(() => [
          createNominalTestCase({
            amount: pseudoRandomAmount({ asset, unit: asset.currency.ETH }),
            gasPrice: pseudoRandomAmount({ asset, unit: asset.currency.Gwei }),
          }),
          createRecoverableTestCase({
            amount: pseudoRandomAmount({ asset, unit: asset.currency.ETH }),
            gasPrice: pseudoRandomAmount({ asset, unit: asset.currency.Gwei }),
          }),
        ]),
        // Error case which would result in balance underflow. Here,
        // we ensures that we can at the very least fallback to the
        // original behaviour.
        {
          balanceBefore: asset.currency.parse('0 ETH'),
          amount: asset.currency.parse('1 ETH'),
          gasPrice: asset.currency.parse('69 Gwei'),
          gasLimit: BigInt(21_000),
          expectedToBe: null,
        },
      ]

      for (const { balanceBefore, amount, gasPrice, gasLimit, expectedToBe } of testCases) {
        await setBalance({
          asset,
          assetClientInterface,
          walletAccount,
          walletAddress,
          amount: balanceBefore,
        })
        await expect(
          HACK_maybeRefineSendAllAmount({
            amount,
            asset,
            assetClientInterface,
            walletAccount,
            gasLimit,
            gasPrice,
          })
        ).resolves.toStrictEqual(expectedToBe)
      }
    }

    const walletTesterTest_setStorageAt = async ({
      asset,
      addressesCollector,
      assetsModule,
      walletAccounts,
    }) => {
      const { walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const tokenAsset = await assetsModule.getAsset('ape')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      // You can find a complete storage layout using:
      //
      // ```shell
      // ETHERSCAN_API_KEY="" cast storage <target_contract_address> # must be compiled > 0.6.0
      // ```
      //
      // For Apecoin, the  we can see the `_balances` are stored in slot `0`:
      //
      // <Slot 0> mapping(address => uint256) _balances
      //
      // To compute the offset to a specific account balance, we need to do the following:
      // `keccak256(abi.encode(address /* account */, uint256(0) /* slot */))`
      //
      // The following storage slot is for whale `0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9`:
      //
      // ```shell
      // $ chisel
      // Welcome to Chisel! Type `!help` to show available commands.
      // ➜ uint256(keccak256(abi.encode(address(0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9), uint256(0))))
      // Type: uint256
      // ├ Hex: 0x5a487aff099fdb9bdbbe24c0a1f715ba19809799b929663b46f0f8b34e914ca4
      // ├ Hex (full word): 0x5a487aff099fdb9bdbbe24c0a1f715ba19809799b929663b46f0f8b34e914ca4
      // └ Decimal: 40836218250012299526465457352211080773187506767238912274865581838375333219492
      // ```

      expect(
        await getStorageAt({
          asset,
          address: tokenAssetAddress,
          slot: '0x5a487aff099fdb9bdbbe24c0a1f715ba19809799b929663b46f0f8b34e914ca4',
        })
      ).toBe('0x000000000000000000000000000000000000000000869741047e5c040eb1c2b2')

      // get the token by address

      // Therefore to become an $APE whale, we can write to our own storage offset:
      await setStorageAt({
        asset,
        address: tokenAssetAddress,
        slot: '0x723077b8a1b173adc35e5f0e7e3662fd1208212cb629f9c128551ea7168da722',
        word: '0x0000000000000000000000000000000000000000006969696969696969696969',
      })

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalance },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(apeCoinBalance).toString(16)).toBe('6969696969696969696969')
    }

    const walletTesterTest_sendTx_sendAllWhilstPending = async ({
      asset,
      addressesCollector,
      walletAccounts,
      assetClientInterface,
    }) => {
      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      await setAutomine({ asset, disabled: true })

      const walletBalance = asset.currency.parse('1 ETH')

      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: walletBalance,
      })

      const amount = asset.currency.parse('0.5 ETH')
      const feeData = await asset.api.getFeeData()
      const gasLimit = 21_000
      const gasPrice = asset.currency.parse(`${resolveGasPrice({ feeData }).toBaseString()} wei`)

      const sendTransactionCost = gasPrice.mul(gasLimit)

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount,
        options: {
          customFee: gasPrice,
          gasLimit,
        },
      })

      const remaining = walletBalance.sub(amount.add(sendTransactionCost))

      await asset.api.sendTx({
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: remaining.sub(sendTransactionCost),
        options: {
          customFee: gasPrice,
          gasLimit,
          isSendAll: true,
        },
      })

      await setAutomine({ asset })

      expect(await asset.server.getBalance(walletAddress)).toBe('0x0')
    }

    const walletTesterTest_sendTx_sendAllWithTruthyTxData = async ({
      asset,
      addressesCollector,
      walletAccounts,
      assetsModule,
      assetClientInterface,
    }) => {
      await setAutomine({ asset })

      const { walletAddress, walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      // Get the wallet's `ape` balance:

      const tokenAsset = await assetsModule.getAsset('ape')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalance },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      const expectedTokenAssetBalance = tokenAsset.currency.parse(
        '127435004044083263592556905 base'
      )
      expect(BigInt(apeCoinBalance)).toBe(BigInt(expectedTokenAssetBalance.toBaseString()))

      const baseBalanceBefore = asset.currency.parse('10000 ETH')

      // HACK: Increase the user's balance without updating the TXLog:
      await setBalance({
        asset,
        assetClientInterface,
        walletAccount,
        walletAddress,
        amount: baseBalanceBefore,
      })

      // If the caller is making an `isSendAll` transaction, but defines
      // nonzero calldata, we cannot uphold the no dust invairant because
      // this indicates a potential contract transaction, and the price
      // of calldata can vary on L2s.
      const { txId } = await asset.api.sendTx({
        asset,
        walletAccount,
        address: tokenAssetAddress,
        amount: asset.currency.parse('0 ETH'),
        options: {
          txInput: tokenAsset.contract.transfer.build(
            ADDRESS_DEAD,
            BigInt(expectedTokenAssetBalance.toBaseString())
          ),
          keepTxInput: true,
          isSendAll: true,
        },
      })

      const [{ effectiveGasPrice, gasUsed }, baseBalanceAfter] = await Promise.all([
        asset.server.getTransactionReceipt(txId),
        asset.server.getBalance(walletAddress),
      ])

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalanceAfter },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      // ERC-20 transaction is sent:
      expect(BigInt(apeCoinBalanceAfter)).toBe(BigInt(0))

      // Meanwhile, ensure we only spent gas money:
      expect(BigInt(baseBalanceAfter).toString()).toBe(
        baseBalanceBefore
          .sub(asset.currency.parse(`${effectiveGasPrice.toString()} wei`).mul(BigInt(gasUsed)))
          .toBaseString()
      )

      // Ensure the `spendAddress` has the `expectedAllowance`
      // to spend on behalf of the `walletAddress`.
      const expectSpendingAllowance = async (expectedAllowance) => {
        const allowance = await getSpendingAllowance({
          asset: tokenAsset,
          fromAddress: walletAddress,
          spenderAddress: ADDRESS_DEAD,
        })
        expect(allowance.equals(expectedAllowance)).toBeTrue()
      }

      await expectSpendingAllowance(tokenAsset.currency.ZERO)

      const expectSpendingAllowanceChanges = async ({ approve }) => {
        await approve({
          spenderAddress: ADDRESS_DEAD,
          asset: tokenAsset,
          feeData: asset.api.getFeeData(),
          fromAddress: walletAddress,
          walletAccount,
          approveAmount: tokenAsset.currency.parse(`${TYPE_UINT256_MAX} base`),
        })
        await expectSpendingAllowance(tokenAsset.currency.parse(`${TYPE_UINT256_MAX} base`))

        await approve({
          spenderAddress: ADDRESS_DEAD,
          asset: tokenAsset,
          feeData: asset.api.getFeeData(),
          walletAccount,
          fromAddress: walletAddress,
        })
        await expectSpendingAllowance(tokenAsset.currency.ZERO)
      }

      // Legacy
      await expectSpendingAllowanceChanges({
        // HACK: This is supposed to emulate approvals on the exchange,
        //       which is a mixture between:
        // https://github.com/ExodusMovement/exodus-mobile/blob/ed86d4359aef6e7928097ac7028dbae9c8b8babe/src/_local_modules/simple-tx/tx-send.js#L26C7-L40C8
        // https://github.com/ExodusMovement/exodus-hydra/blob/2d70c4d98c1bbcf637867579d3271dea14bbc872/features/exchange/src/modules/exchange.ts#L746C3-L777C4
        approve: createApprove({
          sendTx: ({
            receiver: { address, amount } /* {address, amount: baseAsset.currency} */,
            txInput,
            gasPrice,
            tipGasPrice,
            gasLimit,
            walletAccount,
            // - asset,
            // - silent,
            // - fromAddress,
          }) =>
            asset.baseAsset.api.sendTx({
              asset,
              assetName: asset.baseAsset.name,
              chainId: asset.baseAsset.chainId,
              address,
              amount,
              silent: false,
              walletAccount,
              isSendAll: false,
              options: {
                gasLimit,
                gasPrice,
                tipGasPrice,
                txInput,
                keepTxInput: true,
              },
            }),
        }),
      })

      // Modernized
      await expectSpendingAllowanceChanges({ approve: createApprove({ assetClientInterface }) })
    }

    walletTester({
      assetPlugin,
      assetName,
      seed: 'test test test test test test test test test test test junk',
      expectedAddresses: {
        ethereum_44_exodus_0_0_0: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        ethereum_44_exodus_1_0_0: '0x8C8d35429F74ec245F8Ef2f4Fd1e551cFF97d650',
        ethereum_44_exodus_2_0_0: '0x98e503f35D0a019cB0a251aD243a4cCFCF371F46',
      },
      beforeEach: ({ assetClientInterface }) => {
        signTransaction = jest.spyOn(assetClientInterface, 'signTransaction')
      },
      afterEach: () => {
        const toCompareObject = ({ unsignedTx }) => {
          const ethjsTx = createEthereumJsTx(unsignedTx)
          const transactionBuffer = ethjsTx.serialize().toString('hex')
          return {
            transactionBuffer,
            gasLimit: ethjsTx.gasLimit.toNumber(),
            nonce: ethjsTx.nonce.toNumber(),
            to: ethjsTx.to.toString(),
            value: ethjsTx.value.toString(),
            maxFeePerGas: ethjsTx.maxFeePerGas?.toNumber(),
            maxPriorityFeePerGas: ethjsTx.maxPriorityFeePerGas?.toNumber(),
            gasPrice: ethjsTx.gasPrice?.toNumber(),
            data: ethjsTx.data.toString('hex'),
          }
        }

        expect(signTransaction.mock.calls.map((a) => toCompareObject(a[0]))).toMatchSnapshot()
      },
      tests: {
        walletTesterTest_checkMutableAccountState,
        walletTesterTest_pseudoRandomAmount,
        walletTesterTest_getBlockNumber,
        walletTesterTest_getBalance,
        walletTesterTest_setBalance,
        walletTesterTest_sendTx_transferToDeadAddress,
        walletTesterTest_sendTx_insufficientBalance,
        walletTesterTest_sendTx_resolveNonce,
        walletTesterTest_sendTx_bumpTx,
        walletTesterTest_sendTx_sendAll,
        walletTesterTest_sendTx_sendAllCustomGasPrice,
        walletTesterTest_setBaseFeePerGas,
        walletTesterTest_sendTx_sendAll_useBaseFeePerGas,
        walletTesterTest_sendTx_HACK_maybeRefineSendAllAmount,
        walletTesterTest_setStorageAt,
        walletTesterTest_sendTx_sendAllWhilstPending,
        walletTesterTest_sendTx_sendAllWithTruthyTxData,
      },
    })
  },
  { blockNumber }
)
