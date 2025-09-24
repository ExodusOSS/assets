import { getPrivateSeed, walletTester } from '@exodus/assets-testing'
import { sendEvmTest } from '@exodus/ethereum-api/src/__tests__/send-test-helper.js'
import path from 'path'

import assetPlugin from '../index.js'

const importSafeReportFile = path.join(import.meta.dirname, 'ethereum-safe-report.json')

describe(`ethereum send transfer integration test`, () => {
  afterEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  walletTester({
    assetPlugin,
    assetName: 'ethereum',
    seed: getPrivateSeed(),
    importSafeReportFile,
    walletAccountCount: 2,
    tests: {
      'Send some eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          amount: '140891449 wei',
        }),

      'Send all eth from first to second portolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          isSendAll: true,
        }),

      'Send some bat token to second portfolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          assetName: 'bat',
          amount: '22771120000000000 base',
          options: { gasLimit: 35_497 },
        }),

      'Send all bat token to second portfolio': (deps) =>
        sendEvmTest({
          //
          ...deps,
          assetName: 'bat',
          isSendAll: true,
          options: { gasLimit: 35_497 },
        }),

      'Retry after nonce failed': async ({
        asset: baseAsset,
        assetClientInterface,
        assetsModule,
        getBalances,
      }) => {
        try {
          const mockedMessage = "I didn't really broadcast"

          // already used nonce
          const nonce = 10
          const latestNonce = 19
          const originalBroadcast = baseAsset.api.broadcastTx
          const broadcastTx = jest.spyOn(baseAsset.api, 'broadcastTx')

          const walletAccount = 'exodus_0'
          const toAddress = await assetClientInterface.getReceiveAddress({
            walletAccount: `exodus_1`,
            assetName: baseAsset.name,
          })

          const amount = baseAsset.currency.parse('100 wei')

          let counter = 1
          broadcastTx.mockImplementation(async (tx) => {
            const originalNonceExpectedTx =
              '02f86b010a841dcd6500850bc208d90082520894f6c138c36341138ddfc314a11038da8264b7ef096480c001a087bd84f3bd1251b5c92184bf7846d492a11dce6ed597ce5fc7f6d56bfda94f94a02ab2051da513c4f9f41b9641e4e33b32f3af153286d170a88122f0fdeb750fc0'

            // like as the one above, with 19 nonce and different signature
            const latestNonceExpectedTx =
              '02f86b0113841dcd6500850bc208d90082520894f6c138c36341138ddfc314a11038da8264b7ef096480c001a09514c0799637e11621d425708f990b700227d211e59e947e641cb5e818531c98a0428fe7fa3f0b8f92796b4ac25d5beccc5470db9beb4e1662bb04c9e8ad0603f5'

            if (counter === 1) {
              counter++
              expect(tx).toEqual(originalNonceExpectedTx)
              try {
                // this real broadcast should always fail!
                await originalBroadcast(tx)
                expect(false).toEqual(true)
              } catch (e) {
                expect(e.message).toEqual(
                  'Bad rpc response: nonce too low: next nonce 19, tx nonce 10'
                )
                throw e
              }
            }

            expect(tx).toEqual(latestNonceExpectedTx)
            return { mockedMessage }
          })

          const token = await assetsModule.getAsset(baseAsset.name)
          expect(token).toBeDefined()

          const result = await baseAsset.api.sendTx({
            asset: token,
            walletAccount,
            address: toAddress,
            amount,
            options: { nonce },
          })

          expect(baseAsset.api.broadcastTx).toBeCalled()
          expect(result).toEqual({
            txId: '0x42e1fd1ef49a5cac11a657b7f98fa9ef7015f8333c7e16ff3d61a8b027f9d6b4',
            nonce: latestNonce,
          })
        } finally {
          baseAsset.server.stop?.()
          jest.clearAllMocks()
          jest.restoreAllMocks()
        }
      },
    },
  })
})
