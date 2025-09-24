/* eslint-disable camelcase */
import { walletTester } from '@exodus/assets-testing'
import { getNonce, transactionExists } from '@exodus/ethereum-api'
import createEthereumJsTx from '@exodus/ethereum-lib/src/unsigned-tx/create-ethereumjs-tx.js'

import { createEthereumNoHistoryServerDescribe } from './__utils__/index.js'

jest.setTimeout(60 * 60 * 1000)

const describe = createEthereumNoHistoryServerDescribe({
  port: 8548,
})

let signTransaction = null

describe(
  'ethereum transaction acceleration integration tests',
  async ({
    ADDRESS_DEAD,
    TYPE_UINT128_MAX,
    WAD,
    assetName,
    assetPlugin,
    setBalance,
    setAutomine,
    mine,
    setNextBlockBaseFeePerGas,
    dropTransactionByHash,
    getEthLikeTokenAddressOrThrow,
    getForkAccount,
    getRawTxOrThrow,
  }) => {
    const expectBump = ({ preBumpTransaction, postBumpTransaction }) => {
      const didBumpMaxPriorityFeePerGas =
        BigInt(postBumpTransaction.maxPriorityFeePerGas) >
        BigInt(preBumpTransaction.maxPriorityFeePerGas)

      // Ensure the priority fee has increased.
      expect(didBumpMaxPriorityFeePerGas).toBeTrue()

      // Ensure the nonces are identical.
      expect(preBumpTransaction.nonce).toBe(postBumpTransaction.nonce)

      // Ensure the transaction has sufficient mining incentives.
      expect(BigInt(preBumpTransaction.maxFeePerGas)).toBeLessThan(
        BigInt(postBumpTransaction.maxFeePerGas)
      )
    }

    const walletTesterTest_iterativeTransactionAcceleration = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      expect(signTransaction).toBeDefined()
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

      // Disable automining so every transaction we send is pending.
      await setAutomine({ asset, disabled: true })

      const sendTxParams = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('1 ETH'),
      }

      let lastTransactionId

      for (let i = 0; i < 10; i++) {
        // Ensure we bump the previous transaction if it
        // had been already defined.
        if (typeof lastTransactionId === 'string') {
          // Bump the transaction.
          Object.assign(sendTxParams, { options: { bumpTxId: lastTransactionId } })
        }

        const maybeLastTransaction =
          typeof lastTransactionId === 'string' &&
          (await asset.server.getTransactionByHash(lastTransactionId))

        if (typeof lastTransactionId === 'string' && !maybeLastTransaction) {
          throw new Error('invariant')
        }

        // Send the next transaction.
        const { txId, nonce } = await asset.api.sendTx(sendTxParams)
        expect(nonce).toBe(941)
        expect(await transactionExists({ asset, txId })).toBeTrue()

        // Ensure that attempts to fetch a new nonce from the node
        // will result in a higher nonce:
        const [latestNonce, pendingNonce] = await Promise.all([
          getNonce({ asset, address: walletAddress }),
          getNonce({ asset, address: walletAddress, tag: 'pending' }),
        ])

        expect(latestNonce).toBe(941)
        expect(pendingNonce).toBe(942)

        // Fetch the current transaction.
        const nextTransaction = await asset.server.getTransactionByHash(txId)
        expect(nextTransaction).toBeTruthy()

        if (maybeLastTransaction) {
          // Ensure the last transction dropped from the mempool.
          expect(await asset.server.getTransactionReceipt(lastTransactionId)).toBeNull()

          const {
            gasPrice: lastGasPrice,
            maxFeePerGas: lastMaxFeePerGas,
            maxPriorityFeePerGas: lastMaxPriorityFeePerGas,
          } = maybeLastTransaction
          const {
            gasPrice: nextGasPrice,
            maxFeePerGas: nextMaxFeePerGas,
            maxPriorityFeePerGas: nextMaxPriorityFeePerGas,
          } = nextTransaction

          expect(BigInt(lastGasPrice)).toBeLessThan(BigInt(nextGasPrice))
          expect(BigInt(lastMaxFeePerGas)).toBeLessThan(BigInt(nextMaxFeePerGas))
          expect(BigInt(lastMaxPriorityFeePerGas)).toBeLessThan(BigInt(nextMaxPriorityFeePerGas))
        }

        lastTransactionId = txId
      }

      // Re-enable auto-mining.
      await setAutomine({ asset })
    }

    const walletTesterTest_gasPriceRises = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      // Set the initial `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('100 Gwei'),
      })

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

      // Disable automining so every transaction we send is pending.
      await setAutomine({ asset, disabled: true })

      const sendTxParams = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('1 ETH'),
      }

      // Send the transaction at the current price. Since we've
      // disabled automining, the transaction will be pending.
      const { txId, nonce } = await asset.api.sendTx(sendTxParams)
      const rawTx = await getRawTxOrThrow({ asset, txId })

      // The transaction should be in the mempool and not mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Simulate the transaction being stuck in pending.
      await dropTransactionByHash({ asset, transactionHash: txId })

      // Mine the next block.
      await mine({ asset })

      // The transaction should not be in the mempool and should not mined.
      expect(await transactionExists({ asset, txId })).toBeFalse()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // HACK: Let's emulate that the previous transaction was pending by
      //       sending it again using the pre gas spike parameters.
      await asset.baseAsset.api.broadcastTx(rawTx.toString('hex'))

      // The transaction should be in the mempool and should not be mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Increase the `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('200 Gwei'),
      })

      const preBumpTransaction = await asset.server.getTransactionByHash(txId)

      // First, to bump the transaction using an incorrect nonce. This should `throw`.
      await expect(
        asset.api.sendTx({
          ...sendTxParams,
          options: { bumpTxId: txId, nonce: nonce + 1 },
        })
      ).rejects.toThrow(new Error('Error: incorrect nonce for replacement transaction'))

      // Let's create the bump transaction.
      const { txId: bumpedTxId, nonce: bumpedNonce } = await asset.api.sendTx({
        ...sendTxParams,
        options: { bumpTxId: txId },
      })

      const postBumpTransaction = await asset.server.getTransactionByHash(bumpedTxId)

      expect(bumpedNonce).toBe(nonce)
      expectBump({ preBumpTransaction, postBumpTransaction })

      // Re-enable automining.
      await setAutomine({ asset })
    }

    const walletTesterTest_gasPriceFalls = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      // Set the initial `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('100 Gwei'),
      })

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

      // Disable automining so every transaction we send is pending.
      await setAutomine({ asset, disabled: true })

      const sendTxParams = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('1 ETH'),
      }

      // Send the transaction at the current price. Since we've
      // disabled automining, the transaction will be pending.
      const { txId, nonce } = await asset.api.sendTx(sendTxParams)
      const rawTx = await getRawTxOrThrow({ asset, txId })

      // The transaction should be in the mempool and not mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Simulate the transaction being stuck in pending.
      await dropTransactionByHash({ asset, transactionHash: txId })

      // Mine the next block.
      await mine({ asset })

      // The transaction should not be in the mempool and should not mined.
      expect(await transactionExists({ asset, txId })).toBeFalse()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // HACK: Let's emulate that the previous transaction was pending by
      //       sending it again using the pre gas spike parameters.
      await asset.baseAsset.api.broadcastTx(rawTx.toString('hex'))

      // The transaction should be in the mempool and should not be mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Decrease the `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('10 Gwei'),
      })

      const preBumpTransaction = await asset.server.getTransactionByHash(txId)

      // Let's create the bump transaction.
      const { txId: bumpedTxId, nonce: bumpedNonce } = await asset.api.sendTx({
        ...sendTxParams,
        options: { bumpTxId: txId },
      })

      const postBumpTransaction = await asset.server.getTransactionByHash(bumpedTxId)

      expect(nonce).toBe(bumpedNonce)
      expectBump({ preBumpTransaction, postBumpTransaction })

      // Re-enable automining.
      await setAutomine({ asset })
    }

    const walletTesterTest_transferEthLikeToken = async ({
      asset,
      assetsModule,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const tokenAsset = await assetsModule.getAsset('ape')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      await setBalance({
        asset: tokenAsset,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: tokenAsset.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
      })

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalanceBefore },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(apeCoinBalanceBefore).toString(16)).toBe(TYPE_UINT128_MAX.toString(16))
      await mine({ asset })

      const amount = tokenAsset.currency.parse(`${WAD.toString()} base`)

      const sendTxParams = {
        asset: tokenAsset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount,
      }

      await asset.api.sendTx(sendTxParams)

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalanceAfter },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      // Ensure the tokens were sent.
      expect(BigInt(apeCoinBalanceAfter).toString(16)).toBe(
        (TYPE_UINT128_MAX - BigInt(amount.toBaseString())).toString(16)
      )
    }

    const walletTesterTest_transferEthLikeTokenAcceleration = async ({
      asset,
      assetsModule,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      // Set the initial `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('10 Gwei'),
      })

      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      const tokenAsset = await assetsModule.getAsset('ape')
      const tokenAssetAddress = getEthLikeTokenAddressOrThrow({ asset: tokenAsset })

      await setBalance({
        asset: tokenAsset,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: tokenAsset.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
      })

      const {
        confirmed: { [tokenAssetAddress]: apeCoinBalanceBefore },
      } = await asset.server.balanceOf(walletAddress, tokenAssetAddress, 'latest')

      expect(BigInt(apeCoinBalanceBefore).toString(16)).toBe(TYPE_UINT128_MAX.toString(16))
      await mine({ asset })

      const amount = tokenAsset.currency.parse(`${WAD.toString()} base`)

      const sendTxParams = {
        asset: tokenAsset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount,
      }

      // Disable automining.
      await setAutomine({ asset, disabled: true })

      // Send the transaction at the current price. Since we've
      // disabled automining, the transaction will be pending.
      const { txId, nonce } = await asset.api.sendTx(sendTxParams)
      const rawTx = await getRawTxOrThrow({ asset, txId })

      // The transaction should be in the mempool and not mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Simulate the transaction being stuck in pending.
      await dropTransactionByHash({ asset, transactionHash: txId })

      // Mine the next block.
      await mine({ asset })

      // The transaction should not be in the mempool and should not mined.
      expect(await transactionExists({ asset, txId })).toBeFalse()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // HACK: Let's emulate that the previous transaction was pending by
      //       sending it again using the pre gas spike parameters.
      await asset.baseAsset.api.broadcastTx(rawTx.toString('hex'))

      // The transaction should be in the mempool and should not be mined.
      expect(await transactionExists({ asset, txId })).toBeTrue()
      expect(await asset.server.getTransactionReceipt(txId)).toBeNull()

      // Increase the `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('100 Gwei'),
      })

      const preBumpTransaction = await asset.server.getTransactionByHash(txId)
      expect(preBumpTransaction).toBeTruthy()

      // Ensure we can bump the transaction.
      const { txId: bumpedTxId, nonce: bumpedNonce } = await asset.api.sendTx({
        ...sendTxParams,
        options: { bumpTxId: txId },
      })

      // Transaction should be dropped from the mempool.
      expect(await asset.server.getTransactionByHash(txId)).toBeNull()

      const postBumpTransaction = await asset.server.getTransactionByHash(bumpedTxId)
      expect(postBumpTransaction).toBeTruthy()

      expect(nonce).toBe(bumpedNonce)
      expectBump({ preBumpTransaction, postBumpTransaction })

      // Re-enable automining.
      await setAutomine({ asset, disabled: true })
    }

    const walletTesterTest_iterativeEthLikeTokenTransactionAcceleration = async ({
      asset,
      assetsModule,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount, walletAddress } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      // Set the initial `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('0.1 Gwei'),
      })

      // Disable automining so every transaction we send is pending.
      await setAutomine({ asset, disabled: true })

      const tokenAsset = await assetsModule.getAsset('ape')

      await setBalance({
        asset: tokenAsset,
        assetClientInterface,
        walletAddress,
        walletAccount,
        amount: tokenAsset.currency.parse(`${TYPE_UINT128_MAX.toString()} base`),
      })

      await mine({ asset })

      const amount = tokenAsset.currency.parse(`${WAD.toString()} base`)

      const sendTxParams = {
        asset: tokenAsset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount,
      }

      let lastTransactionId

      for (let i = 0; i < 10; i++) {
        // Ensure we bump the previous transaction if it
        // had been already defined.
        if (typeof lastTransactionId === 'string') {
          // Bump the transaction.
          Object.assign(sendTxParams, { options: { bumpTxId: lastTransactionId } })
        }

        const maybeLastTransaction =
          typeof lastTransactionId === 'string' &&
          (await asset.server.getTransactionByHash(lastTransactionId))

        if (typeof lastTransactionId === 'string' && !maybeLastTransaction) {
          throw new Error('invariant')
        }

        // Send the next transaction.
        const { txId, nonce } = await asset.api.sendTx(sendTxParams)

        expect(nonce).toBe(946)
        expect(await transactionExists({ asset, txId })).toBeTrue()

        // Fetch the current transaction.
        const nextTransaction = await asset.server.getTransactionByHash(txId)
        expect(nextTransaction).toBeTruthy()

        if (maybeLastTransaction) {
          // Ensure the last transction dropped from the mempool.
          expect(await asset.server.getTransactionReceipt(lastTransactionId)).toBeNull()

          const {
            gasPrice: lastGasPrice,
            maxFeePerGas: lastMaxFeePerGas,
            maxPriorityFeePerGas: lastMaxPriorityFeePerGas,
          } = maybeLastTransaction
          const {
            gasPrice: nextGasPrice,
            maxFeePerGas: nextMaxFeePerGas,
            maxPriorityFeePerGas: nextMaxPriorityFeePerGas,
          } = nextTransaction

          expect(BigInt(lastGasPrice)).toBeLessThan(BigInt(nextGasPrice))
          expect(BigInt(lastMaxFeePerGas)).toBeLessThan(BigInt(nextMaxFeePerGas))
          expect(BigInt(lastMaxPriorityFeePerGas)).toBeLessThan(BigInt(nextMaxPriorityFeePerGas))
        }

        lastTransactionId = txId
      }

      // Re-enable auto-mining.
      await setAutomine({ asset })
    }

    const walletTesterTest_ensureMinimumBump = async ({
      asset,
      addressesCollector,
      assetClientInterface,
      walletAccounts,
    }) => {
      const { walletAccount } = await getForkAccount({
        addressesCollector,
        walletAccounts,
      })

      // Set the initial `baseFeePerGas`.
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('500 Gwei'),
      })

      // Disable automining so every transaction we send is pending.
      await setAutomine({ asset, disabled: true })

      const sendTxParams = {
        asset,
        walletAccount,
        address: ADDRESS_DEAD,
        amount: asset.currency.parse('1 ETH'),
        options: {
          tipGasPrice: asset.currency.parse('0.0 Gwei'),
        },
      }

      // Send the transaction at the current price. Since we've
      // disabled automining, the transaction will be pending.
      const { txId, nonce } = await asset.api.sendTx(sendTxParams)

      const { maxPriorityFeePerGas: beforeMaxPriorityFeePerGas } =
        await asset.server.getTransactionByHash(txId)

      expect(BigInt(beforeMaxPriorityFeePerGas)).toBe(BigInt(0))

      // Set a fall in the `baseFeePerGas` (i.e. our transaction is already sufficient
      // per the network, but user is bumping anyway).
      await setNextBlockBaseFeePerGas({
        asset,
        assetClientInterface,
        nextBlockBaseFeePerGas: asset.currency.parse('69 Gwei'),
      })

      // NOTE: Without increasing the `tipGasPrice`, the transaction
      //       should be expected to fail.
      await expect(() => asset.api.sendTx({ ...sendTxParams, options: { nonce } })).rejects.toThrow(
        'Bad rpc response: replacement transaction underpriced'
      )

      // When relying on the transaction bump logic, the transaction
      // should be increased even when the original `tipGasPrice` was
      // negligible.
      const { txId: txIdAfter, nonce: nonceAfter } = await asset.api.sendTx({
        ...sendTxParams,
        options: { bumpTxId: txId },
      })

      expect(nonceAfter).toBe(nonce)

      const { maxPriorityFeePerGas: afterMaxPriorityFeePerGas } =
        await asset.server.getTransactionByHash(txIdAfter)

      expect(BigInt(afterMaxPriorityFeePerGas)).toBeGreaterThan(BigInt(beforeMaxPriorityFeePerGas))

      return setAutomine({ asset })
    }

    walletTester({
      assetPlugin,
      assetName,
      seed: 'test test test test test test test test test test test junk',
      expectedAddresses: {
        ethereum_44_exodus_0_0_0: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
      availableAssetNames: ['ape', 'ethereum'],
      walletAccountCount: 1,
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
        walletTesterTest_iterativeTransactionAcceleration,
        walletTesterTest_gasPriceRises,
        walletTesterTest_gasPriceFalls,
        walletTesterTest_transferEthLikeToken,
        walletTesterTest_transferEthLikeTokenAcceleration,
        walletTesterTest_iterativeEthLikeTokenTransactionAcceleration,
        walletTesterTest_ensureMinimumBump,
      },
    })
  },
  { blockNumber: 22_216_186 }
)
