import type {
  Commitment as SolCommitment,
  SendOptions as SolSendOptions,
} from '@exodus/solana-web3.js/lib/connection.js'
import { createSimulationServices } from '@exodus/web3-simulation'
import type { AssetClientInterface, Bytes } from '@exodus/web3-types'
import assert from 'minimalistic-assert'

import type { CreateSolanaDepsParams, SolanaDeps } from '../types.js'

export const createSolanaDepsFactory = ({
  assetClientInterface,
}: {
  assetClientInterface: AssetClientInterface
}) => {
  return ({
    getActiveWalletAccountData,
    getWalletAccountsData,
    getAddress,
    getAddressByWalletAccount,
    getRecentBlockHash,
    sendRawTransaction: _sendRawTransaction,
    simulationAPIBaseURL,
    transactionSigner,
    messageSigner,
  }: CreateSolanaDepsParams): SolanaDeps => {
    const getPublicKey = async (walletAccount?: string) => {
      if (walletAccount) {
        assert(
          getAddressByWalletAccount,
          'getPublicKey: getAddressByWalletAccount is required when walletAccount is provided',
        )
        const address = await getAddressByWalletAccount('solana', walletAccount)
        return { toBase58: () => address }
      }

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
      getWalletAccountsData,
      getPublicKey,
      getLatestBlockhash,
      sendRawTransaction,
      simulateSolanaTransactions,
      messageSigner,
      transactionSigner,
    }
  }
}
