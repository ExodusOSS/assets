export function extractTransaction({ psbt, skipFinalize }) {
  // If a dapp authored the TX, it expects a serialized PSBT response.
  // Note: we wouldn't be able to finalise inputs in some cases that's why we serialize before finalizing inputs.

  if (skipFinalize) {
    const rawPSBT = psbt.toBuffer()

    return { plainTx: { rawPSBT } }
  }

  // Serialize tx
  psbt.finalizeAllInputs()
  const tx = psbt.extractTransaction()
  const rawTx = tx.toBuffer()
  const txId = tx.getId()

  // tx needs to be serializable for desktop RPC send => sign communication
  return { rawTx, txId, tx: serializeTx({ tx }) }
}

export const serializeTx = ({ tx }) => {
  // for desktop compatibility
  return {
    virtualSize: tx.virtualSize?.(),
    outs: tx.outs?.map((out) => ({
      script: out.script.toString('hex'),
    })),
  }
}
