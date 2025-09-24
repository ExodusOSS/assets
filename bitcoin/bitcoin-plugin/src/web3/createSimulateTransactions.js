import { createSimulateTransactions as createSimulateBitcoinTransactions } from '@exodus/web3-bitcoin-utils'
import assert from 'minimalistic-assert'

// This function accepts either a list of transactions created by a wallet (unsignedTxs) or a web3 transaction (transactionBuffers).
export const createSimulateTransactions = ({
  assetClientInterface,
  baseAssetName,
  currency,
  insightClient,
  prepareForSigning,
}) => {
  assert(assetClientInterface, '"assetClientInterface" should be passed.')
  assert(baseAssetName, '"baseAssetName" should be passed.')
  assert(currency, '"currency" should be passed.')
  assert(insightClient, '"insightClient" should be passed.')
  assert(prepareForSigning, '"prepareForSigning" should be passed')

  const simulateBitcoinTransactions = createSimulateBitcoinTransactions({
    baseAssetName,
    currency,
    insightClient,
    logger: assetClientInterface.createLogger(`${baseAssetName}:simulation`),
  })

  return function simulateTransactions({ transactionBuffers, unsignedTxs, ...restParameters }) {
    if (transactionBuffers && unsignedTxs) {
      throw new Error('Can not supply both "transactionBuffer" and "unsignedTx".')
    }

    if (transactionBuffers) {
      assert(
        transactionBuffers.length === 1,
        'Simulation for multiple transactions is not supported.'
      )

      // The buffer can be a Uint8Array instance. Casting to a Buffer to ensure that ".toString('base64')" works.
      const psbtBase64 = Buffer.from(transactionBuffers[0]).toString('base64')

      return simulateBitcoinTransactions({ transactions: [psbtBase64], ...restParameters })
    }

    if (unsignedTxs) {
      assert(unsignedTxs.length === 1, 'Simulation for multiple transactions is not supported.')

      const unsignedTx = unsignedTxs[0]
      const psbtBase64 = prepareForSigning({ unsignedTx }).toBase64()
      const walletAddresses = Object.keys(unsignedTx.txMeta.addressPathsMap).reduce(
        (acc, current) => {
          acc[current] = true
          return acc
        },
        {}
      )
      const indexToAddressRecord = unsignedTx.txData.inputs.reduce((acc, current, index) => {
        if (!walletAddresses[current.address]) return acc

        acc[index] = {
          address: current.address,
          sigHash: 1,
        }

        return acc
      }, {})

      return simulateBitcoinTransactions({
        transactions: [psbtBase64],
        walletAddresses,
        indexToAddressRecord,
      })
    }
  }
}
