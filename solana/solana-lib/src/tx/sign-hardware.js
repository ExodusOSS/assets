import assert from 'minimalistic-assert'

import { PublicKey } from '../vendor/index.js'
import { extractTransaction } from './common.js'
import { prepareForSigning } from './prepare-for-signing.js'

export async function signHardware({ unsignedTx, hardwareDevice, accountIndex }) {
  assert(hardwareDevice, 'expected hardwareDevice to be defined')
  assert(Number.isInteger(accountIndex) && accountIndex >= 0, 'expected accountIndex to be integer')

  const tx = prepareForSigning(unsignedTx)
  const signatures = await signWithHardwareWallet({ tx, hardwareDevice, accountIndex })
  applySignatures({ tx, signatures })

  return extractTransaction({ tx })
}

const signWithHardwareWallet = async ({ tx, hardwareDevice, accountIndex }) => {
  assert(hardwareDevice, `hardwareDevice required`)
  assert(Number.isInteger(accountIndex), `accountIndex required`)

  const messageToSign = tx.message.serialize()

  return hardwareDevice.signTransaction({
    assetName: 'solana',
    signableTransaction: Buffer.from(messageToSign),
    derivationPaths: [`m/44'/501'/${accountIndex}'`],
  })
}

const applySignatures = ({ tx, signatures }) => {
  signatures.forEach(({ publicKey, signature }) => {
    tx.addSignature(new PublicKey(publicKey), signature)
  })
}
