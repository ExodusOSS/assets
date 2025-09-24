import type { ProviderStorage } from './types.js'
import type { Storage } from '@exodus/web3-types'

export function createStorageWrapper(
  storage: Storage,
  storageKeyPrefix: string,
): ProviderStorage {
  const chainIdKey = `${storageKeyPrefix}:ethereum:chainId`

  async function getChainId(): Promise<string | null> {
    try {
      return await storage.getItem(chainIdKey)
    } catch (err) {
      return null
    }
  }

  async function setChainId(chainId: string): Promise<void> {
    try {
      await storage.setItem(chainIdKey, chainId)
    } catch (err) {
      // Ignore error.
    }
  }

  async function clearChainId(): Promise<void> {
    try {
      await storage.removeItem(chainIdKey)
    } catch (err) {
      // Ignore error.
    }
  }

  return { getChainId, setChainId, clearChainId }
}
