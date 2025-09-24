import { getNonce as apiGetNonce } from '@exodus/ethereum-api'

import type {
  CreateEvmDepsFactoryParams,
  CreateEvmDepsParams,
  EthRequestArguments,
  EVMDeps,
  EVMFactory,
  FeeData,
} from '../types.js'
import type {
  EthTransaction,
  EthWalletWatchAsset,
} from '@exodus/web3-ethereum-utils'

const createEVMDepsFactory = ({
  analytics,
  blockchainMetadata,
}: CreateEvmDepsFactoryParams): EVMFactory => {
  return ({
    addEthereumChain,
    assetName,
    chainId: _chainId,
    origin,
    getAsset,
    getAddress: _getAddress,
    getSupportedChainIds,
    getFeeData: getFeeConfig,
    getCustomFeeRate,
    getActiveWalletAccount,
    simulateEthereumTransactions,
    getActiveWalletAccountData,
    transactionSigner,
    messageSigner,
    onEthWalletWatchAssetRequest: _onEthWalletWatchAssetRequest,
  }: CreateEvmDepsParams): EVMDeps => {
    const getServer = async () => {
      const asset = await getAsset(assetName)

      return asset.server! as {
        proxyToCoinNode?: <Response>(
          args: EthRequestArguments,
        ) => Promise<Response>
        buildRequest: (args: EthRequestArguments) => unknown
        sendRequest: <Response>(request: unknown) => Promise<Response>
        sendRawTransaction: (rawTransaction: string) => Promise<string>
      }
    }

    const forwardRequest = async <Response = unknown>({
      method,
      params,
    }: EthRequestArguments): Promise<Response> => {
      const server = await getServer()
      if (server.proxyToCoinNode) {
        return server.proxyToCoinNode({ method, params })
      }
      const request = server.buildRequest({ method, params })
      return server.sendRequest(request)
    }

    const sendRawTransaction = async (rawTransaction: string) => {
      const server = await getServer()
      return server.sendRawTransaction(rawTransaction)
    }

    const getAddress = async (): Promise<string> => {
      return _getAddress(assetName)
    }

    const getNonce = async () => {
      const asset = await getAsset(assetName)
      const [baseAssetTxLog, blockchainNonce] = await Promise.all([
        blockchainMetadata.getTxLog({
          assetName,
          walletAccount: await getActiveWalletAccount(),
        }),
        apiGetNonce({ asset, address: await getAddress() }),
      ])

      const walletNonce = Array.from(baseAssetTxLog)
        .filter((tx) => tx.sent && !tx.dropped && tx.data.nonce != null)
        .reduce((nonce, tx) => Math.max(tx.data.nonce! + 1, nonce), 0)

      return `0x${Math.max(walletNonce, blockchainNonce).toString(16)}`
    }

    const getEstimatedGas = async (transaction: EthTransaction) => {
      return forwardRequest<string>({
        method: 'eth_estimateGas',
        params: [transaction],
      })
    }

    const getFeeData = async () => {
      const {
        eip1559Enabled,
        tipGasPrice,
        gasPrice: _gasPrice,
      } = await getFeeConfig({
        assetName,
      })

      // gasPrice is actually maxFeePerGas if eip1559 is true
      const gasPrice = `0x${_gasPrice.toBaseNumber().toString(16)}`

      const feeData: FeeData = {
        gasPrice,
      }

      if (eip1559Enabled) {
        feeData.maxPriorityFeePerGas = `0x${tipGasPrice!
          .toBaseNumber()
          .toString(16)}`
        feeData.maxFeePerGas = gasPrice
      }

      return feeData
    }

    const getCustomFeeData = async (): Promise<FeeData | undefined> => {
      const _maxFeePerGas = await getCustomFeeRate?.()
      if (!_maxFeePerGas) {
        // The user did not select a custom fee rate or
        // we didn't supply the function, eitherway nothing should happen.
        return undefined
      }

      const { eip1559Enabled, baseFeePerGas } = await getFeeConfig({
        assetName,
      })

      const maxFeePerGas = `0x${_maxFeePerGas.toBaseNumber().toString(16)}`

      const feeData: FeeData = {
        // If no eip1559 support, so set it to the max
        // Otherwise ignored
        gasPrice: maxFeePerGas,
      }

      if (eip1559Enabled) {
        feeData.maxFeePerGas = maxFeePerGas
        // If our custom fee rate is higher than the base fee rate
        // then compute the priority / tip fee.
        if (baseFeePerGas && _maxFeePerGas.gt(baseFeePerGas)) {
          const maxPriorityFeePerGas = _maxFeePerGas.sub(baseFeePerGas)
          feeData.maxPriorityFeePerGas = `0x${maxPriorityFeePerGas
            .toBaseNumber()
            .toString(16)}`
        }
      }

      return feeData
    }

    const trackWalletWatchAssetUse = _onEthWalletWatchAssetRequest
      ? _onEthWalletWatchAssetRequest
      : async (assetDetails: EthWalletWatchAsset) => {
          // TODO: do we still need this? If yes, this ...assetDetails expansion is no bueno
          // why is this not always returning true in browser?
          analytics.track({
            event: 'DappWalletWatchAsset',
            properties: {
              ...assetDetails,
              dappDomain: origin,
            },
          })
          return true
        }

    return {
      addEthereumChain,
      chainId: _chainId || 'undefined',
      forwardRequest,
      sendRawTransaction,
      getAddress,
      getNonce,
      getFeeData,
      getEstimatedGas,
      getCustomFeeData,
      getSupportedChainIds,
      onEthWalletWatchAssetRequest: trackWalletWatchAssetUse,
      simulateEthereumTransactions,
      transactionSigner,
      messageSigner,
      getActiveWalletAccountData,
    }
  }
}

export default createEVMDepsFactory
