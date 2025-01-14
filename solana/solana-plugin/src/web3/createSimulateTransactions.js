import {
  createSimulateTransactions as createSimulateSolanaTransactions,
  deserializeTransactionBytes,
} from '@exodus/web3-solana-utils'
import assert from 'minimalistic-assert'

// This function accepts either a list of transactions created by a wallet (unsignedTxs) or a web3 transaction (transactionBuffers).
export const createSimulateTransactions = ({ asset, assetClientInterface, prepareForSigning }) => {
  assert(asset, '"asset" should be passed.')
  assert(assetClientInterface, '"assetClientInterface" should be passed.')
  assert(prepareForSigning, '"prepareForSigning" should be passed.')

  const simulateSolanaTransactions = createSimulateSolanaTransactions({ assetClientInterface })

  return function simulateTransactions({ transactionBuffers, unsignedTxs, ...restParameters }) {
    if (unsignedTxs) {
      // Converts to web3.js VersionedTransaction class instances.
      const transactions = unsignedTxs.map((unsignedTx) => {
        return prepareForSigning(unsignedTx, { checkBalances: false })
      })

      return simulateSolanaTransactions({
        asset,
        transactions,
        ...restParameters,
      })
    }

    if (transactionBuffers) {
      // Converts to web3.js Transaction class instances.
      const transactions = transactionBuffers.map((transactionBuffer) =>
        deserializeTransactionBytes(transactionBuffer)
      )

      return simulateSolanaTransactions({
        asset,
        transactions,
        ...restParameters,
      })
    }
  }
}
