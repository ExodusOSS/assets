import type RPC from '@exodus/json-rpc'
import type { VersionedTransaction } from '@exodus/solana-web3.js'
import { Keypair } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import {
  InvalidInputError,
  UserRejectedRequestError,
} from '@exodus/web3-errors'
import { connect } from '@exodus/web3-rpc-handlers'
import type {
  LegacyOrVersionedTransaction,
  SolDisplayEncoding,
} from '@exodus/web3-solana-utils'
import {
  decodeMessage,
  deserializeEncodedMessage,
  deserializeTransaction,
  getTransactionId,
  isLegacyTransaction,
  isTransactionMessage,
  isTransactionVersionSupported,
  serializeMessageSignature,
  serializePublicKey,
  serializeTransaction,
  sign,
} from '@exodus/web3-solana-utils'
import type {
  AppDeps,
  Base58,
  Base64,
  Bytes,
  WalletDeps,
} from '@exodus/web3-types'

import type { SolanaMobileConnection, SolanaMobileDeps } from '../types.js'

const NETWORK = 'solana'
interface SignOptions {
  /** The public key that a dApp has been authorized to sign with */
  authorizedPublicKey: Base58
}

export function exposeSolanaMobileHandlers(
  rpc: typeof RPC,
  deps: AppDeps & SolanaMobileDeps & WalletDeps,
) {
  const {
    isAutoApproved,
    setActiveConnection = () => {
      throw new Error('unimplemented')
    },
    approveConnection,
    approveMessage,
    approveTransactions,
    getAsset,
    setPublicKey,
    getPublicKey,
    getSecretKey,
    showError = async () => {},
    sendRawTransaction,
    onTransactionsSigned = () => {},
    reportMaliciousSite = () => {},
    ensureUnlocked = async () => true,
    isTrusted = async () => false,
    ensureTrusted = async () => {},
    getOrigin,
    scanDomains,
    simulateSolanaTransactions,
  } = deps

  async function assertTransactionSupported(transaction: VersionedTransaction) {
    const isSupported = isTransactionVersionSupported(transaction)
    if (!isSupported) {
      throw new InvalidInputError()
    }
  }

  async function approve<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ApprovalFn extends (...args: any[]) => Promise<boolean>,
  >(
    approvalFn: ApprovalFn,
    transactions: LegacyOrVersionedTransaction[],
  ): Promise<void> {
    const autoApproved = await isAutoApproved()
    if (autoApproved) {
      return
    }

    const simulationResults = await simulateSolanaTransactions({
      transactions,
      asset: await getAsset(NETWORK),
      senderAddress: await getWalletAddress(),
      origin: getOrigin(),
    })

    const approved = await approvalFn(NETWORK, simulationResults)
    if (!approved) {
      throw new UserRejectedRequestError()
    }
  }

  async function getWalletAddress(): Promise<string> {
    const publicKey = await getPublicKey()

    return serializePublicKey(publicKey)
  }

  async function signTransactions(
    transactions: LegacyOrVersionedTransaction[],
    secretKey: Bytes,
  ) {
    const signer = Keypair.fromSecretKey(secretKey, { skipValidation: true })

    transactions.forEach((transaction) => {
      if (isLegacyTransaction(transaction)) {
        transaction.partialSign(signer)
      } else {
        assertTransactionSupported(transaction)
        transaction.sign([signer])
      }
    })
  }

  rpc.exposeFunction(
    'sms_connect',
    async (onlyIfTrusted: boolean, connection: SolanaMobileConnection) => {
      await setActiveConnection(connection)

      await connect(
        {
          approveConnection,
          ensureTrusted,
          isTrusted,
          ensureUnlocked,
          getOrigin,
          scanDomains,
        },
        NETWORK,
        onlyIfTrusted,
      )

      const publicKey = await getPublicKey()
      return serializePublicKey(publicKey)
    },
  )

  // TODO: refactor browser sol_signTransaction & sol_signAllTransactions -> sol_signTransactions
  // Why does this distinction even exist?
  rpc.exposeFunction(
    'sms_signTransactions',
    async (wireTransactions: Base64[], signOptions: SignOptions) => {
      let transactions
      try {
        transactions = wireTransactions.map(deserializeTransaction)
      } catch (error) {
        await showError(NETWORK, error)
        throw error
      }

      await setPublicKey(signOptions.authorizedPublicKey)

      await approve(approveTransactions, transactions)

      const secretKey = await getSecretKey(signOptions.authorizedPublicKey)
      await signTransactions(transactions, secretKey)

      // TODO: signatures are also the transaction ids
      // we need better names for this.
      const transactionIds = transactions.map(getTransactionId)
      onTransactionsSigned(NETWORK, transactionIds)

      return transactions.map(serializeTransaction)
    },
  )

  rpc.exposeFunction(
    'sms_signAndSendTransactions',
    async (
      wireTransactions: Base64[],
      signOptions: SignOptions,
      sendOptions: SendOptions,
    ) => {
      let transactions
      try {
        transactions = wireTransactions.map(deserializeTransaction)
      } catch (error) {
        await showError(NETWORK, error)
        throw error
      }

      await setPublicKey(signOptions.authorizedPublicKey)

      await approve(approveTransactions, transactions)

      const secretKey = await getSecretKey(signOptions.authorizedPublicKey)
      await signTransactions(transactions, secretKey)

      // TODO: `transaction.partialSign()` may not guarantee `transaction.signature`. Double-check.
      const signatures = transactions.map(getTransactionId)

      // TODO: signatures are also the transaction ids
      // we need better names for this.
      const transactionIds = signatures
      onTransactionsSigned(NETWORK, transactionIds)

      await Promise.all(
        transactions.map(async (transaction) => {
          const rawTransaction = isLegacyTransaction(transaction)
            ? transaction.serialize()
            : Buffer.from(transaction.serialize())
          await sendRawTransaction(rawTransaction, sendOptions)
        }),
      )

      return signatures
    },
  )

  // TODO: Refactor solana browser functions to allow signing for multiple
  // messages at once like this code. sol_signMessage -> sol_signMessages
  rpc.exposeFunction(
    'sms_signMessages',
    async (wireEncodedMessages: Base64[], signOptions: SignOptions) => {
      // TODO: refactor display: SolDisplayEncoding
      const display: SolDisplayEncoding = 'utf8'

      // TODO: refactor approveMessage to take multiple messages
      // or call it in a loop.
      if (wireEncodedMessages.length !== 1) {
        throw new InvalidInputError()
      }

      const wireEncodedMessage = wireEncodedMessages[0]

      const encodedMessage = deserializeEncodedMessage(wireEncodedMessage)

      if (isTransactionMessage(encodedMessage)) {
        reportMaliciousSite() // Fire and forget.
        throw new InvalidInputError()
      }

      await setPublicKey(signOptions.authorizedPublicKey)

      const message = decodeMessage(encodedMessage, display)
      const approved = await approveMessage(NETWORK, message)
      if (!approved) {
        throw new UserRejectedRequestError()
      }

      const secretKey = await getSecretKey(signOptions.authorizedPublicKey)
      const signature = await sign(encodedMessage, secretKey)
      return [serializeMessageSignature(signature)]
    },
  )
}
