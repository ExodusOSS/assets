// mocking insight client just in case
import '@exodus/bitcoin-api/src/insight-api-client/__tests__/mock-insight.js'

import { getPrivateSeed, getTestingSeed, walletTester } from '@exodus/assets-testing'
import { createSignTestCases } from '@exodus/bitcoin-api/src/__tests__/bitcoin-testing-utils.js'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import { Psbt } from '@exodus/bitcoinjs'
import { Address, UtxoCollection } from '@exodus/models'
import { join } from 'path'

import { xverse49 } from '../compatibility-modes.js'
import assetPlugin from '../index.js'

const fixturesPath = join(import.meta.dirname, 'fixtures/sign')
const fixturesRequire = (name) => require('./fixtures/sign/' + name) // eslint-disable-line @exodus/hydra/no-require

describe(`bitcoin tx-sign test`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  walletTester({
    assetPlugin,
    seed: getPrivateSeed(),
    walletAccountCount: 4,
    compatibilityMode: xverse49,
    beforeEach: () => {
      // removes the random ouf of the taproot signature
      jest
        .spyOn(defaultEntropy, 'getSchnorrEntropy')
        .mockImplementation(() =>
          Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
        )
    },
    tests: createSignTestCases({ fixturesPath, fixturesRequire }),
  })
})

describe(`bitcoin multisig tx-sign test`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    walletAccountCount: 4,
    compatibilityMode: xverse49,
    beforeEach: () => {
      // removes the random ouf of the taproot signature
      jest
        .spyOn(defaultEntropy, 'getSchnorrEntropy')
        .mockImplementation(() =>
          Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
        )
    },
    tests: {
      test1: async ({ asset, publicKeyProvider, transactionSigner, walletAccountsAtom }) => {
        const pubKeys = await Promise.all(
          [1, 2, 3].map((i) => {
            const keyIdentifier = asset.api.getKeyIdentifier({
              accountIndex: i,
              chainIndex: 0,
              addressIndex: 0,
              purpose: 86,
            })
            return publicKeyProvider.getPublicKey({
              walletAccount: `exodus_${i}`,
              keyIdentifier,
            })
          })
        )

        const { address, output, witness, redeem } = asset.encodeMultisigContract(pubKeys, {
          threshold: 2,
        })

        const addressPathsMap = { [address]: 'm/0/0' }

        const walletAccounts = await walletAccountsAtom.get()

        const {
          plainTx: { rawPSBT: psbtBuffer },
        } = await transactionSigner.signTransaction({
          walletAccount: walletAccounts[`exodus_2`],
          assetName: asset.name,
          baseAssetName: asset.baseAsset.name,
          unsignedTx: {
            txData: {
              inputs: [
                {
                  address,
                  script: output.toString('hex'),
                  txId: '035c35b0e920759063afa271bd8127e525c4eab31d238b9482635c721fd79fe3',
                  vout: 0,
                  value: 100_000_000,
                  tapLeafScript: [
                    {
                      leafVersion: redeem.redeemVersion,
                      script: redeem.output,
                      controlBlock: witness[witness.length - 1],
                    },
                  ],
                },
              ],
              outputs: [['bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr', 99_900_000]],
            },
            txMeta: {
              addressPathsMap,
              returnPsbt: true,
            },
          },
        })

        const {
          plainTx: { rawPSBT },
        } = await transactionSigner.signTransaction({
          walletAccount: walletAccounts[`exodus_3`],
          assetName: asset.name,
          baseAssetName: asset.baseAsset.name,
          unsignedTx: {
            txData: { psbtBuffer },
            txMeta: {
              addressPathsMap,
              inputsToSign: [{ address }],
            },
          },
        })

        const psbt = Psbt.fromBuffer(rawPSBT, { network: asset.coinInfo.toBitcoinJS() })

        // The threshold is 2, and we signed with the second and third key
        // So push an empty sig for the first pubkey
        psbt.data.inputs[0].tapScriptSig.push({
          pubkey: pubKeys[0],
          signature: [],
          leafHash: psbt.data.inputs[0].tapScriptSig[0].leafHash,
        })
        psbt.finalizeAllInputs()
        const tx = psbt.extractTransaction(true)
        expect(tx.toHex()).toEqual(
          '02000000000101e39fd71f725c6382948b231db3eac425e52781bd71a2af63907520e9b0355c030000000000ffffffff01605af40500000000160014a65d1a239d4ec666643d350c7bb8fc44d288112805405482cd54448d6cdde74a0ec7ee5913e427d698679d21f1b729151c6c4915cfb333a322f99f5dd7034614e4be6e87cb45a60c7b7588caf887f613936fd4ba493640ae3f3354f2cf2a02d575ade8d14c7d6a768c86bd6f98516cf8853001b850ce4f54bb364d89f5b81373f9510024d8620858f0c823e21142c4bae1cb6bfb845c540068203d5347b3d2a03ebb906fb0913630c2058f24c2d3ddd4d7eed722c3416e2094cdac20e056b555be960a42bb53d6aa1d453bd20c84219a04439d1eb07677aab8ef1c84ba20e9330b83678a861461c4f438273a07d8305ede7e9653b98291e005bc3e695d8cba529c21c150929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac000000000'
        )
      },
    },
  })
})

describe(`bitcoin batch tx-sign test`, () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    walletAccountCount: 4,
    tests: {
      test1: async ({ asset, publicKeyProvider, walletAccountsAtom, assetClientInterface }) => {
        const walletAccounts = await walletAccountsAtom.get()

        const pubKeys = await Promise.all(
          [1, 2, 3].map((i) => {
            const keyIdentifier = asset.api.getKeyIdentifier({
              accountIndex: i,
              chainIndex: 0,
              addressIndex: 0,
              purpose: 86,
            })
            return publicKeyProvider.getPublicKey({
              walletAccount: `exodus_${i}`,
              keyIdentifier,
            })
          })
        )

        const { address, output, witness, redeem } = asset.encodeMultisigContract(pubKeys, {
          threshold: 2,
        })

        const addr = new Address(address, {
          path: 'm/0/0',
          purpose: 86,
          spendingInfo: {
            witness,
            redeem,
          },
        })

        jest.spyOn(asset.baseAsset.insightClient, 'fetchBlockHeight').mockImplementation(() => 0)
        jest.spyOn(assetClientInterface, 'getAccountState').mockImplementation(() => {
          return {
            utxos: UtxoCollection.fromArray(
              [
                {
                  address: addr,
                  confirmations: 1,
                  script: output.toString('hex'),
                  txId: '7ddd2ae0005ebe3fc5ecbad18dd73da7e17ea5cba7cbf67eea35cced6dfee79c',
                  value: '10 BTC',
                  vout: 0,
                },
              ],
              { addressMap: { [address]: 'm/0/0' }, currency: asset.currency }
            ),
          }
        })
        jest.spyOn(assetClientInterface, 'getAddress').mockImplementation(() => addr)

        const recipients = [
          {
            address: 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn',
            name: 'Alice',
            email: 'alice@exodus.com',
            description: 'Testing recipient 1',
            fiatAmount: asset.currency.defaultUnit(100_000),
            amount: asset.currency.baseUnit(1),
          },
          {
            address: 'bc1q5ew35guafmrxvepax5x8hw8ugnfgsyfgvh0ntr',
            name: 'Bob',
            email: 'bob@exodus.com',
            description: 'Testing recipient 1',
            fiatAmount: asset.currency.defaultUnit(100_000),
            amount: asset.currency.baseUnit(1),
          },
        ]
        const psbt = await asset.createBatchTx({
          asset,
          walletAccount: 'exodus_0',
          recipients,
        })

        const unsignedTx = await asset.psbtToUnsignedTx({
          psbt,
          walletAccount: walletAccounts['exodus_0'],
        })

        expect(unsignedTx.txData.psbtBuffer).toEqual(psbt.toBuffer())
      },
    },
  })
})
