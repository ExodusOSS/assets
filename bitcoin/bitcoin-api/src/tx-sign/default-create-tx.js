import { Psbt as DefaultPsbt, Transaction as DefaultTransaction } from '@exodus/bitcoinjs'
import assert from 'minimalistic-assert'

import { extractTransaction } from './common.js'
import { createSignWithWallet } from './create-sign-with-wallet.js'
import { createPrepareForSigning } from './default-prepare-for-signing.js'

export const signTxFactory = ({
  assetName,
  resolvePurpose,
  coinInfo,
  network,
  getKeyIdentifier,
  Psbt = DefaultPsbt,
  Transaction = DefaultTransaction,
}) => {
  assert(assetName, 'assetName is required')
  assert(resolvePurpose, 'resolvePurpose is required')
  assert(coinInfo, 'coinInfo is required')

  const prepareForSigning = createPrepareForSigning({
    assetName,
    resolvePurpose,
    coinInfo,
    Psbt,
    Transaction,
  })

  return async ({ unsignedTx, hdkeys, privateKeysAddressMap, signer }) => {
    assert(unsignedTx, 'unsignedTx is required')
    assert(
      hdkeys || privateKeysAddressMap || signer,
      'hdkeys or privateKeysAddressMap or signer is required'
    )

    const { addressPathsMap, accountIndex, compatibilityMode } = unsignedTx.txMeta

    const psbt = prepareForSigning({ unsignedTx })

    const inputsToSign = unsignedTx.txMeta.inputsToSign || unsignedTx.txData.inputs
    const signWithWallet = createSignWithWallet({
      signer,
      hdkeys,
      resolvePurpose,
      privateKeysAddressMap,
      addressPathsMap,
      coinInfo,
      network,
      getKeyIdentifier: (args) => {
        assert(
          !('accountIndex' in args) || args.accountIndex === accountIndex,
          '`accountIndex` mismatch'
        )
        return getKeyIdentifier({ compatibilityMode, ...args, accountIndex })
      },
    })

    const skipFinalize = !!unsignedTx.txData.psbtBuffer || unsignedTx.txMeta.returnPsbt
    await signWithWallet(psbt, inputsToSign, skipFinalize)
    return extractTransaction({ psbt, skipFinalize })
  }
}
