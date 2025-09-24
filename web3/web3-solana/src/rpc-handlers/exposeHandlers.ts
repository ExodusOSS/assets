import type RPC from '@exodus/json-rpc'
import type { PublicKey } from '@exodus/solana-web3.js'
import type { SendOptions } from '@exodus/solana-web3.js/lib/connection.js'
import {
  InvalidInputError,
  UnauthorizedError,
  UserRejectedRequestError,
} from '@exodus/web3-errors'
import { connect } from '@exodus/web3-rpc-handlers'
import type { LegacyOrVersionedTransaction } from '@exodus/web3-solana-utils'
import {
  createSignInMessageText,
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
import type {
  AppDeps,
  Base64,
  ISignedTransaction,
  WalletDeps,
} from '@exodus/web3-types'
import bs58 from 'bs58'
import makeConcurrent from 'make-concurrent'
import assert from 'minimalistic-assert'

import { getSignerPublicKey } from '../provider/utils/transactions.js'
import type { SolanaDeps } from '../types.js'
import { ExodusSolanaWalletAccount } from '../wallet-standard/account.js'
import {
  RpcConnectParams,
  RpcConnectResult,
  RpcSignAndSendAllParams,
  RpcSignAndSendAllResult,
  RpcSignInParams,
  RpcSignInResult,
  RpcSignMessageParams,
} from './types.js'

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
    getConnectedAccounts,
    getPathname,
    scanDomains,
    simulateSolanaTransactions,
    getAsset,
    isUnlocked,
    transactionSigner,
    getActiveWalletAccountData,
    getWalletAccountsData,
    messageSigner,
    addConnection,
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
    const walletAccountAddresses = await getWalletAddresses()
    const addresses = walletAccountAddresses.map(({ address }) => address)
    const publicKey = getSignerPublicKey(transactions[0], addresses)

    const simulationResults = await simulateSolanaTransactions({
      transactions,
      asset: await getAsset(NETWORK),
      senderAddress: publicKey?.toBase58() ?? (await getWalletAddress()),
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
    const walletAccounts = await getWalletAccountsData()
    const walletAccountAddresses = await getWalletAddresses()
    const addresses = walletAccountAddresses.map(({ address }) => address)

    const signParams = transactions.map((transaction) => {
      const address = getSignerPublicKey(transaction, addresses)?.toBase58()
      const accountName = address
        ? walletAccountAddresses.find(({ address: a }) => a === address)?.name
        : walletAccountAddresses[0].name

      const walletAccount = walletAccounts[accountName!]
      assert(walletAccount, `Wallet account for address ${address} not found`)

      return {
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
      }
    })

    const signedTransactions: ISignedTransaction[] =
      'signTransactions' in transactionSigner &&
      typeof transactionSigner.signTransactions === 'function'
        ? await transactionSigner.signTransactions(signParams)
        : await Promise.all(
            signParams.map(async (params) =>
              transactionSigner.signTransaction(params),
            ),
          )

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

  rpc.exposeFunction(
    'sol_connect',
    async ({
      onlyIfTrusted,
      silent = false,
    }: RpcConnectParams): Promise<RpcConnectResult> => {
      if (onlyIfTrusted && silent) {
        // Auto-connection attempts are triggered on every page load.
        // Fail early here to avoid triggering redundant domain scanning in the logic below.
        await assertTrusted()
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
        NETWORK,
        onlyIfTrusted,
        silent,
      )

      if (onlyIfTrusted) {
        const connectedAccounts = await getConnectedAccounts()

        if (connectedAccounts.length > 0) {
          return connectedAccounts.map(({ name, addresses }) => ({
            name,
            address: addresses.solana,
          }))
        }

        const unlocked = await isUnlocked!()
        assert(!silent || unlocked, 'Cannot connect silently when locked')

        if (!unlocked) {
          await ensureUnlocked()
        }
      }

      return getWalletAddresses()
    },
  )

  const getWalletAccountDataByAddress = async (address: string) => {
    const data = await getWalletAccountsData()
    const walletAccountNames = Object.keys(data)
    const dataByAddress = Object.fromEntries(
      await Promise.all(
        walletAccountNames.map(async (name) => {
          const publicKey = await getPublicKey(name)
          return [publicKey.toBase58(), data[name]]
        }),
      ),
    )

    return dataByAddress[address]
  }

  const getWalletAddresses = async () => {
    const data = await getWalletAccountsData()
    const activeWalletAccount = await getActiveWalletAccountData()
    const activeWalletAccountName = activeWalletAccount.toString()
    const walletAccountNames = Object.keys(data).filter(
      (name) => name !== activeWalletAccountName,
    )

    const addresses = await Promise.all(
      walletAccountNames.map(async (name) => {
        const publicKey = await getPublicKey(name)
        return { name, address: publicKey.toBase58() }
      }),
    )

    addresses.unshift({
      name: activeWalletAccountName,
      address: await getWalletAddress(),
    })

    return addresses
  }

  const getWalletAccountData = async (address?: string) => {
    if (address) {
      const walletAccount = await getWalletAccountDataByAddress(address)
      assert(
        walletAccount,
        `Wallet account for address ${address} does not exist`,
      )

      return {
        address,
        walletAccount,
      }
    }

    const activeAddress = await getWalletAddress()
    const walletAccount = await getActiveWalletAccountData()
    return { address: activeAddress, walletAccount }
  }

  rpc.exposeFunction(
    'sol_signIn',
    async (input: RpcSignInParams): Promise<RpcSignInResult> => {
      await ensureUnlocked()
      const addresses = await getWalletAddresses()
      const loginAddress = input.address ?? addresses[0].address
      const { walletAccount } = await getWalletAccountData(loginAddress)

      const message = createSignInMessageText({
        ...input,
        domain: input.domain ?? deps.getOrigin(),
        address: loginAddress,
      })

      const approved = await approveMessage(NETWORK, message)
      if (!approved) {
        throw new UserRejectedRequestError()
      }

      const rawMessage = Buffer.from(message, 'utf8')
      const signature = await messageSigner.signMessage({
        baseAssetName: NETWORK,
        walletAccount,
        message: { rawMessage },
      })

      const sorted = input.address
        ? addresses.sort((a) => (a.address === input.address ? -1 : 0))
        : addresses

      await addConnection([NETWORK])

      return {
        accounts: sorted.map(
          ({ address }) =>
            new ExodusSolanaWalletAccount({
              address,
              publicKey: bs58.decode(address),
            }),
        ),
        signature: signature.toString('base64'),
        signedMessage: rawMessage.toString('base64'),
      }
    },
  )

  rpc.exposeFunction('sol_signTransaction', async (wireTransaction: Base64) => {
    await assertTrusted()

    const transaction = deserializeTransaction(wireTransaction)

    await approve(approveTransactions, [transaction])

    const [signedTransaction] = await signTransactions([transaction])

    try {
      // TODO: `transaction.partialSign()` may not guarantee `transaction.signature`. Double-check.
      const transactionId = getTransactionId(signedTransaction)
      onTransactionsSigned(NETWORK, [transactionId])
    } catch {
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
      } catch {
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

      return transactionId
    },
  )

  rpc.exposeFunction(
    'sol_signAndSendAllTransactions',
    async (
      inputs: RpcSignAndSendAllParams[0],
      options: RpcSignAndSendAllParams[1],
    ): Promise<RpcSignAndSendAllResult> => {
      assert(
        Array.isArray(inputs) && inputs.length > 0,
        'Expected at least one transaction',
      )

      await assertTrusted()

      const deserializedInputs = inputs.map(({ transaction, ...rest }) => ({
        ...rest,
        transaction: deserializeTransaction(transaction),
      }))

      const transactions = deserializedInputs.map(
        ({ transaction }) => transaction,
      )
      await approve(approveTransactions, transactions)

      const signedTransactions = await signTransactions(transactions)
      const signatures = signedTransactions.map((tx) => getTransactionId(tx))
      onTransactionsSigned(NETWORK, signatures)

      const send: typeof sendRawTransaction = options?.parallel
        ? sendRawTransaction
        : makeConcurrent(sendRawTransaction, { concurrency: 1 })

      return Promise.allSettled(
        signedTransactions.map(async (signedTransaction, index) => {
          const rawTransaction = isLegacyTransaction(signedTransaction)
            ? signedTransaction.serialize()
            : Buffer.from(signedTransaction.serialize())

          await send(rawTransaction, deserializedInputs[index].options)

          return signatures[index]
        }),
      )
    },
  )

  rpc.exposeFunction(
    'sol_signMessage',
    async (...params: RpcSignMessageParams) => {
      await assertTrusted()
      const [wireEncodedMessage, { display, address }] = params

      const encodedMessage = deserializeEncodedMessage(wireEncodedMessage)

      if (isTransactionMessage(encodedMessage)) {
        reportMaliciousSite() // Fire and forget.
        throw new InvalidInputError()
      }

      const { walletAccount } = await getWalletAccountData(address)
      const message = decodeMessage(encodedMessage, display)
      const approved = await approveMessage(
        NETWORK,
        message,
        walletAccount.toString(),
      )
      if (!approved) {
        throw new UserRejectedRequestError()
      }

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
