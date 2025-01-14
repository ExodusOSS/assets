import {
  InvalidInputError,
  UnauthorizedError,
  UserRejectedRequestError,
} from '@exodus/web3-errors'
import { connect } from '@exodus/web3-rpc-handlers'
import {
  decodeMessage,
  deserializeEncodedMessage,
  deserializeTransaction,
  deserializeTransactionBytes,
  getTransactionId,
  isLegacyTransaction,
  isTransactionMessage,
  serializeMessageSignature,
  serializePublicKey,
  serializeTransaction,
} from '@exodus/web3-solana-utils'

import type { SolanaDeps } from '../types.js'
import type RPC from '@exodus/json-rpc'
import type { PublicKey } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import type {
  LegacyOrVersionedTransaction,
  SolDisplayEncoding as DisplayEncoding,
} from '@exodus/web3-solana-utils'
import type { AppDeps, Base64, ISignedTransaction, WalletDeps } from '@exodus/web3-types'

const NETWORK = 'solana'

export function exposeHandlers(
  rpc: typeof RPC,
  deps: AppDeps & SolanaDeps & WalletDeps,
) {
  const {
    isTrusted,
    ensureTrusted,
    isAutoApproved,
    approveConnection,
    approveMessage,
    approveTransactions,
    getPublicKey,
    getLatestBlockhash,
    getIsConnected,
    sendRawTransaction,
    onTransactionsSigned = () => {},
    ensureUnlocked = async () => true,
    reportMaliciousSite = () => {},
    getOrigin,
    getPathname,
    scanDomains,
    simulateSolanaTransactions,
    getAsset,
    transactionSigner,
    getActiveWalletAccountData,
    messageSigner,
  } = deps

  async function assertTrusted() {
    const trusted = await isTrusted()
    if (!trusted) {
      throw new UnauthorizedError()
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

    const origin = getOrigin()
    const pathname = getPathname ? getPathname() : ''

    const simulationResults = await simulateSolanaTransactions({
      transactions,
      asset: await getAsset(NETWORK),
      senderAddress: await getWalletAddress(),
      origin: origin + pathname,
    })

    const approved = await approvalFn(NETWORK, simulationResults)
    if (!approved) {
      throw new UserRejectedRequestError()
    }
  }

  async function getWalletAddress(): Promise<string> {
    const publicKey = await getPublicKey()

    return serializePublicKey(publicKey as PublicKey)
  }

  async function signTransactions(
    transactions: LegacyOrVersionedTransaction[],
  ) {
    const walletAccount = await getActiveWalletAccountData()

    const signedTransactions: ISignedTransaction[] = []
    for (const transaction of transactions) {
      // Transactions must be signed, one-by-one sync.
      const signedTransaction = await transactionSigner.signTransaction({
        baseAssetName: 'solana',
        walletAccount,
        unsignedTx: {
          txData: {
            transaction,
            transactionBuffer: Buffer.from(
              transaction.serialize({ verifySignatures: false }),
            ),
          },
          txMeta: Object.create(null),
        },
      })
      signedTransactions.push(signedTransaction)
    }

    return signedTransactions.map(({ rawTx }) =>
      deserializeTransactionBytes(Buffer.from(rawTx, 'base64')),
    )
  }

  rpc.exposeFunction('sol_isConnected', async () => {
    if (!getIsConnected) {
      return null
    }

    return getIsConnected()
  })

  rpc.exposeFunction('sol_connect', async (onlyIfTrusted: boolean) => {
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
      NETWORK,
      onlyIfTrusted,
    )

    return getWalletAddress()
  })

  rpc.exposeFunction('sol_signTransaction', async (wireTransaction: Base64) => {
    await assertTrusted()

    const transaction = deserializeTransaction(wireTransaction)

    await approve(approveTransactions, [transaction])

    const [signedTransaction] = await signTransactions([transaction])

    try {
      // TODO: `transaction.partialSign()` may not guarantee `transaction.signature`. Double-check.
      const transactionId = getTransactionId(signedTransaction)
      onTransactionsSigned(NETWORK, [transactionId])
    } catch (err) {
      // Ignore error.
    }

    return serializeTransaction(signedTransaction)
  })

  rpc.exposeFunction(
    'sol_signAllTransactions',
    async (wireTransactions: Base64[]) => {
      await assertTrusted()

      const transactions = wireTransactions.map(deserializeTransaction)

      await approve(approveTransactions, transactions)

      const signedTransactions = await signTransactions(transactions)

      try {
        // TODO: `transaction.partialSign()` may not guarantee `transaction.signature`. Double-check.
        const transactionIds = signedTransactions.map(getTransactionId)
        onTransactionsSigned(NETWORK, transactionIds)
      } catch (err) {
        // Ignore error.
      }

      return signedTransactions.map(serializeTransaction)
    },
  )

  rpc.exposeFunction(
    'sol_signAndSendTransaction',
    async (wireTransaction: Base64, options: SendOptions = {}) => {
      await assertTrusted()

      const transaction = deserializeTransaction(wireTransaction)

      await approve(approveTransactions, [transaction])

      const [signedTransaction] = await signTransactions([transaction])

      const transactionId = getTransactionId(signedTransaction)
      onTransactionsSigned(NETWORK, [transactionId])

      const rawTransaction = isLegacyTransaction(signedTransaction)
        ? signedTransaction.serialize()
        : Buffer.from(signedTransaction.serialize())
      await sendRawTransaction(rawTransaction, options)

      const signature = transactionId
      return signature
    },
  )

  rpc.exposeFunction(
    'sol_signMessage',
    async (wireEncodedMessage: Base64, display: DisplayEncoding) => {
      await assertTrusted()

      const encodedMessage = deserializeEncodedMessage(wireEncodedMessage)

      if (isTransactionMessage(encodedMessage)) {
        reportMaliciousSite() // Fire and forget.
        throw new InvalidInputError()
      }

      const message = decodeMessage(encodedMessage, display)
      const approved = await approveMessage(NETWORK, message)
      if (!approved) {
        throw new UserRejectedRequestError()
      }

      const walletAccount = await getActiveWalletAccountData()

      const signature = await messageSigner.signMessage({
        baseAssetName: 'solana',
        walletAccount,
        message: { rawMessage: Buffer.from(encodedMessage) },
      })
      return serializeMessageSignature(signature)
    },
  )

  rpc.exposeFunction('sol_getLatestBlockhash', getLatestBlockhash)
}
