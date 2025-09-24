import { bip371, payments, Transaction } from '@exodus/bitcoinjs'
import { publicKeyToX } from '@exodus/crypto/secp256k1'

import { createGetKeyWithMetadata } from './create-get-key-and-purpose.js'
import { toAsyncBufferSigner, toAsyncSigner } from './taproot.js'

export function createSignWithWallet({
  signer,
  hdkeys,
  resolvePurpose,
  privateKeysAddressMap,
  addressPathsMap,
  coinInfo,
  getKeyIdentifier,
  getPrivateKeyFromMap,
}) {
  const getKeyWithMetadata = createGetKeyWithMetadata({
    signer,
    hdkeys,
    resolvePurpose,
    privateKeysAddressMap,
    addressPathsMap,
    coinInfo,
    getKeyIdentifier,
    getPrivateKeyFromMap,
  })

  return async (psbt, inputsToSign, skipFinalize) => {
    // The Taproot SIGHASH flag includes all previous outputs,
    // so signing is only done AFTER all inputs have been updated
    const signingPromises = []

    for (let index = 0; index < psbt.inputCount; index++) {
      const inputInfo = inputsToSign[index]
      // dApps request to sign only specific transaction inputs.
      if (!inputInfo) continue

      const input = psbt.data.inputs[index]
      const { address, sigHash, derivationPath } = inputInfo
      // The sighash value from the PSBT input itself will be used.
      // This list just represents possible sighash values the inputs can have.
      const allowedSigHashTypes =
        sigHash === undefined
          ? undefined // `SIGHASH_DEFAULT` is a default safe sig hash, always allow it.
          : [sigHash, Transaction.SIGHASH_ALL]
      const { keyId, privateKey, publicKey, purpose } = await getKeyWithMetadata({
        address,
        derivationPath,
      })

      const isTaprootInput = bip371.isTaprootInput(input)
      const isTapLeafScriptSpend = input.tapLeafScript && input.tapLeafScript.length > 0
      const isTaprootKeySpend = isTaprootInput && !isTapLeafScriptSpend

      if (isTaprootInput) {
        if (isTaprootKeySpend && !Buffer.isBuffer(input.tapInternalKey)) {
          // tapInternalKey is metadata for signing and not part of the hash to sign.
          // so modifying it here is fine.
          psbt.updateInput(index, { tapInternalKey: publicKeyToX({ publicKey, format: 'buffer' }) })
        }
      } else if (purpose === 49 && !skipFinalize) {
        // If spending from a P2SH address, we assume the address is P2SH wrapping
        // P2WPKH. Exodus doesn't use P2SH addresses so we should only ever be
        // signing a P2SH input if we are importing a private key
        // BIP143: As a default policy, only compressed public keys are accepted in P2WPKH and P2WSH
        const p2wpkh = payments.p2wpkh({ pubkey: publicKey })
        const p2sh = payments.p2sh({ redeem: p2wpkh })
        if (address === p2sh.address) {
          // Set the redeem script in the psbt in case it's missing.
          if (!Buffer.isBuffer(input.redeemScript)) {
            psbt.updateInput(index, {
              redeemScript: p2sh.redeem.output,
            })
          }
        } else {
          throw new Error('Expected P2SH script to be a nested segwit input')
        }
      }

      const asyncSigner = signer
        ? await toAsyncBufferSigner({ signer, isTaprootKeySpend, keyId })
        : toAsyncSigner({ privateKey, publicKey, isTaprootKeySpend })

      // desktop / BE / mobile with bip-schnorr signing
      signingPromises.push(psbt.signInputAsync(index, asyncSigner, allowedSigHashTypes))
    }

    await Promise.all(signingPromises)
  }
}
