import { BaseProvider } from '@exodus/web3-provider'

import type { Deps, WalletProviderManager } from './types.js'

export class ManagementProvider extends BaseProvider {
  #walletProviderManager: WalletProviderManager | null = null

  constructor({ transport, walletProviderManager }: Deps) {
    super({ transport })

    this.#walletProviderManager = walletProviderManager
  }

  /**
   * Ask the user through the Exodus extension UI which wallet to use.
   * In case multiple wallets are present in the tab. Allows them to pick
   * MetaMask, Exodus, etc...
   * @returns wallet name
   */
  askUserToChooseWallet = async (network: string): Promise<string> => {
    const wallets =
      this.#walletProviderManager
        ?.getWalletProviders()
        .map(({ name }) => name) || []

    const selectedWallet = await super._callRpcMethod<
      [string, string[]],
      string
    >('exodus_selectWallet', [network, wallets])

    this.#walletProviderManager!.setDefaultWalletProvider(selectedWallet)

    return <string>selectedWallet
  }
}
