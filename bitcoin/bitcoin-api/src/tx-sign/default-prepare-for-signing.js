import { Psbt as DefaultPsbt, Transaction as DefaultTransaction } from '@exodus/bitcoinjs'
import assert from 'minimalistic-assert'

import { writePsbtBlockHeight } from '../psbt-proprietary-types.js'

const _MAXIMUM_FEE_RATES = {
  qtumignition: 25_000,
  ravencoin: 1_000_000,
}

/**
 * Factory function that create the prepareForSigning function for a bitcoin-like asset.
 * @param { assetName, resolvePurpose, coinInfo} dependencies
 * @returns A prepareForSigning function that returns a PSBTv1 as buffer
 */
export function createPrepareForSigning({
  assetName,
  resolvePurpose,
  coinInfo,
  Psbt = DefaultPsbt,
  Transaction = DefaultTransaction,
}) {
  assert(assetName, 'assetName is required')
  assert(resolvePurpose, 'resolvePurpose is required')
  assert(coinInfo, 'coinInfo is required')

  return ({ unsignedTx }) => {
    const networkInfo = coinInfo.toBitcoinJS()

    const isPsbtBufferPassed =
      unsignedTx.txData.psbtBuffer &&
      unsignedTx.txMeta.addressPathsMap &&
      unsignedTx.txMeta.inputsToSign
    if (isPsbtBufferPassed) {
      // PSBT created externally (Web3, etc..)
      return createPsbtFromBuffer({
        Psbt,
        psbtBuffer: unsignedTx.txData.psbtBuffer,
        networkInfo,
      })
    }

    // Create PSBT based on internal Exodus data structure
    const psbt = createPsbtFromTxData({
      assetName,
      ...unsignedTx.txData,
      ...unsignedTx.txMeta,
      resolvePurpose,
      networkInfo,
      Psbt,
      Transaction,
    })
    if (!['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(assetName)) psbt.setVersion(1)

    return psbt
  }
}

// Creates a PSBT instance from the passed transaction buffer provided by 3rd parties (e.g. dApps).
function createPsbtFromBuffer({ Psbt, psbtBuffer, ecc, networkInfo }) {
  return Psbt.fromBuffer(psbtBuffer, { eccLib: ecc, network: networkInfo })
}

// Creates a PSBT instance from the passed inputs, outputs etc. The wallet itself provides this data.
function createPsbtFromTxData({
  inputs,
  outputs,
  rawTxs,
  networkInfo,
  resolvePurpose,
  assetName,
  Psbt,
  Transaction,
  blockHeight,
}) {
  // use harcoded max fee rates for specific assets
  // if undefined, will be set to default value by PSBT (2500)
  const maximumFeeRate = _MAXIMUM_FEE_RATES[assetName]

  const psbt = new Psbt({ maximumFeeRate, network: networkInfo })

  // If present, add blockHeight as a proprietary field
  if (blockHeight !== undefined) {
    writePsbtBlockHeight(psbt, blockHeight)
  }

  const assetRequiresUtxoInInput = !['zcash', 'decred'].includes(assetName)

  // Fill tx
  for (const { txId, vout, address, value, script, sequence, tapLeafScript } of inputs) {
    // TODO: don't use the purpose as intermediate variable
    // see internals of `resolvePurposes`, just use `isP2TR, isP2SH etc directly
    const purpose = resolvePurpose(address)

    const isSegwitAddress = purpose === 84
    const isTaprootAddress = purpose === 86

    const txIn = { hash: txId, index: vout, sequence }

    if (!assetRequiresUtxoInInput) {
      txIn.script = script
      txIn.value = value
    }

    if (isTaprootAddress && tapLeafScript) {
      txIn.tapLeafScript = tapLeafScript
    }

    if (isSegwitAddress || isTaprootAddress) {
      // taproot outputs only require the value and the script, not the full transaction
      txIn.witnessUtxo = { value, script: Buffer.from(script, 'hex') }
    }

    const rawTx = (rawTxs || []).find((t) => t.txId === txId)

    if (!isTaprootAddress && assetRequiresUtxoInInput) {
      assert(!!rawTx?.rawData, `Non-taproot outputs require the full previous transaction.`)

      const rawTxBuffer = Buffer.from(rawTx.rawData, 'hex')
      if (canParseTx(Transaction, rawTxBuffer)) {
        txIn.nonWitnessUtxo = rawTxBuffer
      } else {
        // temp fix for https://exodusio.slack.com/archives/CP202D90Q/p1671014704829939 until bitcoinjs could parse a mweb tx without failing
        console.warn(`Setting psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true for asset ${assetName}`)
        psbt.__CACHE.__UNSAFE_SIGN_NONSEGWIT = true
        txIn.witnessUtxo = { value, script: Buffer.from(script, 'hex') }
      }
    }

    psbt.addInput(txIn)
  }

  for (const [address, amount] of outputs) {
    psbt.addOutput({ value: amount, address })
  }

  return psbt
}

const canParseTx = (Transaction, rawTxBuffer) => {
  try {
    Transaction.fromBuffer(rawTxBuffer)
    return true
  } catch {
    return false
  }
}
