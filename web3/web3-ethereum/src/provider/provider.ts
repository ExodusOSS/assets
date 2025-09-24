import { BaseProvider } from '@exodus/web3-provider'
import { ethErrors } from 'eth-rpc-errors'

import { createStorageWrapper } from './storage.js'

import type {
  AddEthereumChainParameter,
  ChainId,
  ChainParameter,
  Deps,
  JsonRpcCallback,
  JsonRpcRequest,
  JsonRpcResult,
  ProviderConnectInfo,
  ProviderStorage,
  RequestArguments,
} from './types.js'

const DEFAULT_CHAIN_ID: ChainId = '0x1' // Ethereum Mainnet.

// TODO: Augment event parameter types based on https://eips.ethereum.org/EIPS/eip-1193#events.
export interface EthereumProviderEvents {
  accountsChanged(accounts: string[]): void
  chainChanged(chainId: ChainId): void
  connect(providerConnectInfo: ProviderConnectInfo): void
  disconnect(): void
  message(): void
}

export class EthereumProvider extends BaseProvider<EthereumProviderEvents> {
  #storage: ProviderStorage

  #supportedChainIds: ChainId[]
  #getDefaultChainId: () => Promise<ChainId | null>

  #initializePromise: Promise<void> | null = null
  #initialized = false

  #isConnected = false
  #chainId: ChainId | null = null
  #accounts: string[] = []
  #selectedAddress: string | null = null

  constructor({
    accountsObservable,
    transport,
    storage,
    storageKeyPrefix,
    supportedChainIds = [DEFAULT_CHAIN_ID],
    getDefaultChainId = () => Promise.resolve(null),
  }: Deps) {
    super({ transport })

    if (!storageKeyPrefix) {
      throw new Error('"storageKeyPrefix" must be provided.')
    }

    this.#storage = createStorageWrapper(storage, storageKeyPrefix)

    this.#supportedChainIds = supportedChainIds
      .map(this.#sanitizeChainId)
      .sort()

    this.#getDefaultChainId = async () =>
      getDefaultChainId().then((chainId) =>
        chainId ? this.#sanitizeChainId(chainId) : null,
      )

    // Observe account changes.
    this.on('connect', () => {
      const unobserve = accountsObservable.observe((accounts: string[]) => {
        this.#handleAccountsChanged(accounts)
      })
      this.on('disconnect', unobserve)
    })

    this.on('connect', () => {
      this.#isConnected = true
    })

    this.#initializePromise = this.#initialize()
  }

  protected _callRpcMethod<Params, Response>(
    method: string,
    params: Params,
  ): Promise<Response> {
    const prefix = this.#chainId!
    return super._callRpcMethod(`${prefix}_${method}`, params)
  }

  #assertConnected = (): void => {
    if (!this.isConnected()) {
      throw ethErrors.provider.disconnected({
        message: 'The Provider is disconnected from all chains.',
      })
    }
  }

  #assertChainSupported = (chainId: ChainId) => {
    if (!this.#supportedChainIds.includes(chainId)) {
      throw ethErrors.provider.custom({
        message: 'The Provider does not support the requested chain.',
        code: 4902,
      })
    }
  }

  #getChainId = async (): Promise<ChainId> => {
    const storedChainId = await this.#storage.getChainId()
    if (storedChainId) {
      return storedChainId
    }

    // TODO: Do we still need remote-config default chain IDs?
    const defaultChainId = await this.#getDefaultChainId()
    if (defaultChainId) {
      return defaultChainId
    }

    return this.#supportedChainIds[0]
  }

  #getAccounts = async (): Promise<string[]> => {
    return this._callRpcMethod<[], string[]>('eth_accounts', [])
  }

  #initialize = async () => {
    const chainId = await this.#getChainId()

    this.#handleConnect(chainId)
    this.#handleChainChanged(chainId)

    const accounts = await this.#getAccounts()

    this.#initialized = true
    this.#initializePromise = null

    this.#handleAccountsChanged(accounts)
  }

  #awaitInitialized = async () => {
    if (this.#initializePromise) {
      await this.#initializePromise
    }
  }

  #sanitizeChainId = (chainId: ChainId): ChainId => {
    return chainId.toLowerCase()
  }

  #handleConnect = (chainId: ChainId): void => {
    if (!this.#isConnected) {
      this.#isConnected = true
      this.emitAndIgnoreErrors('connect', { chainId })
    }
  }

  #handleChainChanged = (chainId: ChainId): void => {
    if (!chainId || typeof chainId !== 'string' || !chainId.startsWith('0x')) {
      return
    }

    if (chainId !== this.#chainId) {
      this.#chainId = chainId

      if (this.#initialized) {
        this.emitAndIgnoreErrors('chainChanged', chainId)
      }
    }
  }

  #handleAccountsChanged = (accounts: string[]): void => {
    // `accounts` is always going to have a single account (or none) for the time being.
    if (this.#accounts[0] !== accounts[0]) {
      this.#accounts = accounts

      this.#selectedAddress = accounts[0] ?? null

      if (this.#initialized) {
        this.emitAndIgnoreErrors('accountsChanged', accounts)
      }
    }
  }

  #requestAccounts = async (): Promise<string[]> => {
    const permissions = { eth_accounts: {} }
    await this._callRpcMethod('wallet_requestPermissions', [permissions])

    const accounts = await this._callRpcMethod<[], string[]>('eth_accounts', [])

    this.#handleAccountsChanged(accounts)

    return accounts
  }

  #addChain = async (params: AddEthereumChainParameter): Promise<null> => {
    // If the requested chain is supported, the provider will switch to that chain
    // This matches MetaMask's behavior.
    // See: https://github.com/MetaMask/metamask-extension/blob/d92936475a942fed060bb36f810ee6bfd901f4f4/app/scripts/lib/rpc-method-middleware/handlers/add-ethereum-chain.js#L167-L183.
    // if not supported yet, add it

    const chainId = this.#sanitizeChainId(params.chainId)
    if (!this.#supportedChainIds.includes(chainId)) {
      await this._callRpcMethod<[AddEthereumChainParameter], boolean>(
        'wallet_addEthereumChain',
        [params],
      )
      this.#supportedChainIds.push(chainId)
    }
    return this.#switchChain(chainId)
  }

  #switchChain = async (chainId: ChainId): Promise<null> => {
    if (chainId !== this.#chainId) {
      try {
        // Try to switch to one of the provider known chains.
        this.#assertChainSupported(chainId)
      } catch (err) {
        // Attempt to switch to a dynamically supported chain.
        const didSwitch = await this._callRpcMethod<[ChainParameter], boolean>(
          'wallet_switchEthereumChain',
          [{ chainId }],
        )
        if (!didSwitch) {
          throw err
        }
        this.#supportedChainIds.push(chainId)
      }

      this.#handleChainChanged(chainId)

      await this.#storage.setChainId(chainId)
    }

    return null
  }

  isConnected(): boolean {
    return this.#isConnected
  }

  request = async (args: RequestArguments): Promise<unknown> => {
    await this.#awaitInitialized()

    this.#assertConnected()

    const { method, params = [] } = args

    if (typeof method !== 'string' || method.length === 0) {
      throw ethErrors.rpc.invalidRequest({
        message: "'args.method' must be a non-empty string.",
        data: args,
      })
    }

    if (
      !Array.isArray(params) &&
      (typeof params !== 'object' || params === null)
    ) {
      throw ethErrors.rpc.invalidRequest({
        message: "'args.params' must be an object or array if provided.",
        data: args,
      })
    }

    /**
     * Intercepted requests.
     */

    // EIP-695
    // See: https://eips.ethereum.org/EIPS/eip-695.
    if (method === 'eth_chainId') {
      return this.#chainId
    }

    // EIP-2255.
    // See: https://eips.ethereum.org/EIPS/eip-2255.
    if (method === 'eth_requestAccounts') {
      return this.#requestAccounts()
    }

    // EIP-3085
    // See: https://eips.ethereum.org/EIPS/eip-3085.
    if (method === 'wallet_addEthereumChain') {
      return this.#addChain(
        (params as unknown[])[0] as AddEthereumChainParameter,
      )
    }

    // EIP-3326.
    // See: https://eips.ethereum.org/EIPS/eip-3326.
    if (method === 'wallet_switchEthereumChain') {
      const { chainId } = (params as unknown[])[0] as ChainParameter
      return this.#switchChain(this.#sanitizeChainId(chainId))
    }

    /**
     * Request.
     */

    let revisedParams = params
    if (method === 'personal_sign') {
      // Omit `password` parameter if passed.
      // See: https://github.com/ethereum/go-ethereum/pull/2940.
      revisedParams = (params as unknown[]).slice(0, 2)
    }

    return this._callRpcMethod(method, revisedParams)
  }

  /**
   * Experimental API
   */

  _metamask = {
    /**
     * Determines if MetaMask is unlocked by the user.
     *
     * @returns Promise resolving to true if MetaMask is currently unlocked.
     */
    // TODO: improve this, atm heurestic if we have accounts, assume unlocked
    isUnlocked: async () =>
      Array.isArray(this.#accounts) && this.#accounts.length > 0,

    /**
     * Make a batch RPC request.
     *
     * @param requests - The RPC requests to make.
     */
    requestBatch: async (requests: RequestArguments[]) => {
      if (!Array.isArray(requests)) {
        throw ethErrors.rpc.invalidRequest({
          message:
            'Batch requests must be made with an array of request objects.',
          data: requests,
        })
      }

      const results: unknown[] = []
      // for-loop to ensure handling requests one-by-one.
      for (const request of requests) {
        results.push(await this.request(request))
      }

      return results
    },
  }

  /*
   * Legacy API.
   */

  get chainId(): ChainId | null {
    console.warn(
      'Exodus: "ethereum.chainId" is deprecated and may be removed in the future. Please use "ethereum.request({ method: \'eth_chainId\' })" instead.',
    )

    return this.#chainId
  }

  get selectedAddress(): string | null {
    console.warn(
      'Exodus: "ethereum.selectedAddress" is deprecated and may be removed in the future. Please use "ethereum.request({ method: \'eth_accounts\' })" instead.',
    )

    return this.#selectedAddress
  }

  enable = async (): Promise<string[]> => {
    console.warn(
      'Exodus: "ethereum.enable()" is deprecated and may be removed in the future. Please use "ethereum.request({ method: \'eth_requestAccounts\' })" instead.\nFor more information, see: https://eips.ethereum.org/EIPS/eip-1102.',
    )

    this.#assertConnected()

    return this.#requestAccounts()
  }

  send = async (
    methodOrPayload: string | JsonRpcRequest,
    paramsOrCallback: unknown[] | JsonRpcCallback,
  ): Promise<void | JsonRpcResult> => {
    console.warn(
      'Exodus: "ethereum.send()" is deprecated and may be removed in the future. Please use "ethereum.request()" instead.',
    )

    const hasMethod = typeof methodOrPayload === 'string'
    const hasParams = Array.isArray(paramsOrCallback)

    if (hasMethod && (!paramsOrCallback || hasParams)) {
      const method = methodOrPayload as string
      const params = paramsOrCallback as unknown[]
      return new Promise((resolve, reject) =>
        this.request({ method, params })
          .then((result) => resolve({ id: '1', jsonrpc: '2.0', result }))
          .catch((err) => reject({ id: '1', jsonrpc: '2.0', error: err })),
      )
    }

    const payload = methodOrPayload as JsonRpcRequest
    const callback = paramsOrCallback as JsonRpcCallback
    this.sendAsync(payload, callback)
  }

  sendAsync = (payload: JsonRpcRequest, callback: JsonRpcCallback): void => {
    console.warn(
      'Exodus: "ethereum.sendAsync()" is deprecated and may be removed in the future. Please use "ethereum.request()" instead.',
    )

    const { id, jsonrpc, method, params } = payload

    const hasCallback = callback && typeof callback === 'function'

    this.request({ method, params })
      .then((result) => {
        if (hasCallback) {
          callback(null, { id, jsonrpc, result })
        }
      })
      .catch((err) => {
        if (hasCallback) {
          callback(err, { id, jsonrpc, error: err })
        }
      })
  }
}
