/*
 This utility makes an API call to a simulation service, parses the response and mutates the supplied "simulationResult" object
 with the according balance changes.
 */

import { pick } from '@exodus/basic-utils'
import { createCurrency, makeSimulationAPICall } from '@exodus/web3-utils'

import { BLOWFISH_EVM_CHAINS, MAX_INT256_SOLIDITY } from './common.js'

import type {
  EthAggregatedTransactionSimulationResult,
  EthSimulateTransactionParams,
  EthTransaction,
} from '../types.js'
import type {
  BalanceChange,
  ScanTransactionsEvm200Response,
  ScanTransactionsEvmRequest,
  EvmExpectedStateChange,
  EvmAmount,
  EvmStateChangeErc20TransferData,
  CreateSimulateTransactionsParams,
  EvmStateChangeErc721TransferData,
  EvmStateChangeErc1155TransferData,
  EvmStateChangeErc721ApprovalData,
  SimulationAttemptSuccess,
  SimulateTransactionsInternalResult,
  SimulationWarning,
} from '@exodus/web3-types'
import type { TransactionScanAPICallParams } from '@exodus/web3-utils'

const convertTransactionToApiPayload = (
  transactions: EthTransaction[],
  origin: string,
): ScanTransactionsEvmRequest => ({
  txObjects: transactions.map((transaction) => ({
    from: transaction.from,
    to: transaction.to!,
    data: transaction.data,
    value: transaction.value,
    gas: transaction.gas,
    gas_price: transaction.gasPrice,
  })),
  metadata: {
    origin,
  },
  userAccount: transactions[0].from,
})

const createBalanceAmount = (
  amount: EvmAmount,
  { decimals, symbol }: { decimals: number; symbol: string },
) => {
  const beforeAmount = createCurrency({
    amount: amount.before,
    symbol: symbol,
    denominator: decimals,
  })
  const afterAmount = createCurrency({
    amount: amount.after,
    symbol: symbol,
    denominator: decimals,
  })

  return beforeAmount.sub(afterAmount)
}

const handleExpectedBalanceChange = (
  expectedBalanceChange: EvmExpectedStateChange,
  simulationResult: EthAggregatedTransactionSimulationResult,
  { network }: { network: string },
) => {
  const { willApprove, willSend, willReceive } = simulationResult.balanceChanges
  const { data, kind } = expectedBalanceChange.rawInfo

  if (kind === 'FARCASTER_CHANGE_RECOVERY_ADDRESS' || kind === 'ERC20_PERMIT') {
    return
  }

  const { asset } = data as EvmStateChangeErc20TransferData

  // ERC1155 is a multi-token standard (https://eips.ethereum.org/EIPS/eip-1155) and can be used for NFTs as well.
  const isNftTransfer =
    kind === 'ERC721_TRANSFER' ||
    (kind === 'ERC1155_TRANSFER' && !asset.decimals)
  const isNftTransferApproval =
    kind === 'ERC721_APPROVAL' ||
    (kind === 'ERC721_APPROVAL_FOR_ALL' && !asset.decimals) ||
    (kind === 'ERC1155_APPROVAL_FOR_ALL' && !asset.decimals)
  const decimals = isNftTransfer || isNftTransferApproval ? 0 : asset.decimals
  const asset_ = pick(asset, [
    'address',
    'imageUrl',
    'name',
    'symbol',
    'verified',
  ])
  // According to the Blowfish docs, `symbol` and `name` can be null as they are not required by the standard.
  // Using `NFT` as a fallback ensures a user sees a meaningful UI in that case.
  let symbol = asset.symbol || asset.name || 'NFT'
  // TODO: remove this once Blowfish completes their migration from Matic to POL.
  if (network === 'polygon' && asset.symbol === 'MATIC') {
    symbol = 'POL'
  }

  if (isNftTransfer || isNftTransferApproval) {
    asset_.imageUrl = (
      data as EvmStateChangeErc721ApprovalData
    )?.metadata?.rawImageUrl
  }

  if (
    kind === 'ERC20_APPROVAL' ||
    kind === 'ERC721_APPROVAL_FOR_ALL' ||
    kind === 'ERC1155_APPROVAL_FOR_ALL' ||
    kind === 'ERC721_APPROVAL'
  ) {
    const unitsToUse = symbol || asset.name || 'Units.'

    const approvingBalance = createCurrency({
      amount: data.amount.after,
      symbol: unitsToUse,
      denominator: decimals,
    })

    willApprove.push({
      asset: asset_,
      spender: data.spender.address,
      unitName: unitsToUse,
      balance: approvingBalance,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore _number exists on NumberUnit, but deprecated
      isMaxApproval: approvingBalance._number.gte(MAX_INT256_SOLIDITY),
    })
    return
  }

  const { amount } = data

  const balance = createBalanceAmount(amount, { decimals, symbol })

  if (balance.isZero) {
    return
  }

  const balanceChange: BalanceChange = {
    asset: asset_,
    balance,
  }

  if (isNftTransfer || isNftTransferApproval) {
    const tokenId = (
      data as
        | EvmStateChangeErc721TransferData
        | EvmStateChangeErc1155TransferData
    ).tokenId
    const compositeId = `${asset.address}/${tokenId}`
    balanceChange.nft = {
      id: `${network}:${compositeId}`,
      compositeId,
      title: asset.name,
    }
  }

  if (balance.isNegative) {
    // Convert to non-negative value.
    balanceChange.balance = balanceChange.balance.negate()

    willReceive.push(balanceChange)
  } else {
    willSend.push(balanceChange)
  }
}

const simulationResultHasAssets = (
  expectedStateChanges: EvmExpectedStateChange[],
): boolean => {
  for (const expectedChange of expectedStateChanges) {
    const { asset } = expectedChange.rawInfo
      .data as EvmStateChangeErc20TransferData
    if (!asset) {
      return false
    }
  }

  return true
}

type SimulateTransactionParams = Required<
  Pick<CreateSimulateTransactionsParams, 'apiEndpoint'>
> &
  Required<
    Pick<EthSimulateTransactionParams, 'asset' | 'transactions' | 'origin'>
  > & {
    simulationResult: EthAggregatedTransactionSimulationResult
    headers?: Record<string, string>
  }

export const enum SimulationErrorMessages {
  'APICallFailed',
  'SimulationFailed',
  'SimulationNotSupported',
}

export const simulateTransactions = async ({
  transactions,
  apiEndpoint,
  origin,
  simulationResult,
  headers,
  asset,
}: SimulateTransactionParams): SimulateTransactionsInternalResult<
  undefined,
  SimulationErrorMessages
> => {
  const successDefaultResult: SimulationAttemptSuccess<undefined> = {
    kind: 'success',
    value: undefined,
  }
  if (!BLOWFISH_EVM_CHAINS[asset.name]) {
    return {
      kind: 'error',
      error: SimulationErrorMessages.SimulationNotSupported,
    }
  }

  const userAddress = transactions[0].from

  const payload = convertTransactionToApiPayload(transactions, origin)

  if (!Object.hasOwnProperty.call(BLOWFISH_EVM_CHAINS, asset.name)) {
    // ToDo: accept a logger dep and log the error
    return successDefaultResult
  }

  const { network, chain } = BLOWFISH_EVM_CHAINS[asset.name]

  const response = await makeSimulationAPICall<
    TransactionScanAPICallParams,
    ScanTransactionsEvm200Response
  >({
    url: apiEndpoint,
    chain,
    network,
    payload,
    headers,
  })
  if (!response) {
    return {
      kind: 'error',
      error: SimulationErrorMessages.APICallFailed,
    }
  }

  simulationResult.metadata.simulatedLocally = false

  const { expectedStateChanges = {}, error } =
    response.simulationResults.aggregated

  if (error) {
    // ToDo: accept a logger dep and log the error
    // ToDo: consider pushing an error to the "warnings" list
    return {
      kind: 'error',
      error: SimulationErrorMessages.SimulationFailed,
      errorMessage: error?.humanReadableError,
    }
  }

  const { action } = response

  if (action === 'BLOCK') {
    const warning: SimulationWarning = {
      kind: 'MALICIOUS_ACTION',
      severity: 'CRITICAL',
      // We use a generic default message unless we find a known warning type below
      // (TODO: add known warning types)
      message:
        'This dApp could be malicious. Do not proceed unless you are certain this is safe.',
    }

    simulationResult.warnings.push(warning)
  }

  const noExpectedStateChangesDetected =
    Object.keys(expectedStateChanges).length === 0

  // This is a self-send transaction, adding a zero "transfer" so that the UI can display it.
  if (noExpectedStateChangesDetected) {
    simulationResult.balanceChanges.willSend.push({
      balance: createCurrency({
        amount: 0,
        symbol: asset.displayTicker,
        denominator: asset.currency.defaultUnit.power,
      }),
    })

    return successDefaultResult
  }

  const userExpectedChanges = Object.keys(expectedStateChanges).reduce(
    (prev: EvmExpectedStateChange[], address: string) => {
      if (userAddress.toLowerCase() !== address.toLowerCase()) {
        return prev
      }

      const result =
        (Object.prototype.hasOwnProperty.call(expectedStateChanges, address) &&
          expectedStateChanges[address]) ||
        []

      return [...prev, ...result]
    },
    [],
  )

  // Return and log if asset is not present in the expectedStateChanges
  if (!simulationResultHasAssets(userExpectedChanges)) {
    // ToDo: accept a logger dep and log the error
    return successDefaultResult
  }

  userExpectedChanges.forEach((expectedChange) => {
    handleExpectedBalanceChange(expectedChange, simulationResult, { network })
  })

  return successDefaultResult
}
