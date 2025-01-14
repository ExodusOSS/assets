import { UserRejectedRequestError } from '@exodus/web3-errors'
import { getAreDomainsPotentiallyUnsecure, DomainStatusEnum } from '@exodus/web3-rpc-handlers'

import type { ManagementDeps } from '../types.js'
import type RPC from '@exodus/json-rpc'
import type { AppDeps } from '@exodus/web3-types'

export function exposeHandlers(
  rpc: typeof RPC,
  deps: ManagementDeps & AppDeps,
) {
  const { isTrusted, chooseWallet, getOrigin, getPathname, scanDomains } = deps

  rpc.exposeFunction(
    'exodus_selectWallet',
    async (network: string, wallets: string[]): Promise<string | undefined> => {
      const trusted = await isTrusted()
      const { status: scanStatus, scanResult } = await getAreDomainsPotentiallyUnsecure({
        scanDomains,
        domains: [getOrigin() + `${getPathname ? getPathname() : ''}`],
      })
      let selectedWallet

      if (!trusted || scanStatus === DomainStatusEnum.UNSECURE) {
        selectedWallet = await chooseWallet(network, wallets, scanResult)

        if (!selectedWallet) {
          throw new UserRejectedRequestError()
        }
      }

      return selectedWallet
    },
  )
}
