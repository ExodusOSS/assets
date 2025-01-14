import { getTxSequence } from '@exodus/bitcoin-lib'

export function createInputs(utxos) {
  return utxos.map((utxo) => ({
    txId: utxo.txId,
    vout: utxo.vout,
    address: utxo.address.toString(),
    value: utxo.value.toBaseBufferLE(8),
    script: utxo.script,
    sequence: getTxSequence(),
    derivationPath: utxo.derivationPath,
  }))
}

export function createOutput(address, sendAmount) {
  return [address, sendAmount.toBaseBufferLE(8)]
}
