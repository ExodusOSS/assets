import BipPath from 'bip32-path'
import lodash from 'lodash'

export const createPsbtToUnsignedTx =
  ({ assetClientInterface, assetName }) =>
  async ({ psbt, walletAccount, purpose = 86 }) => {
    const addressPathsMap = {}
    const inputsToSign = []

    const addressOpts = {
      walletAccount: walletAccount.toString(),
      assetName,
      purpose,
      chainIndex: 0,
      addressIndex: 0,
    }

    // Need to have all input derivations
    for (const i of lodash.range(psbt.inputCount)) {
      const input = psbt.data.inputs[i]

      const derivation = input.tapBip32Derivation
      if (!derivation) {
        throw new Error('Invalid input in psbt, no derivation for input found')
      }

      const [chainIndex, addressIndex] = BipPath.fromString(derivation[0].path).toPathArray()

      addressOpts.chainIndex = chainIndex
      addressOpts.addressIndex = addressIndex

      const address = await assetClientInterface.getAddress(addressOpts)

      addressPathsMap[address.toString()] = derivation[0].path
      inputsToSign.push({ address: address.toString() })
    }

    // If we have output derivations then it's our change
    for (const i of lodash.range(psbt.txOutputs.length)) {
      const output = psbt.data.outputs[i]

      const derivation = output.tapBip32Derivation
      if (!derivation) continue
      const [chainIndex, addressIndex] = BipPath.fromString(derivation[0].path).toPathArray()

      addressOpts.chainIndex = chainIndex
      addressOpts.addressIndex = addressIndex
      const address = await assetClientInterface.getAddress(addressOpts)

      addressPathsMap[address.toString()] = derivation[0].path
    }

    return {
      txData: { psbtBuffer: psbt.toBuffer() },
      txMeta: {
        addressPathsMap,
        inputsToSign,
        accountIndex: walletAccount.index,
      },
    }
  }
