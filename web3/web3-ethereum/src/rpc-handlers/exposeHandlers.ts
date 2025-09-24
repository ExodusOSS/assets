import { SignTypedDataVersion } from '@exodus/ethereumjs/eth-sig-util'
import {
  AssetNotSupportedError,
  InvalidInputError,
  UnauthorizedError,
  UnsupportedMethodError,
  UserRejectedRequestError,
} from '@exodus/web3-errors'
import {
  bufferToHex0xString,
  hex0xStringToBuffer,
} from '@exodus/web3-ethereum-utils'
import { connect } from '@exodus/web3-rpc-handlers'
import { hexToBN } from '@exodus/web3-utils'

import { parseAndValidateTypedData } from './parseAndValidateTypedData.js'

import type { AddEthereumChainParameter } from '../provider/index.js'
import type { EVMDeps, FeeData } from '../types.js'
import type {
  MessageTypes as MessageTypes,
  TypedDataV1 as TypedDataV1,
  TypedMessage as TypedMessage,
} from '@exodus/ethereumjs/eth-sig-util'
import type {
  EthParentCapability,
  EthTransaction,
  EthTransactionHash,
  EthWalletPermission,
  EthWalletSwitchEthereumChain,
  EthWalletWatchAsset,
} from '@exodus/web3-ethereum-utils'
import type { AppDeps, RPC, WalletDeps } from '@exodus/web3-types'

// See: https://eips.ethereum.org/EIPS/eip-2255.
const ETH_ACCOUNTS_PERMISSION = 'eth_accounts'

const PROXIED_METHODS = [
  'eth_blockNumber',
  'eth_call',
  'eth_coinbase',
  'eth_createAccessList',
  'eth_estimateGas',
  'eth_feeHistory',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getCompilers',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getWork',
  'eth_maxPriorityFeePerGas',
  'eth_hashrate',
  'eth_pendingTransactions',
  'eth_sendRawTransaction',
  'eth_submitWork',
  'net_version',
  // TODO: Should we handle the response like MetaMask, e.g. "MetaMask/v10.14.7"?
  'web3_clientVersion',
]

function typedDataToMessage(
  typedData: string | TypedDataV1 | TypedMessage<MessageTypes>,
  // TODO: Remove eslint-disable comment when implementing.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  version: SignTypedDataVersion,
): string {
  // TODO: Return human-readable message from typed data.
  return typedData.toString()
}

/*
 Checks if a transaction gas limit value exceeds a block gas limit.
 If so, it means that a dapp mistakenly attached an invalid value to a transaction object.
 */
const isValidGasLimitValue = (value: string): boolean => {
  if (!value) {
    return false
  }

  // Note: we consider 100 million gas units as a threshold value (BSC has that highest limit at the moment).
  const maximumBlockGasLimit = hexToBN('0x3b9aca00')
  const proposedGasLimit = hexToBN(value)

  return proposedGasLimit.lte(maximumBlockGasLimit)
}

export function exposeHandlers(rpc: RPC, deps: AppDeps & EVMDeps & WalletDeps) {
  const {
    chainId,
    isTrusted,
    isAutoApproved,
    ensureTrusted,
    ensureUntrusted,
    approveConnection,
    approveMessage,
    approveTransactions,
    forwardRequest,
    getSupportedChainIds = async () => [],
    getAddress,
    getEstimatedGas,
    getCustomFeeData,
    getFeeData,
    getNonce,
    sendRawTransaction,
    simulateEthereumTransactions,
    scanDomains,
    onTransactionsSigned = () => {},
    onEthWalletWatchAssetRequest = () => {},
    isUnlocked = () => true,
    ensureUnlocked = async () => true,
    getIsConnected,
    getAsset,
    addEthereumChain,
    getOrigin,
    getPathname,
    getActiveWalletAccountData,
    transactionSigner,
    messageSigner,
  } = deps

  const network = `evm:${chainId}`

  async function assertTrusted() {
    const trusted = await isTrusted()
    if (!trusted) {
      throw new UnauthorizedError()
    }
  }

  // Fee data might be not available in rare cases if the monitors hasn't yet started.
  // In that case we'll fetch the actual gas price and treat the transaction as legacy (no EIP-1559).
  async function gracefullyHandleMissingFeeData(): Promise<FeeData> {
    const feeData = await getFeeData()
    if (feeData) {
      return feeData
    }

    const gasPrice = (await forwardRequest({
      method: 'eth_gasPrice',
    })) as unknown as string

    return {
      gasPrice,
    }
  }

  async function prepareTransaction(
    transaction: EthTransaction,
  ): Promise<EthTransaction> {
    const transactionNeedsGasPrice =
      !transaction.gasPrice || !transaction.maxFeePerGas

    const preparedTransaction = { ...transaction }

    preparedTransaction.nonce = await getNonce()

    if (!transaction.value) {
      preparedTransaction.value = '0x0'
    }

    if (transactionNeedsGasPrice) {
      const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } =
        await gracefullyHandleMissingFeeData()

      const eip1559Enabled =
        maxFeePerGas !== undefined && maxPriorityFeePerGas !== undefined

      if (!transaction.gasPrice && !eip1559Enabled) {
        preparedTransaction.gasPrice = gasPrice
      }

      if (!transaction.maxFeePerGas && eip1559Enabled) {
        preparedTransaction.maxFeePerGas = maxFeePerGas
      }

      if (!transaction.maxPriorityFeePerGas && eip1559Enabled) {
        preparedTransaction.maxPriorityFeePerGas = maxPriorityFeePerGas
      }
    }

    if (!transaction.data) {
      preparedTransaction.data = '0x'
    }

    // NOTE: Keep this at the end as other parameters can affect gas estimation.
    if (!transaction.gas || !isValidGasLimitValue(transaction.gas)) {
      preparedTransaction.gas = await getEstimatedGas(preparedTransaction)
    }

    return preparedTransaction
  }

  async function applyCustomFeeRate(
    transaction: EthTransaction,
  ): Promise<EthTransaction> {
    const feeData = await getCustomFeeData()
    if (feeData) {
      const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = feeData
      return { ...transaction, gasPrice, maxFeePerGas, maxPriorityFeePerGas }
    } else {
      return transaction
    }
  }

  function validateTransaction(transaction: EthTransaction): void {
    const gasKeys: (keyof EthTransaction)[] = [
      'gas',
      'gasPrice',
      'maxFeePerGas',
      'maxPriorityFeePerGas',
    ]
    for (const key of gasKeys) {
      if (transaction[key] === '0x') {
        throw new InvalidInputError()
      }
    }
  }

  async function approve<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ApprovalFn extends (...args: any[]) => Promise<boolean>,
  >(approvalFn: ApprovalFn, ...args: Parameters<ApprovalFn>): Promise<void> {
    const autoApproved = await isAutoApproved()
    if (autoApproved) {
      return
    }

    const approved = await approvalFn(...args)
    if (!approved) {
      throw new UserRejectedRequestError()
    }
  }

  async function approveAndSignTransaction(
    transaction: EthTransaction,
  ): Promise<string> {
    await assertTrusted()
    await ensureUnlocked()

    const asset = await getAsset(network)

    const preparedTransaction = await prepareTransaction(transaction)
    validateTransaction(preparedTransaction)

    const origin = getOrigin()
    const pathname = getPathname ? getPathname() : ''

    const simulatedChanges = await simulateEthereumTransactions({
      asset,
      transactions: [preparedTransaction],
      origin: origin + pathname,
    })

    await approve(approveTransactions, network, simulatedChanges)

    const modifiedTransaction = await applyCustomFeeRate(preparedTransaction)

    const isEIP1559Enabled = !!modifiedTransaction.maxFeePerGas
    const walletAccount = await getActiveWalletAccountData()
    const { rawTx: signedTransaction, txId } =
      await transactionSigner.signTransaction({
        baseAssetName: asset.baseAssetName,
        walletAccount,
        unsignedTx: {
          txData: {
            ...modifiedTransaction,
            gasLimit: modifiedTransaction.gas,
            chainId: Number.parseInt(chainId),
          },
          txMeta: { eip1559Enabled: isEIP1559Enabled },
        },
      })

    onTransactionsSigned(network, ['0x' + txId!])

    return `0x${Buffer.from(signedTransaction).toString('hex')}`
  }

  async function approveAndSignMessage(message: string): Promise<string> {
    await assertTrusted()
    await ensureUnlocked()

    await approve(approveMessage, network, message)

    const walletAccount = await getActiveWalletAccountData()
    const asset = await getAsset(network)

    const signedMessageBuffer = await messageSigner.signMessage({
      walletAccount,
      baseAssetName: asset.baseAssetName,
      message: {
        rawMessage: hex0xStringToBuffer(message),
      },
    })

    return bufferToHex0xString(signedMessageBuffer)
  }

  async function approveAndSignTypedData(typedData: string): Promise<string> {
    await assertTrusted()
    await ensureUnlocked()

    const walletAccount = await getActiveWalletAccountData()
    const asset = await getAsset(network)
    const address = await getAddress()

    const parsedTypedData = parseAndValidateTypedData(typedData, { chainId })

    const message = typedDataToMessage(typedData, SignTypedDataVersion.V4)
    const simulationResult = await asset.baseAsset.api.web3.simulateMessage!({
      address,
      message,
      url: new URL(getOrigin()),
    })
    await approve(
      approveMessage,
      network,
      message,
      walletAccount.toString(),
      simulationResult,
    )

    const signedMessageBuffer = await messageSigner.signMessage({
      walletAccount,
      baseAssetName: asset.baseAssetName,
      message: {
        EIP712Message: parsedTypedData,
      },
    })

    return bufferToHex0xString(signedMessageBuffer)
  }

  function exposeEvmFunction(
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fn: (...args: any[]) => Promise<unknown>,
  ) {
    return rpc.exposeFunction(`${chainId}_${name}`, fn)
  }

  PROXIED_METHODS.forEach((method) => {
    exposeEvmFunction(
      method,
      async (...params: unknown[]): Promise<unknown> => {
        // TODO: Do we need to check `assertTrusted` here?
        // See: https://eips.ethereum.org/EIPS/eip-1193#connectivity.
        // TODO: Check support for named params (i.e. object).
        const args = { method, params }
        return forwardRequest(args)
      },
    )
  })

  exposeEvmFunction('eth_isConnected', async (): Promise<boolean> => {
    if (!getIsConnected) {
      throw new UnsupportedMethodError()
    }

    return getIsConnected()
  })

  exposeEvmFunction('eth_accounts', async (): Promise<string[]> => {
    const unlocked = await isUnlocked()
    if (!unlocked) {
      return []
    }

    const trusted = await isTrusted()
    if (!trusted) {
      return []
    }

    const address = await getAddress()
    return [address]
  })

  exposeEvmFunction('eth_signTransaction', approveAndSignTransaction)

  exposeEvmFunction(
    'eth_sendTransaction',
    async (transaction: EthTransaction): Promise<EthTransactionHash> => {
      const rawTransaction = await approveAndSignTransaction(transaction)
      return sendRawTransaction(rawTransaction)
    },
  )

  exposeEvmFunction('personal_sign', approveAndSignMessage)

  exposeEvmFunction(
    'eth_sign',
    async (account: string, message: string): Promise<string> =>
      // Should we really be using `personalSign` here?
      // See: https://docs.metamask.io/guide/signing-data.html#a-brief-history.
      approveAndSignMessage(message),
  )

  exposeEvmFunction(
    'eth_signTypedData_v1',
    async (typedData: TypedDataV1): Promise<string> => {
      await assertTrusted()
      await ensureUnlocked()

      const message = typedDataToMessage(typedData, SignTypedDataVersion.V1)
      await approve(approveMessage, network, message)

      const walletAccount = await getActiveWalletAccountData()
      const asset = await getAsset(network)

      const signedMessageBuffer = await messageSigner.signMessage({
        walletAccount,
        baseAssetName: asset.baseAssetName,
        message: {
          EIP712Message: typedData,
        },
      })

      return bufferToHex0xString(signedMessageBuffer)
    },
  )

  exposeEvmFunction(
    'eth_signTypedData_v3',
    async (account: string, typedData: string): Promise<string> =>
      approveAndSignTypedData(typedData),
  )

  exposeEvmFunction(
    'eth_signTypedData_v4',
    async (account: string, typedData: string): Promise<string> =>
      approveAndSignTypedData(typedData),
  )

  exposeEvmFunction(
    'eth_signTypedData',
    async (account: string, typedData: string): Promise<string> =>
      approveAndSignTypedData(typedData),
  )

  exposeEvmFunction(
    'wallet_getPermissions',
    async (): Promise<EthWalletPermission[]> => {
      const permissions: EthWalletPermission[] = []

      const trusted = await isTrusted()
      if (trusted) {
        permissions.push({ parentCapability: ETH_ACCOUNTS_PERMISSION })
      }

      return permissions
    },
  )

  exposeEvmFunction(
    'wallet_requestPermissions',
    async (
      requestedPermissions: Record<EthParentCapability, Record<string, never>>,
    ): Promise<EthWalletPermission[]> => {
      const parentCapability = Object.keys(requestedPermissions)[0]
      if (parentCapability !== ETH_ACCOUNTS_PERMISSION) {
        // `eth_accounts` is currently the only permission.
        // See: https://docs.metamask.io/guide/rpc-api.html#restricted-methods.
        throw new InvalidInputError()
      }

      await connect(
        {
          approveConnection,
          ensureTrusted,
          isTrusted,
          ensureUnlocked,
          getOrigin,
          getPathname,
          scanDomains,
        },
        network,
      )

      return [{ parentCapability: ETH_ACCOUNTS_PERMISSION }]
    },
  )

  exposeEvmFunction(
    'wallet_switchEthereumChain',
    async (param: EthWalletSwitchEthereumChain): Promise<boolean> => {
      await assertTrusted()

      const chainId = param.chainId

      const supportedChainIds = await getSupportedChainIds()

      return supportedChainIds.includes(chainId)
    },
  )

  exposeEvmFunction(
    'wallet_addEthereumChain',
    async (param: AddEthereumChainParameter): Promise<null> => {
      await assertTrusted()

      if (!addEthereumChain) {
        // provide the right codes https://docs.metamask.io/wallet/reference/wallet_addethereumchain/
        throw new UnsupportedMethodError()
      }

      return addEthereumChain(param)
    },
  )

  exposeEvmFunction(
    'wallet_watchAsset',
    async (param: EthWalletWatchAsset): Promise<boolean> => {
      await assertTrusted()

      const assetAdded = await onEthWalletWatchAssetRequest(param)
      if (!assetAdded) {
        throw new AssetNotSupportedError(param.type)
      }

      return true
    },
  )

  exposeEvmFunction('wallet_getSnaps', async (): Promise<boolean> => {
    throw new UnsupportedMethodError()
  })

  exposeEvmFunction(
    'wallet_revokePermissions',
    async (
      permissions: Record<EthParentCapability, Record<string, never>>,
    ): Promise<null> => {
      const parentCapability = Object.keys(permissions)[0]
      if (parentCapability !== ETH_ACCOUNTS_PERMISSION) {
        // `eth_accounts` is currently the only permission.
        throw new InvalidInputError()
      }

      await ensureUntrusted()

      return null
    },
  )
}
