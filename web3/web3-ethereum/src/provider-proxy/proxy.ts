import { createProviderProxy } from '@exodus/web3-provider/proxy'

import type {
  EthereumProvider,
  EthereumProviderEvents,
} from '../provider/provider.js'
import type { RequestArguments } from '../provider/types.js'
import type {
  ManagementProvider,
  WalletProviderManager,
} from '@exodus/web3-management'
import type { UnknownFunction } from '@exodus/web3-types'
import type { ArgumentMap } from 'eventemitter3'

const ETHEREUM_INIT_METHODS_SET = new Set([
  'accountsChangedSet',
  'autoRefreshOnNetworkChange',
  'chainId',
  'enable',
  'isConnected',
  'isUnlocked',
  'networkChangedSet',
  'request',
  'selectedAddress',
  'send',
  'sendAsync',
])

type EthereumProviderWithFlags = EthereumProvider & {
  isMetaMask: boolean
  isExodus: boolean
  isPhantom: boolean
}

export type EthereumProviderProxyDeps = {
  // Wallet nname flag, e.g: "isExodus", "isMagicEden"
  isWalletNameFlag: string
  // Whether we should impersonate others wallets like MetaMask and Phantom
  impersonateOtherWallets?: boolean
  getDefaultChainId: () => number
  walletProviderManager: WalletProviderManager
  // This should return an already initialized ManagementProvider
  getManagementProvider: () => Promise<ManagementProvider>
  // This should return an already initialized EthereumProvider
  getEthereumProvider: () => Promise<EthereumProviderWithFlags>
}

/**
 * createEthereumProviderProxy creates a light weight proxy that
 * gets intercepts all calls to the real provider. By default only
 * the proxy will be loaded and it will instantiate the real provider
 * once it's being used in order to reduce the memory load of our provider
 * whenever injected inside a website that doesn't use web3.
 * @param param0
 * @returns
 */
export const createEthereumProviderProxy = ({
  isWalletNameFlag,
  impersonateOtherWallets,
  getDefaultChainId,
  walletProviderManager,
  getManagementProvider,
  getEthereumProvider,
}: EthereumProviderProxyDeps) => {
  let listeners: ([keyof EthereumProviderEvents, () => void])[] = []
  let provider: EthereumProviderWithFlags = Object.assign(Object.create(null), {
    [isWalletNameFlag]: true,
  })

  const cacheListener = <T extends keyof EthereumProviderEvents>(
    event: T,
    listener: (
      ...args: ArgumentMap<EthereumProviderEvents>[Extract<
        T,
        keyof EthereumProviderEvents
      >]
    ) => void,
  ) => {
    listeners.push([event, listener])
    return provider
  }

  const clearCachedListeners = () => {
    listeners = []
    return provider
  }

  const setNameFlags = () => {
    if (impersonateOtherWallets) {
      // For compatibility with MetaMask's Ethereum Provider.
      // See: https://docs.metamask.io/guide/ethereum-provider.html#properties.
      provider.isMetaMask = true

      // For Phantom compatiblity
      provider.isPhantom = true
    }

    // Dynamically set the wallet name flag to true
    provider.defineFlag?.(isWalletNameFlag)
  }

  const restoreListeners = (provider: EthereumProvider) => {
    listeners.forEach(([event, listener]) => provider.on(event, listener))
    listeners = []
  }

  provider.on = cacheListener
  provider.addListener = cacheListener
  provider.removeAllListeners = clearCachedListeners

  setNameFlags()

  const initProvider = async () => {
    provider = await getEthereumProvider()

    setNameFlags()

    restoreListeners(provider)
  }

  const getActiveChainId = () => provider.request({ method: 'eth_chainId' })

  const get = (_: unknown, property: keyof EthereumProvider) => {
    const contextualFunction = (
      property: keyof EthereumProvider,
      shouldInitProvider = false,
    ) => {
      if (provider[property]?.constructor.name === 'Function') {
        return (provider[property] as UnknownFunction).bind(provider)
      }

      // Handle async calls
      return async (...args: ({ method: string, params: unknown[] })[]) => {
        if (shouldInitProvider) {
          await initProvider()
        }

        if (
          property === 'enable' ||
          args[0]?.method === 'eth_requestAccounts'
        ) {
          const managementProvider = await getManagementProvider()

          const chainId =
            (await getActiveChainId()) || (await getDefaultChainId())

          await managementProvider.askUserToChooseWallet(`evm:${chainId}`)

          const defaultWalletProvider =
            walletProviderManager.getDefaultWalletProvider<EthereumProvider>()

          // Check if the user selected a different wallet when connecting to Exodus wallet.
          if (defaultWalletProvider) {
            restoreListeners(defaultWalletProvider.provider)

            return (defaultWalletProvider.provider[property] as UnknownFunction).bind(
              defaultWalletProvider.provider,
            )(...args)
          }
        }

        return (provider[property] as UnknownFunction).bind(provider)(...args)
      }
    }

    const defaultWalletProvider =
      walletProviderManager.getDefaultWalletProvider<EthereumProvider>()

    if (defaultWalletProvider) {
      restoreListeners(defaultWalletProvider.provider)

      if (typeof defaultWalletProvider.provider[property] === 'function') {
        return (defaultWalletProvider.provider[property] as UnknownFunction).bind(
          defaultWalletProvider.provider,
        )
      }

      return defaultWalletProvider.provider[property]
    }

    if (provider[property] !== undefined) {
      if (typeof provider[property] === 'function') {
        return contextualFunction(property)
      }

      return provider[property]
    }

    if (ETHEREUM_INIT_METHODS_SET.has(property)) {
      return contextualFunction(property, true)
    }

    if (property === '_metamask') {
      return {
        isUnlocked: async () => {
          if (!provider._metamask) {
            await initProvider()
          }
          return provider._metamask.isUnlocked()
        },
        requestBatch: async (...args: unknown[]) => {
          if (!provider._metamask) {
            await initProvider()
          }
          return provider._metamask.requestBatch([...args] as unknown as RequestArguments[])
        },
      }
    }
  }

  const set = (target: EthereumProviderWithFlags, prop: keyof EthereumProviderWithFlags, value: unknown) => {
    // Allow setting these specific properties as the ecosystem relies on that.
    if (['autoRefreshOnNetworkChange', 'removeListener'].includes(prop)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      target[prop] = value
      return true
    }
    return false
  }

  const has = (_: unknown, property: string) =>
    ETHEREUM_INIT_METHODS_SET.has(property)

  return createProviderProxy(provider, { get, set, has })
}
