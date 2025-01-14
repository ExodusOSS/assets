import { createSimulationServices } from '@exodus/web3-simulation'

import type { CreateSolanaDepsParams, SolanaDeps } from '../types.js'
import type {
  Commitment as SolCommitment,
  SendOptions as SolSendOptions,
} from '@exodus/solana-web3.js/lib/connection.js'
import type { AssetClientInterface, Bytes } from '@exodus/web3-types'

export const createSolanaDepsFactory = ({
  assetClientInterface,
}: {
  assetClientInterface: AssetClientInterface
}) => {
  return ({
    getActiveWalletAccountData,
    getAddress,
    getRecentBlockHash,
    sendRawTransaction: _sendRawTransaction,
    simulationAPIBaseURL,
    transactionSigner,
    messageSigner,
  }: CreateSolanaDepsParams): SolanaDeps => {
    const getPublicKey = async () => {
      const address = await getAddress('solana')
      return { toBase58: () => address }
    }

    const getLatestBlockhash = (commitment?: SolCommitment) =>
      getRecentBlockHash(commitment)

    const sendRawTransaction = (
      rawTransaction: Bytes,
      options: SolSendOptions,
    ) => {
      return _sendRawTransaction(
        'solana',
        Buffer.from(rawTransaction).toString('base64'),
        options,
      )
    }

    const { simulateSolanaTransactions } = createSimulationServices({
      apiBaseURL: simulationAPIBaseURL,
      assetClientInterface,
    })

    return {
      getActiveWalletAccountData,
      getPublicKey,
      getLatestBlockhash,
      sendRawTransaction,
      simulateSolanaTransactions,
      messageSigner,
      transactionSigner,
    }
  }
}
