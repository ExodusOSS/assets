import { getTestingSeed, walletTester } from '@exodus/assets-testing'
import KeyIdentifier from '@exodus/key-identifier'
import { Address, WalletAccount } from '@exodus/models'
import assert from 'minimalistic-assert'

import { ordinals84, ordinals86, trezor, xverse49 } from '../compatibility-modes.js'
import assetPlugin from '../index.js'

const toWalletAccount = ({ source, model, index = 0, compatibilityMode, id }) => {
  assert(source, 'source is required')
  return {
    source,
    index,
    model,
    id,
    enabled: true,
    label: 'Very secret',
    compatibilityMode,
  }
}

const defaultWallet = {
  seed: getTestingSeed(),
  tests: [
    {
      walletAccount: toWalletAccount({ source: WalletAccount.EXODUS_SRC }),
      supportedPurposes: [84, 86, 44],
      receiverAddress: {
        address: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
        meta: {
          path: 'm/0/0',
          purpose: 84,
        },
      },

      changeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
      unusedChangeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
    },

    {
      walletAccount: toWalletAccount({
        source: WalletAccount.TREZOR_SRC,
        model: 't',
        compatibilityMode: trezor,
        id: 'chamber-of-secrets-t',
      }),
      supportedPurposes: [84, 49],
      receiverAddress: {
        address: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
        meta: {
          path: 'm/0/0',
          purpose: 84,
        },
      },

      changeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
      unusedChangeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
    },

    {
      walletAccount: toWalletAccount({
        source: WalletAccount.TREZOR_SRC,
        model: '1',
        compatibilityMode: trezor,
        id: 'chamber-of-secrets-1',
      }),
      supportedPurposes: [84, 49],
      receiverAddress: {
        address: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
        meta: {
          path: 'm/0/0',
          purpose: 84,
        },
      },
      changeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
      unusedChangeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
    },
  ],
}
const ordinal86Wallet = {
  seed: getTestingSeed(),
  compatibilityMode: ordinals86,
  tests: [
    {
      walletAccount: toWalletAccount({
        source: WalletAccount.EXODUS_SRC,
        compatibilityMode: ordinals86,
      }),
      supportedPurposes: [86, 84, 44],
      receiverAddress: {
        address: 'bc1pvglfjlx3ajcskg9045nc990dc9q348w4vyqlvvegft9temjtwmtsla33ku',
        meta: {
          path: 'm/0',
          purpose: 86,
        },
      },

      changeAddress: {
        address: 'bc1pysz0jqdu872udz99xsrn9ftexq6w33j0rdshkda6y6ajj547ycvqg6nlkw',
        meta: {
          path: 'm/1',
          purpose: 86,
        },
      },
      unusedChangeAddress: {
        address: 'bc1pvv9azs5ywfuqj7dsydx465qx5kyq7l3y53q7e0wjf7ga5a5lpueswtvlcw',
        meta: {
          path: 'm/1/0',
          purpose: 86,
        },
      },
    },
  ],
}
const ordinals84Wallet = {
  seed: getTestingSeed(),
  compatibilityMode: ordinals84,
  tests: [
    {
      walletAccount: toWalletAccount({
        source: WalletAccount.EXODUS_SRC,
        compatibilityMode: ordinals84,
      }),
      supportedPurposes: [84, 86, 44],
      receiverAddress: {
        address: 'bc1qpep47k6xn79eajepme6zaxkfdqew2vff6p0a88',
        meta: {
          path: 'm/0',
          purpose: 84,
        },
      },

      changeAddress: {
        address: 'bc1q0lj6zmeuqe6n6kvh3mhaql5h6v9qh027tmstz7',
        meta: {
          path: 'm/1',
          purpose: 84,
        },
      },
      unusedChangeAddress: {
        address: 'bc1qe4ysmg5qlnlsq8gwrqhrhjwg5gaprefwpnvrnv',
        meta: {
          path: 'm/1/0',
          purpose: 84,
        },
      },
    },
  ],
}
const xverse49Wallet = {
  seed: getTestingSeed(),
  compatibilityMode: xverse49,
  tests: [
    {
      walletAccount: toWalletAccount({
        source: WalletAccount.EXODUS_SRC,
        compatibilityMode: xverse49,
      }),
      supportedPurposes: [49, 84, 86, 44],
      receiverAddress: {
        address: '38J1QSqDKYdVBCpeL55NfrL67puokCojDn',
        meta: {
          path: 'm/0/0',
          purpose: 49,
        },
      },

      changeAddress: {
        address: '38XJMNqsn7umCCXDmxtyccY4XAyVQQwm28',
        meta: {
          path: 'm/1/0',
          purpose: 49,
        },
      },
      unusedChangeAddress: {
        address: '38XJMNqsn7umCCXDmxtyccY4XAyVQQwm28',
        meta: {
          path: 'm/1/0',
          purpose: 49,
        },
      },
    },
  ],
}
const compatibilityVectorTests = [defaultWallet, ordinal86Wallet, ordinals84Wallet, xverse49Wallet]
describe('wallet vector tests', () => {
  compatibilityVectorTests.forEach((vectorTests) => {
    describe(`when ${vectorTests.compatibilityMode || 'default'} compatibility mode`, () => {
      const tests = Object.fromEntries(
        vectorTests.tests.flatMap((vectorTest) => {
          const walletAccount = new WalletAccount(vectorTest.walletAccount)
          const supportedPurposesTest = async ({ addressProvider, asset }) => {
            expect(
              await addressProvider.getSupportedPurposes({
                assetName: asset.name,
                walletAccount,
              })
            ).toEqual(vectorTest.supportedPurposes)
          }

          const receiveAddressTest = async ({ addressProvider, asset }) => {
            expect(
              await addressProvider.getReceiveAddress({
                assetName: asset.name,
                walletAccount,
              })
            ).toEqual(
              new Address(vectorTest.receiverAddress.address, {
                ...vectorTest.receiverAddress.meta,
                keyIdentifier: new KeyIdentifier({
                  derivationAlgorithm: 'BIP32',
                  derivationPath: `m/${vectorTest.receiverAddress.meta.purpose}'/0'/0'/${vectorTest.receiverAddress.meta.path.replace('m/', '')}`,
                  assetName: 'bitcoin',
                  keyType: 'secp256k1',
                }),
                walletAccount: walletAccount.toString(),
              })
            )
          }

          const changeAddressTest = async ({ addressProvider, asset }) => {
            const derivationPath = `m/${vectorTest.changeAddress.meta.purpose}'/0'/0'/${vectorTest.changeAddress.meta.path.replace('m/', '')}`
            expect(
              await addressProvider.getChangeAddress({
                assetName: asset.name,
                walletAccount,
              })
            ).toEqual(
              new Address(vectorTest.changeAddress.address, {
                ...vectorTest.changeAddress.meta,
                keyIdentifier: new KeyIdentifier({
                  derivationAlgorithm: 'BIP32',
                  derivationPath,
                  assetName: 'bitcoin',
                  keyType: 'secp256k1',
                }),
                walletAccount: walletAccount.toString(),
              })
            )
          }

          const unusedChangeAddressTest = async ({ addressProvider, asset }) => {
            const derivationPath = `m/${vectorTest.unusedChangeAddress.meta.purpose}'/0'/0'/${vectorTest.unusedChangeAddress.meta.path.replace('m/', '')}`
            const address = await addressProvider.getUnusedAddress({
              assetName: asset.name,
              walletAccount,
              chainIndex: 1,
            })
            expect(address).toEqual(
              new Address(vectorTest.unusedChangeAddress.address, {
                ...vectorTest.unusedChangeAddress.meta,
                keyIdentifier: new KeyIdentifier({
                  derivationAlgorithm: 'BIP32',
                  derivationPath,
                  assetName: 'bitcoin',
                  keyType: 'secp256k1',
                }),
                walletAccount: walletAccount.toString(),
              })
            )
          }

          const tests = {
            supportedPurposesTest,
            receiveAddressTest,
            changeAddressTest,
            unusedChangeAddressTest,
          }

          return Object.entries(tests).map(([name, test]) => {
            return [`${walletAccount.source}_${walletAccount.model || 'default'} ${name}`, test]
          })
        })
      )

      const walletAcountInstances = vectorTests.tests.map((vectorTest) => vectorTest.walletAccount)

      walletTester({
        assetPlugin,
        seed: vectorTests.seed,
        compatibilityMode: vectorTests.compatibilityMode,
        walletAcountInstances,
        tests,
      })
    })
  })
})
