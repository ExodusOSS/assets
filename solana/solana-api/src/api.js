import createApiCJS from '@exodus/asset-json-rpc'
import { memoize } from '@exodus/basic-utils'
import { retry } from '@exodus/simple-retry'
import {
  buildRawTransaction,
  computeBalance,
  deserializeMetaplexMetadata,
  filterAccountsByOwner,
  getMetadataAccount,
  getTransactionSimulationParams,
  SOL_DECIMAL,
  STAKE_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@exodus/solana-lib'
import BN from 'bn.js'
import lodash from 'lodash'
import ms from 'ms'
import urljoin from 'url-join'
import wretch from 'wretch'

import { Connection } from './connection.js'
import { getStakeActivation } from './get-stake-activation/index.js'
import { isSplTransferInstruction } from './txs-utils.js'

const createApi = createApiCJS.default || createApiCJS

// Doc: https://docs.solana.com/apps/jsonrpc-api

const RPC_URL = 'https://solana.a.exodus.io' // https://vip-api.mainnet-beta.solana.com/, https://api.mainnet-beta.solana.com
const WS_ENDPOINT = 'wss://solana.a.exodus.io/ws' // not standard across all node providers (we're compatible only with Quicknode)
const FORCE_HTTP = true // use https over ws

// Tokens + SOL api support
export class Api {
  constructor({ rpcUrl, wsUrl, assets, txsLimit, tokenAssetType = 'SOLANA_TOKEN' }) {
    this.tokenAssetType = tokenAssetType
    this.setServer(rpcUrl)
    this.setWsEndpoint(wsUrl)
    this.setTokens(assets)
    this.tokensToSkip = {}
    this.txsLimit = txsLimit
    this.connections = {}
    this.getSupply = memoize(async (mintAddress) => {
      // cached getSupply
      const result = await this.rpcCall('getTokenSupply', [mintAddress])
      return result?.value?.amount
    })

    this.getMinimumBalanceForRentExemption = memoize(
      (accountSize) => this.rpcCall('getMinimumBalanceForRentExemption', [accountSize]),
      (accountSize) => accountSize,
      ms('15m')
    )
  }

  setServer(rpcUrl) {
    this.rpcUrl = rpcUrl || RPC_URL
    this.api = createApi(this.rpcUrl)
  }

  setWsEndpoint(wsUrl) {
    this.wsUrl = wsUrl || WS_ENDPOINT
  }

  setTokens(assets = {}) {
    const solTokens = lodash.pickBy(assets, (asset) => asset.assetType === this.tokenAssetType)
    this.tokens = new Map(Object.values(solTokens).map((v) => [v.mintAddress, v]))
  }

  request(path, contentType = 'application/json') {
    return wretch(urljoin(this.rpcUrl, path)).headers({
      'Content-Type': contentType,
    })
  }

  async watchAddress({
    address,
    tokensAddresses = [],
    onMessage,
    handleAccounts,
    handleTransfers,
    handleReconnect,
    reconnectDelay,
  }) {
    if (this.connections[address]) return // already subscribed
    const conn = new Connection({
      endpoint: this.wsUrl,
      address,
      tokensAddresses,
      onMsg: (json) => onMessage(json),
      callback: (updates) =>
        this.handleUpdates({ updates, address, handleAccounts, handleTransfers }),
      reconnectCallback: handleReconnect,
      reconnectDelay,
    })

    this.connections[address] = conn
    return conn.start()
  }

  async unwatchAddress({ address }) {
    if (this.connections[address]) {
      await this.connections[address].stop()
      delete this.connections[address]
    }
  }

  async handleUpdates({ updates, address, handleAccounts, handleTransfers }) {
    // console.log(`got ws updates from ${address}:`, updates)
    if (handleTransfers) return handleTransfers(updates)
  }

  async rpcCall(method, params = [], { address = '', forceHttp = FORCE_HTTP } = {}) {
    // ws request
    const connection = this.connections[address] || lodash.sample(Object.values(this.connections)) // pick random connection
    if (lodash.get(connection, 'isOpen') && !lodash.get(connection, 'shutdown') && !forceHttp) {
      return connection.sendMessage(method, params)
    }

    // http fallback
    return this.api.post({ method, params })
  }

  getTokenByAddress(mint) {
    return this.tokens.get(mint)
  }

  isTokenSupported(mint) {
    return this.tokens.has(mint)
  }

  async getEpochInfo() {
    const { epoch } = await this.rpcCall('getEpochInfo')
    return Number(epoch)
  }

  async getStakeActivation(stakeAddress) {
    const { status } = await getStakeActivation(this, stakeAddress)
    return status
  }

  async getRecentBlockHash(commitment) {
    const result = await this.rpcCall(
      'getLatestBlockhash',
      [{ commitment: commitment || 'confirmed', encoding: 'jsonParsed' }],
      { forceHttp: true }
    )
    return lodash.get(result, 'value.blockhash')
  }

  // Transaction structure: https://docs.solana.com/apps/jsonrpc-api#transaction-structure
  async getTransactionById(id) {
    return this.rpcCall('getTransaction', [
      id,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ])
  }

  async getPriorityFee(transaction) {
    // https://docs.helius.dev/solana-rpc-nodes/alpha-priority-fee-api
    const result = await this.rpcCall('getPriorityFeeEstimate', [
      { transaction, options: { recommended: true } },
    ])
    return result.priorityFeeEstimate
  }

  async getBalance(address) {
    const result = await this.rpcCall('getBalance', [address, { encoding: 'jsonParsed' }], {
      address,
    })
    return lodash.get(result, 'value', 0)
  }

  async getBlockTime(slot) {
    // might result in error if executed on a validator with partial ledger (https://github.com/solana-labs/solana/issues/12413)
    return this.rpcCall('getBlockTime', [slot])
  }

  async waitForTransactionStatus(txIds, status = 'finalized', timeoutMs = ms('1m')) {
    if (!Array.isArray(txIds)) txIds = [txIds]
    const startTime = Date.now()

    while (true) {
      const response = await this.rpcCall('getSignatureStatuses', [
        txIds,
        { searchTransactionHistory: true },
      ])
      const data = response.value
      const allTxsAreConfirmed = data.every((elem) => elem?.confirmationStatus === status)
      if (allTxsAreConfirmed) {
        return true
      }

      // Check if the timeout has elapsed
      if (Date.now() - startTime >= timeoutMs) {
        // timeout
        throw new Error('waitForTransactionStatus timeout')
      }

      // Wait for the specified interval before the next request
      await new Promise((resolve) => setTimeout(resolve, ms('10s')))
    }
  }

  async getSignaturesForAddress(address, { until, before, limit } = {}) {
    until = until || undefined
    return this.rpcCall('getSignaturesForAddress', [address, { until, before, limit }], { address })
  }

  /**
   * Get transactions from an address
   */
  async getTransactions(
    address,
    { cursor, before, limit, includeUnparsed = false, tokenAccounts } = Object.create(null)
  ) {
    limit = limit || this.txsLimit
    let transactions = []
    // cursor is a txHash

    try {
      const until = cursor

      const tokenAccountsByOwner = tokenAccounts || (await this.getTokenAccountsByOwner(address)) // Array
      const tokenAccountAddresses = tokenAccountsByOwner
        .filter(({ tokenName }) => tokenName !== 'unknown')
        .map(({ tokenAccountAddress }) => tokenAccountAddress)
      const accountsToCheck = [address, ...tokenAccountAddresses]

      const txsResultsByAccount = await Promise.all(
        accountsToCheck.map((addr) =>
          this.getSignaturesForAddress(addr, {
            until,
            before,
            limit,
          })
        )
      )
      let txsId = txsResultsByAccount.flat() // merge arrays
      txsId = lodash.uniqBy(txsId, 'signature')

      // get txs details in parallel
      const txsDetails = await Promise.all(txsId.map((tx) => this.getTransactionById(tx.signature)))
      txsDetails.forEach((txDetail) => {
        if (!txDetail) return

        const timestamp = txDetail.blockTime * 1000
        const parsedTx = this.parseTransaction(address, txDetail, tokenAccountsByOwner, {
          includeUnparsed,
        })

        if (!parsedTx.from && parsedTx.tokenTxs?.length === 0 && !includeUnparsed) return // cannot parse it

        // split dexTx in separate txs
        if (parsedTx.dexTxs) {
          parsedTx.dexTxs.forEach((tx) => {
            transactions.push({
              timestamp,
              date: new Date(timestamp),
              ...tx,
            })
          })
          delete parsedTx.dexTxs
        }

        if (parsedTx.tokenTxs?.length > 0) {
          parsedTx.tokenTxs.forEach((tx) => {
            transactions.push({
              timestamp,
              date: new Date(timestamp),
              ...tx,
            })
          })
          delete parsedTx.tokenTxs
        }

        if (parsedTx.from) {
          transactions.push({
            timestamp,
            date: new Date(timestamp),
            ...parsedTx,
          })
        }
      })
    } catch (err) {
      console.warn('Solana error:', err)
      throw err
    }

    transactions = lodash.orderBy(transactions, ['timestamp'], ['desc'])

    const newCursor = transactions[0] ? transactions[0].id : cursor

    return { transactions, newCursor }
  }

  parseTransaction(
    ownerAddress,
    txDetails,
    tokenAccountsByOwner,
    { includeUnparsed = false } = {}
  ) {
    let { fee, preBalances, postBalances, preTokenBalances, postTokenBalances, innerInstructions } =
      txDetails.meta
    preBalances = preBalances || []
    postBalances = postBalances || []
    preTokenBalances = preTokenBalances || []
    postTokenBalances = postTokenBalances || []
    innerInstructions = innerInstructions || []

    let { instructions, accountKeys } = txDetails.transaction.message
    const txId = txDetails.transaction.signatures[0]

    const getUnparsedTx = () => {
      const ownerIndex = accountKeys.findIndex((accountKey) => accountKey.pubkey === ownerAddress)
      const feePaid = ownerIndex === 0 ? fee : 0

      return {
        unparsed: true,
        amount:
          ownerIndex === -1 ? 0 : postBalances[ownerIndex] - preBalances[ownerIndex] + feePaid,
        fee: feePaid,
        data: {
          meta: txDetails.meta,
        },
      }
    }

    const getInnerTxsFromBalanceChanges = () => {
      const ownPreTokenBalances = preTokenBalances.filter(
        (balance) => balance.owner === ownerAddress
      )
      const ownPostTokenBalances = postTokenBalances.filter(
        (balance) => balance.owner === ownerAddress
      )

      return ownPostTokenBalances
        .map((postBalance) => {
          const tokenAccount = tokenAccountsByOwner.find(
            (tokenAccount) => tokenAccount.mintAddress === postBalance.mint
          )

          const preBalance = ownPreTokenBalances.find(
            (balance) => balance.accountIndex === postBalance.accountIndex
          )

          const preAmount = new BN(lodash.get(preBalance, 'uiTokenAmount.amount', '0'), 10)
          const postAmount = new BN(lodash.get(postBalance, 'uiTokenAmount.amount', '0'), 10)

          const amount = postAmount.sub(preAmount)

          if (!tokenAccount || amount.isZero()) return null

          // This is not perfect as there could be multiple same-token transfers in single
          // transaction, but our wallet only supports one transaction with single txId
          // so we are picking first that matches (correct token + type - send or receive)
          const match = innerInstructions.find((inner) => {
            const targetOwner = amount.isNeg() ? ownerAddress : null
            return (
              inner.token.mintAddress === tokenAccount.mintAddress && targetOwner === inner.owner
            )
          })

          // It's possible we won't find a match, because our innerInstructions only contain
          // spl-token transfers, but balances of SPL tokens can change in different ways too.
          // for now, we are ignoring this to simplify as those cases are not that common, but
          // they should be handled eventually. It was already a scretch to add unparsed txs logic
          // to existing parser, expanding it further is not going to end well.
          // this probably should be refactored from ground to handle all those transactions
          // as a core part of it in the future
          if (!match) return null

          const { from, to, owner } = match

          return {
            id: txId,
            slot: txDetails.slot,
            owner,
            from,
            to,
            amount: amount.abs().toString(), // inconsistent with the rest, but it can and did overflow
            fee: 0,
            token: tokenAccount,
            data: {
              inner: true,
            },
          }
        })
        .filter((ix) => !!ix)
    }

    instructions = instructions
      .filter((ix) => ix.parsed) // only known instructions
      .map((ix) => ({
        program: ix.program, // system or spl-token
        type: ix.parsed.type, // transfer, createAccount, initializeAccount
        ...ix.parsed.info,
      }))

    let solanaTransferTx = lodash.find(instructions, (ix) => {
      if (![ix.source, ix.destination].includes(ownerAddress)) return false
      return ix.program === 'system' && ix.type === 'transfer'
    }) // get SOL transfer

    // check if there is a temp account created & closed within the instructions when there is no direct solana transfer
    const accountToRedeemToOwner = solanaTransferTx
      ? undefined
      : instructions.find(
          ({ type, owner, destination }) =>
            type === 'closeAccount' && owner === ownerAddress && destination === ownerAddress
        )?.account

    innerInstructions = innerInstructions
      .reduce((acc, val) => {
        return [...acc, ...val.instructions]
      }, [])
      .filter(
        (ix) => ix.parsed && isSplTransferInstruction({ program: ix.program, type: ix.parsed.type })
      )
      .map((ix) => {
        const source = lodash.get(ix, 'parsed.info.source')
        const destination = lodash.get(ix, 'parsed.info.destination')
        const amount = Number(
          lodash.get(ix, 'parsed.info.amount', 0) ||
            lodash.get(ix, 'parsed.info.tokenAmount.amount', 0)
        )
        const authority = lodash.get(ix, 'parsed.info.authority')

        if (accountToRedeemToOwner && destination === accountToRedeemToOwner) {
          solanaTransferTx = {
            from: authority || source,
            to: ownerAddress,
            amount,
            fee,
          }
          return
        }

        const tokenAccount = tokenAccountsByOwner.find(({ tokenAccountAddress }) => {
          return [source, destination].includes(tokenAccountAddress)
        })
        if (!tokenAccount) return

        const isSending = tokenAccountsByOwner.some(({ tokenAccountAddress }) => {
          return [source].includes(tokenAccountAddress)
        })

        // owner if it's a send tx
        return {
          id: txId,
          slot: txDetails.slot,
          owner: isSending ? ownerAddress : null,
          from: isSending ? ownerAddress : source,
          to: isSending ? destination : ownerAddress,
          amount,
          token: tokenAccount,
          fee: isSending ? fee : 0,
        }
      })
      .filter((ix) => !!ix)

    // program:type tells us if it's a SOL or Token transfer

    const stakeTx = lodash.find(instructions, { program: 'system', type: 'createAccountWithSeed' })
    const stakeWithdraw = lodash.find(instructions, { program: 'stake', type: 'withdraw' })
    const stakeUndelegate = lodash.find(instructions, { program: 'stake', type: 'deactivate' })

    let tx = {}
    if (stakeTx) {
      // start staking
      tx = {
        owner: stakeTx.base,
        from: stakeTx.base,
        to: stakeTx.base,
        amount: stakeTx.lamports,
        fee,
        staking: {
          method: 'createAccountWithSeed',
          seed: stakeTx.seed,
          stakeAddresses: [stakeTx.newAccount],
          stake: stakeTx.lamports,
        },
      }
    } else if (stakeWithdraw) {
      const stakeAccounts = lodash.map(
        lodash.filter(instructions, { program: 'stake', type: 'withdraw' }),
        'stakeAccount'
      )
      tx = {
        owner: stakeWithdraw.withdrawAuthority,
        from: stakeWithdraw.stakeAccount,
        to: stakeWithdraw.destination,
        amount: stakeWithdraw.lamports,
        fee,
        staking: {
          method: 'withdraw',
          stakeAddresses: stakeAccounts,
          stake: stakeWithdraw.lamports,
        },
      }
    } else if (stakeUndelegate) {
      const stakeAccounts = lodash.map(
        lodash.filter(instructions, { program: 'stake', type: 'deactivate' }),
        'stakeAccount'
      )
      tx = {
        owner: stakeUndelegate.stakeAuthority,
        from: stakeUndelegate.stakeAuthority,
        to: stakeUndelegate.stakeAccount, // obsolete
        amount: 0,
        fee,
        staking: {
          method: 'undelegate',
          stakeAddresses: stakeAccounts,
        },
      }
    } else {
      if (solanaTransferTx) {
        const isSending = ownerAddress === solanaTransferTx.source
        tx = {
          owner: solanaTransferTx.source,
          from: solanaTransferTx.source,
          to: solanaTransferTx.destination,
          amount: solanaTransferTx.lamports, // number
          fee: isSending ? fee : 0,
        }
      }

      // Parse Token txs
      const tokenTxs = this._parseTokenTransfers({
        instructions,
        tokenAccountsByOwner,
        ownerAddress,
        fee,
        preTokenBalances,
        postTokenBalances,
      })

      if (tokenTxs.length > 0) {
        // found spl-token simple transfer/transferChecked instruction
        tx.tokenTxs = tokenTxs.map((tx) => ({
          id: txId,
          slot: txDetails.slot,
          ...tx,
        }))
      } else if (preTokenBalances && postTokenBalances) {
        // probably a DEX program is involved (multiple instructions), compute balance changes

        const accountIndexes = accountKeys.reduce((acc, key, i) => {
          const hasKnownOwner = tokenAccountsByOwner.some(
            (tokenAccount) => tokenAccount.tokenAccountAddress === key.pubkey
          )

          acc[i] = {
            ...key,
            owner: hasKnownOwner ? ownerAddress : null,
          }

          return acc
        }, Object.create(null))

        // group by owner and supported token
        const preBalances = preTokenBalances.filter((t) => {
          return (
            accountIndexes[t.accountIndex].owner === ownerAddress && this.isTokenSupported(t.mint)
          )
        })
        const postBalances = postTokenBalances.filter((t) => {
          return (
            accountIndexes[t.accountIndex].owner === ownerAddress && this.isTokenSupported(t.mint)
          )
        })

        if (preBalances.length > 0 || postBalances.length > 0 || solanaTransferTx) {
          tx = {}

          if (includeUnparsed && innerInstructions.length > 0) {
            // when using includeUnparsed for DEX tx we want to keep SOL tx as "unparsed"
            // 1. we want to treat all SOL dex transactions as "Contract transaction", not "Sent SOL"
            // 2. default behavior is not perfect. For example it doesn't see SOL-side tx in
            //    SOL->SPL swaps on Raydium and Orca.
            tx = getUnparsedTx()
            tx.dexTxs = getInnerTxsFromBalanceChanges()
          } else {
            if (solanaTransferTx) {
              // the base tx will be the one that moved solana.
              tx =
                solanaTransferTx.from && solanaTransferTx.to
                  ? solanaTransferTx
                  : {
                      owner: solanaTransferTx.source,
                      from: solanaTransferTx.source,
                      to: solanaTransferTx.destination,
                      amount: solanaTransferTx.lamports, // number
                      fee: ownerAddress === solanaTransferTx.source ? fee : 0,
                    }
            }

            // If it has inner instructions then it's a DEX tx that moved SPL -> SPL
            if (innerInstructions.length > 0) {
              tx.dexTxs = innerInstructions
              // if tx involves only SPL swaps. Expand DEX ix (first element as tx base and the other kept there)
              if (!tx.from && !solanaTransferTx) {
                tx = tx.dexTxs[0]
                tx.dexTxs = innerInstructions.slice(1)
              }
            }
          }
        }
      }
    }

    const unparsed = Object.keys(tx).length === 0

    if (unparsed && includeUnparsed) {
      tx = getUnparsedTx()
    }

    // How tokens tx are parsed:
    // 0. compute incoming or outgoing tx: it's outgoing if spl-token:transfer has source/destination included in tokenAccountsByOwner
    // 1. if it's a sent tx: sum all instructions amount (spl-token:transfer)
    // 2. if it's an incoming tx: sum all the amounts with destination included in tokenAccountsByOwner (aggregating by ticker)
    // QUESTION: How do I know what are my tokens addresses deterministically? It's not possible, gotta use tokenAccountsByOwner

    return {
      id: txDetails.transaction.signatures[0],
      slot: txDetails.slot,
      error: !(txDetails.meta.err === null),
      ...tx,
    }
  }

  _parseTokenTransfers({
    instructions,
    tokenAccountsByOwner,
    ownerAddress,
    fee,
    preTokenBalances,
    postTokenBalances,
  }) {
    if (
      preTokenBalances.length === 0 &&
      postTokenBalances.length === 0 &&
      !Array.isArray(tokenAccountsByOwner)
    )
      return []

    const tokenTxs = []

    instructions.forEach((instruction) => {
      const { type, program, source, destination, amount, tokenAmount } = instruction

      if (isSplTransferInstruction({ program, type })) {
        let tokenAccount = lodash.find(tokenAccountsByOwner, { tokenAccountAddress: source })
        const isSending = !!tokenAccount
        if (!isSending)
          tokenAccount = lodash.find(tokenAccountsByOwner, {
            tokenAccountAddress: destination,
          }) // receiving
        if (!tokenAccount) return // no transfers with our addresses involved

        const owner = isSending ? ownerAddress : null

        delete tokenAccount.balance
        delete tokenAccount.owner

        tokenTxs.push({
          owner,
          token: tokenAccount,
          from: isSending ? ownerAddress : source,
          to: isSending ? destination : ownerAddress,
          amount: Number(amount || tokenAmount?.amount || 0), // supporting types: transfer, transferChecked, transferCheckedWithFee
          fee: isSending ? fee : 0, // in lamports
        })
      }
    })

    return tokenTxs
  }

  async getWalletTokensList({ tokenAccounts }) {
    const tokensMint = []
    for (const account of tokenAccounts) {
      const mint = account.mintAddress

      // skip cached NFT
      if (this.tokensToSkip[mint]) continue
      // skip 0 balance
      if (account.balance === '0') continue
      // skip NFT
      if (!this.tokens.has(mint)) {
        const supply = await this.getSupply(mint)
        if (supply === '1') {
          this.tokensToSkip[mint] = true
          continue
        }
      }

      // OK
      tokensMint.push(mint)
    }

    return tokensMint
  }

  async getTokenAccountsByOwner(address, tokenTicker) {
    const [{ value: standardTokenAccounts }, { value: token2022Accounts }] = await Promise.all([
      this.rpcCall(
        'getTokenAccountsByOwner',
        [address, { programId: TOKEN_PROGRAM_ID.toBase58() }, { encoding: 'jsonParsed' }],
        { address }
      ),
      this.rpcCall(
        'getTokenAccountsByOwner',
        [address, { programId: TOKEN_2022_PROGRAM_ID.toBase58() }, { encoding: 'jsonParsed' }],
        { address }
      ),
    ])

    // merge regular token and token2022 program tokens
    const accountsList = [...standardTokenAccounts, ...token2022Accounts]

    const tokenAccounts = []
    for (const entry of accountsList) {
      const { pubkey, account } = entry

      const mint = lodash.get(account, 'data.parsed.info.mint')
      const token = this.getTokenByAddress(mint) || {
        name: 'unknown',
        ticker: 'UNKNOWN',
        decimals: 0,
      }
      const balance = lodash.get(account, 'data.parsed.info.tokenAmount.amount', '0')
      const tokenProgram = lodash.get(account, 'owner', null) // TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
      const { feeBasisPoints = 0, maximumFee = 0 } =
        tokenProgram === TOKEN_2022_PROGRAM_ID.toBase58()
          ? await this.getTokenFeeBasisPoints(mint)
          : {}

      tokenAccounts.push({
        tokenAccountAddress: pubkey,
        owner: address,
        tokenName: token.name,
        ticker: token.ticker,
        balance,
        mintAddress: mint,
        tokenProgram,
        decimals: token.decimals,
        feeBasisPoints,
        maximumFee,
      })
    }

    // eventually filter by token
    return tokenTicker
      ? tokenAccounts.filter(({ ticker }) => ticker === tokenTicker)
      : tokenAccounts
  }

  async getTokensBalance({ address, filterByTokens = [], tokenAccounts }) {
    const accounts = tokenAccounts || (await this.getTokenAccountsByOwner(address))

    return accounts.reduce((acc, { tokenName, balance }) => {
      if (
        tokenName === 'unknown' ||
        (filterByTokens.length > 0 && !filterByTokens.includes(tokenName))
      )
        return acc // filter by supported tokens only
      if (acc[tokenName]) {
        acc[tokenName] += Number(balance)
      }
      // e.g { 'serum': 123 }
      else {
        acc[tokenName] = Number(balance)
      } // merge same token account balance

      return acc
    }, {})
  }

  async isAssociatedTokenAccountActive(tokenAddress) {
    // Returns the token balance of an SPL Token account.
    try {
      await this.rpcCall('getTokenAccountBalance', [tokenAddress])
      return true
    } catch {
      return false
    }
  }

  // Returns account balance of a SPL Token account.
  async getTokenBalance(tokenAddress) {
    const result = await this.rpcCall('getTokenAccountBalance', [tokenAddress])
    return lodash.get(result, 'value.amount')
  }

  async getAccountInfo(address, encoding = 'jsonParsed') {
    const { value } = await this.rpcCall(
      'getAccountInfo',
      [address, { encoding, commitment: 'single' }],
      { address }
    )
    return value
  }

  async isSpl(address) {
    const { owner } = await this.getAccountInfo(address)
    return [TOKEN_PROGRAM_ID.toBase58(), TOKEN_2022_PROGRAM_ID.toBase58()].includes(owner)
  }

  async getTokenFeeBasisPoints(address) {
    // only for token-2022
    const value = await this.getAccountInfo(address)
    const { transferFeeBasisPoints, maximumFee } = lodash.get(
      value,
      'data.parsed.info.extensions[0].state.newerTransferFee',
      { transferFeeBasisPoints: 0, maximumFee: 0 }
    )

    return { feeBasisPoints: transferFeeBasisPoints, maximumFee }
  }

  async getMetaplexMetadata(tokenMintAddress) {
    const metaplexPDA = getMetadataAccount(tokenMintAddress)
    const res = await this.getAccountInfo(metaplexPDA, 'base64')
    const data = lodash.get(res, 'data[0]')
    if (!data) return null

    return deserializeMetaplexMetadata(Buffer.from(data, 'base64'))
  }

  async getDecimals(tokenMintAddress) {
    const result = await this.rpcCall('getTokenSupply', [tokenMintAddress])
    return lodash.get(result, 'value.decimals', null)
  }

  async getAddressType(address) {
    // solana, token or null (unknown), meaning address has never been initialized
    const value = await this.getAccountInfo(address)
    if (value === null) return null

    const account = {
      executable: value.executable,
      owner: value.owner,
      lamports: value.lamports,
    }

    if (account.owner === SYSTEM_PROGRAM_ID.toBase58()) return 'solana'
    if (account.owner === TOKEN_PROGRAM_ID.toBase58()) return 'token'
    if (account.owner === TOKEN_2022_PROGRAM_ID.toBase58()) return 'token-2022'
    return null
  }

  async getTokenAddressOwner(address) {
    const value = await this.getAccountInfo(address)
    return lodash.get(value, 'data.parsed.info.owner', null)
  }

  async getAddressMint(address) {
    const value = await this.getAccountInfo(address)
    // token mint
    return lodash.get(value, 'data.parsed.info.mint', null)
  }

  async isTokenAddress(address) {
    const type = await this.getAddressType(address)
    return ['token', 'token-2022'].includes(type)
  }

  async isSOLaddress(address) {
    const type = await this.getAddressType(address)
    return type === 'solana'
  }

  async getStakeAccountsInfo(address) {
    const params = [
      STAKE_PROGRAM_ID.toBase58(),
      {
        filters: [
          {
            memcmp: {
              offset: 12,
              bytes: address,
            },
          },
        ],
        encoding: 'jsonParsed',
      },
    ]
    const res = await this.rpcCall('getProgramAccounts', params, { address })

    const accounts = {}
    let totalStake = 0
    let locked = 0
    let activating = 0
    let withdrawable = 0
    let pending = 0
    for (const entry of res) {
      const addr = entry.pubkey
      const lamports = lodash.get(entry, 'account.lamports', 0)
      const delegation = lodash.get(entry, 'account.data.parsed.info.stake.delegation', {})
      // could have no delegation if the created stake address did not perform a delegate transaction

      accounts[addr] = delegation
      accounts[addr].lamports = lamports // sol balance
      accounts[addr].activationEpoch = Number(accounts[addr].activationEpoch) || 0
      accounts[addr].deactivationEpoch = Number(accounts[addr].deactivationEpoch) || 0
      let state = 'inactive'
      if (delegation.activationEpoch) state = await this.getStakeActivation(addr)
      accounts[addr].state = state
      accounts[addr].isDeactivating = state === 'deactivating'
      accounts[addr].canWithdraw = state === 'inactive'
      accounts[addr].stake = Number(accounts[addr].stake) || 0 // active staked amount
      totalStake += accounts[addr].stake
      locked += ['active', 'activating'].includes(accounts[addr].state) ? lamports : 0
      activating += accounts[addr].state === 'activating' ? lamports : 0
      withdrawable += accounts[addr].canWithdraw ? lamports : 0
      pending += accounts[addr].isDeactivating ? lamports : 0
    }

    return { accounts, totalStake, locked, withdrawable, pending, activating }
  }

  async getRewards(stakingAddresses = []) {
    if (stakingAddresses.length === 0) return 0

    // custom endpoint!
    const rewards = await this.request('rewards')
      .post({ addresses: stakingAddresses })
      .error(500, () => ({})) // addresses not found
      .error(400, () => ({}))
      .json()

    // sum rewards for all addresses
    return Object.values(rewards).reduce((total, x) => {
      return total + x
    }, 0)
  }

  async getProgramAccounts(programId, config) {
    return this.rpcCall('getProgramAccounts', [programId, config])
  }

  async getMultipleAccounts(pubkeys, config) {
    const response = await this.rpcCall('getMultipleAccounts', [pubkeys, config])
    return response && response.value ? response.value : []
  }

  async getFeeForMessage(message, commitment) {
    const response = await this.rpcCall('getFeeForMessage', [
      Buffer.from(message.serialize()).toString('base64'),
      { commitment },
    ])

    return lodash.get(response, 'value')
  }

  /**
   * Broadcast a signed transaction
   */
  broadcastTransaction = async (signedTx, options) => {
    console.log('Solana broadcasting TX:', signedTx) // base64
    const defaultOptions = { encoding: 'base64', preflightCommitment: 'confirmed' }

    const params = [signedTx, { ...defaultOptions, ...options }]
    const errorMessagesToRetry = ['Blockhash not found']

    const broadcastTxWithRetry = retry(
      async () => {
        try {
          const result = await this.rpcCall('sendTransaction', params, { forceHttp: true })
          console.log(`tx ${JSON.stringify(result)} sent!`)

          return result || null
        } catch (error) {
          if (
            error.message &&
            !errorMessagesToRetry.some((errorMessage) => error.message.includes(errorMessage))
          ) {
            error.finalError = true
          }

          console.warn(`Error broadcasting tx. Retrying...`, error)

          throw error
        }
      },
      { delayTimesMs: ['6s', '6s', '8s', '10s'] }
    )

    return broadcastTxWithRetry()
  }

  simulateTransaction = async (encodedTransaction, options) => {
    const {
      value: { accounts, unitsConsumed, err },
    } = await this.rpcCall('simulateTransaction', [encodedTransaction, options])

    return { accounts, unitsConsumed, err }
  }

  resolveSimulationSideEffects = async (solAccounts, tokenAccounts) => {
    const willReceive = []
    const willSend = []

    const resolveSols = solAccounts.map(async (account) => {
      const currentAmount = await this.getBalance(account.address)
      const balance = computeBalance(account.amount, currentAmount)
      return {
        name: 'SOL',
        symbol: 'SOL',
        balance,
        decimal: SOL_DECIMAL,
        type: 'SOL',
      }
    })

    const _wrapAndHandleAccountNotFound = (fn, defaultValue) => {
      return async (...params) => {
        try {
          return await fn.apply(this, params)
        } catch (error) {
          if (error.message && error.message.includes('could not find account')) {
            return defaultValue
          }

          throw error
        }
      }
    }

    const _getTokenBalance = _wrapAndHandleAccountNotFound(this.getTokenBalance, '0')
    const _getDecimals = _wrapAndHandleAccountNotFound(this.getDecimals, 0)
    const _getSupply = _wrapAndHandleAccountNotFound(this.getSupply, '0')

    const resolveTokens = tokenAccounts.map(async (account) => {
      try {
        const [_tokenMetaPlex, currentAmount, decimal] = await Promise.all([
          this.getMetaplexMetadata(account.mint),
          _getTokenBalance(account.address),
          _getDecimals(account.mint),
        ])

        const tokenMetaPlex = _tokenMetaPlex || { name: null, symbol: null }
        let nft = Object.create(null)

        // Only perform an NFT check (getSupply) if decimal is zero
        if (decimal === 0 && (await _getSupply(account.mint)) === '1') {
          const compositeId = account.mint
          nft = {
            id: `solana:${compositeId}`,
            compositeId,
          }
        }

        const balance = computeBalance(account.amount, currentAmount)
        return {
          balance,
          decimal,
          nft,
          address: account.address,
          mint: account.mint,
          name: tokenMetaPlex.name,
          symbol: tokenMetaPlex.symbol,
          type: 'TOKEN',
        }
      } catch (error) {
        console.warn(error)
        return {
          balance: null,
        }
      }
    })

    const accounts = await Promise.all([...resolveSols, ...resolveTokens])
    accounts.forEach((account) => {
      if (account.balance === null) {
        return
      }

      if (account.balance > 0) {
        willReceive.push(account)
      } else {
        willSend.push(account)
      }
    })

    return {
      willReceive,
      willSend,
    }
  }

  simulateUnsignedTransaction = async ({ message, transactionMessage }) => {
    const { config, accountAddresses } = getTransactionSimulationParams(
      transactionMessage || message
    )
    // eslint-disable-next-line unicorn/no-new-array
    const signatures = new Array(message.header.numRequiredSignatures || 1).fill(null)
    const encodedTransaction = buildRawTransaction(
      Buffer.from(message.serialize()),
      signatures
    ).toString('base64')
    const { accounts, unitsConsumed, err } = await this.simulateTransaction(encodedTransaction, {
      ...config,
      replaceRecentBlockhash: false,
      sigVerify: false,
    })
    return {
      accounts,
      accountAddresses,
      unitsConsumed,
      err,
    }
  }

  /**
   * Simulate transaction and return side effects
   */
  simulateAndRetrieveSideEffects = async (
    message,
    publicKey,
    transactionMessage // decompiled TransactionMessage
  ) => {
    const { accounts, accountAddresses } = await this.simulateUnsignedTransaction({
      message,
      transactionMessage,
    })
    const { solAccounts, tokenAccounts } = filterAccountsByOwner(
      accounts,
      accountAddresses,
      publicKey
    )

    return this.resolveSimulationSideEffects(solAccounts, tokenAccounts)
  }
}
