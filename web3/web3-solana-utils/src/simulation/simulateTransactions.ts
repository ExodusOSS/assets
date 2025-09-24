/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
import solanaApi from '@exodus/solana-api'
import { PublicKey } from '@exodus/solana-web3.js'
import type {
  Asset,
  BalanceChange,
  BlowfishSimulationError,
  CompressedNftAsset,
  CreateSimulateTransactionsParams,
  GetFeeData,
  NumberUnit,
  ScanTransactionsSolana200Response,
  ScanTransactionsSolana200ResponseAggregatedExpectedStateChangesValueInner,
  ScanTransactionsSolanaRequest,
  SimulationWarning,
  SolAsset,
  SplAsset,
} from '@exodus/web3-types'
import type { TransactionScanAPICallParams } from '@exodus/web3-utils'
import { createCurrency, makeSimulationAPICall } from '@exodus/web3-utils'

import {
  isLegacyTransaction,
  isVersionedTransaction,
  serializeTransaction,
} from '../transactions.js'
import type {
  LegacyOrVersionedTransaction,
  SolAggregatedTransactionSimulationResult,
  SolSimulateTransactionParams,
} from '../types.js'

const SOL_ADDRESS = '11111111111111111111111111111111'

const INTERNAL_ERROR_WARNING: SimulationWarning = {
  kind: 'INTERNAL_ERROR',
  severity: 'HIGH',
  message: 'Balance changes cannot be estimated.',
}

export const getTransactionFee = async ({
  asset,
  getFeeData,
  transactionsMessages,
  senderAddress,
}: {
  asset: Asset
  getFeeData: GetFeeData
  transactionsMessages: LegacyOrVersionedTransaction[]
  senderAddress: string
}): Promise<NumberUnit> => {
  const { fee: txFee } = await getFeeData({ assetName: asset.name })

  const senderPublicKey = new PublicKey(senderAddress)

  const feesPromises = transactionsMessages.map(
    async (transactionMessage: LegacyOrVersionedTransaction) => {
      if (
        isVersionedTransaction(transactionMessage) &&
        transactionMessage.message.staticAccountKeys[0].equals(senderPublicKey)
      ) {
        return txFee
      }

      if (
        isLegacyTransaction(transactionMessage) &&
        transactionMessage.feePayer?.equals(senderPublicKey)
      ) {
        try {
          const fee = await solanaApi.getFeeForMessage(
            transactionMessage.compileMessage(),
          )
          return asset.currency.baseUnit(fee)
        } catch (error: unknown) {
          console.error('Getting fee error', (error as Error).message)
          return txFee
        }
      }

      return asset.currency.ZERO
    },
  )

  const fees = await Promise.all(feesPromises)

  return fees.reduce((totalFee, currentFee) => {
    return currentFee.add(totalFee)
  }, asset.currency.ZERO)
}

// TODO: rewrite this logic to  deal with all transaction types properly.
const handleExpectedBalanceChange = (
  expectedBalanceChange: ScanTransactionsSolana200ResponseAggregatedExpectedStateChangesValueInner,
  simulationResult: SolAggregatedTransactionSimulationResult,
) => {
  const { willApprove, willSend, willReceive } = simulationResult.balanceChanges
  const { data, kind } = expectedBalanceChange.rawInfo

  if (
    kind === 'SOL_STAKE_AUTHORITY_CHANGE' ||
    kind === 'SOL_STAKE_ACCOUNT_DEPOSIT' ||
    kind === 'USER_ACCOUNT_OWNER_CHANGE' ||
    kind === 'BFP_LOADER_AUTHORITY_CHANGE'
  ) {
    return
  }

  const { asset } = data
  const isCompressedNftTransfer = kind === 'COMPRESSED_NFT_TRANSFER'
  const isSplNftTransfer =
    kind === 'SPL_TRANSFER' &&
    !!(asset as SplAsset).mint &&
    (asset as SplAsset).supply === 1
  const isNftTransfer = isSplNftTransfer || isCompressedNftTransfer

  let address = ''
  if (kind === 'SOL_TRANSFER') {
    address = SOL_ADDRESS
  } else if (kind === 'SPL_TRANSFER' || kind === 'SPL_APPROVAL') {
    address = (asset as SplAsset).mint
  }

  let denominator = 0
  if (['SOL_TRANSFER', 'SPL_TRANSFER', 'SPL_APPROVAL'].includes(kind)) {
    denominator = (asset as SplAsset | SolAsset).decimals
  }

  const asset_ = {
    address,
    imageUrl: asset.imageUrl,
    name: asset.name,
    symbol: asset.symbol,
  }
  const balance = createCurrency({
    amount: data.diff.digits,
    symbol: asset.symbol,
    denominator,
  })

  if (kind === 'SPL_APPROVAL') {
    willApprove.push({
      asset: asset_,
      spender: data.delegate,
      unitName: asset.symbol,
      balance,
    })
    return
  }

  if (balance.isZero) {
    return
  }

  const balanceChange: BalanceChange = {
    asset: asset_,
    balance,
  }

  if (isNftTransfer) {
    const compositeId = isCompressedNftTransfer
      ? (asset as CompressedNftAsset).id
      : (asset as SplAsset).mint
    balanceChange.nft = {
      id: `solana:${compositeId}`,
      compositeId,
      title: asset.name,
    }
  }

  // Use "sign" to determine if it's a send or receive
  if (data.diff.sign === 'PLUS') {
    willReceive.push(balanceChange)
  } else {
    willSend.push(balanceChange)
  }
}

const convertTransactionToApiPayload = ({
  transactions,
  origin,
  senderAddress,
}: {
  transactions: LegacyOrVersionedTransaction[]
  origin: string
  senderAddress: string
}): ScanTransactionsSolanaRequest => {
  const serializedTransactions = transactions.map((transaction) =>
    serializeTransaction(transaction),
  )

  return {
    transactions: serializedTransactions,
    metadata: {
      origin,
    },
    userAccount: senderAddress,
  }
}

type SimulateTransactionParams = Required<
  Pick<CreateSimulateTransactionsParams, 'apiEndpoint'>
> &
  Required<
    Pick<
      SolSimulateTransactionParams,
      'asset' | 'transactions' | 'origin' | 'senderAddress'
    >
  > & {
    simulationResult: SolAggregatedTransactionSimulationResult
    headers?: Record<string, string>
  }

const getExpectedBalanceChanges = (
  expectedStateChanges: Record<
    string,
    | ScanTransactionsSolana200ResponseAggregatedExpectedStateChangesValueInner[]
    | undefined
  >,
  senderAddress: string,
): ScanTransactionsSolana200ResponseAggregatedExpectedStateChangesValueInner[] => {
  return Object.keys(expectedStateChanges).reduce(
    (
      prev: ScanTransactionsSolana200ResponseAggregatedExpectedStateChangesValueInner[],
      address: string,
    ) => {
      if (senderAddress !== address) {
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
}

const mapResponseTxErrorsToWarnings = (
  response: ScanTransactionsSolana200Response,
) => {
  const warnings: SimulationWarning[] = []

  for (const tx of response.perTransaction) {
    const errTxt = tx.error?.humanReadableError

    const isInsufficientFundsError =
      // Solana (native asset) case.
      errTxt === 'account does not have enough SOL to perform the operation' ||
      // SPL tokens case: error might be custom, so match condition is relaxed.
      errTxt?.includes('Insufficient funds')

    if (isInsufficientFundsError) {
      warnings.push({
        kind: 'INSUFFICIENT_FUNDS',
        severity: 'WARNING',
        message: 'Insufficient funds to perform the operation.',
      })
    }
  }

  return warnings
}

const handleSimulationError = ({
  error,
  simulationResult,
}: {
  error: BlowfishSimulationError | null
  simulationResult: SolAggregatedTransactionSimulationResult
}) => {
  if (error) {
    simulationResult.warnings.push(INTERNAL_ERROR_WARNING)
    simulationResult.metadata.humanReadableError = error.humanReadableError
  } else if (
    // return human readable error for insufficient funds
    simulationResult.warnings.some(({ kind }) => kind === 'INSUFFICIENT_FUNDS')
  ) {
    simulationResult.metadata.humanReadableError =
      'Insufficient funds to perform the operation.'
  }
}

// This maps our asset names to the chains expected by the simulation API.
const SOLANA_CHAINS: Record<string, string> = {
  solana: 'mainnet',
  solanadevnet: 'devnet',
}

export const simulateTransactions = async ({
  asset,
  transactions,
  apiEndpoint,
  origin,
  simulationResult,
  headers,
  senderAddress,
}: SimulateTransactionParams) => {
  const payload = convertTransactionToApiPayload({
    transactions,
    origin,
    senderAddress,
  })
  const chain = SOLANA_CHAINS[asset.baseAsset.name]

  // Simulation is not supported for this asset.
  if (!chain) {
    simulationResult.warnings.push(INTERNAL_ERROR_WARNING)
    simulationResult.metadata.humanReadableError = `Simulation is not supported for this asset.`
    return
  }

  const response = await makeSimulationAPICall<
    TransactionScanAPICallParams,
    ScanTransactionsSolana200Response
  >({
    url: apiEndpoint,
    network: 'solana',
    chain,
    payload,
    headers,
  })

  if (!response) {
    simulationResult.warnings.push(INTERNAL_ERROR_WARNING)
    simulationResult.metadata.humanReadableError = 'Simulation API call failed.'
    return
  }

  simulationResult.warnings = mapResponseTxErrorsToWarnings(response)

  simulationResult.metadata.simulatedLocally = false

  const {
    expectedStateChanges,
    action,
    warnings = [],
    error,
  } = response.aggregated

  handleSimulationError({ error, simulationResult })

  if (
    action === 'BLOCK' ||
    warnings.some(({ severity }) => severity === 'CRITICAL')
  ) {
    let warning: SimulationWarning = {
      kind: 'MALICIOUS_ACTION',
      severity: 'CRITICAL',
      // We use a generic default message unless we find a known warning type below.
      message:
        'This dApp could be malicious. Do not proceed unless you are certain this is safe.',
    }

    if (warnings.some(({ kind }) => kind === 'USER_ACCOUNT_OWNER_CHANGE')) {
      warning = {
        kind: 'USER_ACCOUNT_OWNER_CHANGE',
        severity: 'CRITICAL',
        message:
          'This transaction is trying to change the owner of your account. This allows the new owner to transfer your tokens without your permission.',
      }
    }

    simulationResult.warnings.push(warning)
  }

  const userExpectedChanges = getExpectedBalanceChanges(
    expectedStateChanges,
    senderAddress,
  )

  const noExpectedStateChangesDetected = userExpectedChanges.length === 0

  // This is a self-send transaction, adding a zero "transfer" so that the UI can display it.
  if (noExpectedStateChangesDetected) {
    simulationResult.balanceChanges.willSend.push({
      balance: createCurrency({
        amount: 0,
        symbol: asset.displayTicker,
        denominator: asset.currency.defaultUnit.power,
      }),
    })

    return
  }

  userExpectedChanges.forEach((expectedChange) => {
    handleExpectedBalanceChange(expectedChange, simulationResult)
  })
}
