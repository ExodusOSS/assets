import assert from 'minimalistic-assert'

import { extractTransaction } from './common.js'
import { createPrepareForSigning } from './default-prepare-for-signing.js'

export const signHardwareFactory = ({ assetName, resolvePurpose, keys, coinInfo }) => {
  assert(assetName, 'assetName is required')
  assert(resolvePurpose, 'resolvePurpose is required')
  assert(keys, 'keys is required')
  assert(coinInfo, 'coinInfo is required')

  const prepareForSigning = createPrepareForSigning({
    assetName,
    resolvePurpose,
    coinInfo,
  })

  const signWithHardwareWallet = createSignWithHardwareWallet({
    assetName,
    resolvePurpose,
  })

  return async ({ unsignedTx, hardwareDevice, accountIndex, multisigData }) => {
    assert(unsignedTx, 'unsignedTx is required')
    assert(hardwareDevice, 'hardwareDevice is required')
    assert(Number.isInteger(accountIndex), 'accountIndex must be integer')

    const { addressPathsMap } = unsignedTx.txMeta

    const psbt = prepareForSigning({ unsignedTx })

    const inputsToSign = unsignedTx.txMeta.inputsToSign || unsignedTx.txData.inputs

    await signWithHardwareWallet({
      psbt,
      inputsToSign,
      addressPathsMap,
      hardwareDevice,
      accountIndex,
      multisigData,
    })

    const skipFinalize = !!unsignedTx.txData.psbtBuffer || unsignedTx.txMeta.returnPsbt
    return extractTransaction({ psbt, skipFinalize })
  }
}

function createSignWithHardwareWallet({ assetName, resolvePurpose }) {
  return async ({
    psbt,
    inputsToSign,
    addressPathsMap,
    accountIndex,
    hardwareDevice,
    multisigData,
  }) => {
    const derivationPathsMap = getDerivationPathsMap({
      resolvePurpose,
      addressPathsMap,
      accountIndex,
    })
    const signatures = await hardwareDevice.signTransaction({
      assetName,
      signableTransaction: psbt.toBuffer(),
      derivationPaths: Object.values(derivationPathsMap),
      derivationPathsMap,
      multisigData,
    })

    if (multisigData) {
      applyMultisigSignatures(psbt, signatures)
    } else {
      applySignatures(psbt, signatures, inputsToSign)
    }
  }
}

function getDerivationPathsMap({ resolvePurpose, accountIndex, addressPathsMap }) {
  const derivationPathsMap = Object.create(null)
  for (const [address, path] of Object.entries(addressPathsMap)) {
    const purpose = resolvePurpose(address)
    const derivationPath = `m/${purpose}'/0'/${accountIndex}'/${path.slice(2)}` // TODO: coinindex
    derivationPathsMap[address] = derivationPath
  }

  return derivationPathsMap
}

function applyMultisigSignatures(psbt, signatures) {
  for (const signature of signatures) {
    const input = psbt.data.inputs[signature.inputIndex]
    if (!input.tapScriptSig) input.tapScriptSig = []
    input.tapScriptSig.push({
      pubkey: signature.publicKey,
      signature: signature.signature,
      leafHash: signature.tapleafHash,
    })
  }
}

export function applySignatures(psbt, signatures, inputsToSign) {
  for (let inputIndex = 0; inputIndex < psbt.inputCount; inputIndex++) {
    const shouldSign = !!inputsToSign[inputIndex]
    if (shouldSign) {
      const signature = signatures.find((signature) => signature.inputIndex === inputIndex)
      if (signature) {
        const isTaprootSig = signature.publicKey.length === 32
        if (isTaprootSig) {
          psbt.data.updateInput(inputIndex, {
            tapKeySig: signature.signature,
          })
        } else {
          psbt.data.updateInput(inputIndex, {
            partialSig: [
              {
                pubkey: signature.publicKey,
                signature: signature.signature,
              },
            ],
          })
        }
      } else {
        throw new Error(
          `expected to sign for inputIndex ${inputIndex} but no signature was produced`
        )
      }
    }
  }
}
