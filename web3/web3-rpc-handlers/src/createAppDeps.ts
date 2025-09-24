import type { Chain } from './types.js'
import type {
  AppDeps,
  ApprovalHandlers,
  ConnectionInformation,
  IAssetsModule,
  IConnectedOriginsModule,
  IPersonalNotesModule,
  ScanDomainsFn,
} from '@exodus/web3-types'

type createAppDeps = (params: CreateAppDepsFunctionParams) => AppDeps

type createAppDepsFactory = (
  params: createAppDepsFactoryParams,
) => createAppDeps

interface createAppDepsFactoryParams {
  assetsModule: IAssetsModule
  connectedOrigins: IConnectedOriginsModule
  personalNotes: IPersonalNotesModule
  supportedChains?: Chain[]
}

interface CreateAppDepsFunctionParams {
  approvalHandlers: ApprovalHandlers
  connectionInfo: ConnectionInformation
  scanDomains: ScanDomainsFn
}

const createAppDeps: createAppDepsFactory =
  ({ assetsModule, connectedOrigins, personalNotes, supportedChains }) =>
  ({
    approvalHandlers,
    connectionInfo: { origin, name, icon, url },
    scanDomains,
  }) => {
    const isTrusted = async () => {
      try {
        const isTrusted: boolean = await connectedOrigins.isTrusted({ origin })

        if (isTrusted) {
          connectedOrigins.updateConnection({ origin, icon })
        }

        return isTrusted
      } catch (error) {
        console.error(
          `ConnectApps: Failed to check trusted origin ${origin}.`,
          error,
        )
        return false
      }
    }

    const ensureTrusted = async (network: string) => {
      try {
        const asset = await getAsset(network)
        await connectedOrigins.add({
          assetNames: [asset.baseAssetName],
          connectedAssetName: asset.baseAssetName,
          origin,
          name,
          icon,
          trusted: true,
        })
      } catch (error) {
        console.error(`ConnectApps: Failed to trust origin ${origin}.`, error)
      }
    }

    const ensureUntrusted = async () => {
      try {
        await connectedOrigins.untrust({
          origin,
        })
      } catch (error) {
        console.error(`ConnectApps: Failed to untrust origin ${origin}.`, error)
      }
    }

    const isAutoApproved = async () => {
      try {
        const isAutoApprove: boolean = await connectedOrigins.isAutoApprove({
          origin,
        })
        return isAutoApprove
      } catch (error) {
        console.error(
          `ConnectApps: Failed to check auto-approve origin ${origin}.`,
          error,
        )
        return false
      }
    }

    const getAsset = async (network: string) => {
      // We convert the network to the assetName
      // e.g cosmos:0000
      // e.g evm:0x1
      // e.g algorand
      let assetName = network
      if (network.includes(':') && supportedChains) {
        const foundChain = supportedChains.find(
          (chain) => chain.network === network,
        )
        if (!foundChain) {
          throw new Error(`network ${network} is not supported`)
        }
        assetName = foundChain.assetName
      }

      const asset = await assetsModule.getAsset(assetName)
      if (!asset) {
        throw new Error(`asset ${assetName} is not supported`)
      }
      return asset
    }

    const onTransactionsSigned = async (
      network: string,
      transactionIds: string[],
    ) => {
      try {
        await Promise.all(
          transactionIds.map((transactionId) =>
            personalNotes.upsert({
              txId: transactionId,
              providerData: {
                network,
                origin,
              },
            }),
          ),
        )
      } catch (error) {
        console.error('failed to create personal notes', error)
      }
    }

    const getOrigin = () => origin

    const getPathname = () => new URL(url).pathname

    const getConnectedAccounts = async () => {
      return connectedOrigins.getConnectedAccounts({ origin })
    }

    const addConnection = async (assetNames: [string, ...string[]]) => {
      const assets = await Promise.all(assetNames.map((name) => getAsset(name)))

      await connectedOrigins.add({
        origin,
        name,
        icon,
        assetNames: assets.map((it) => it.baseAssetName),
        connectedAssetName: assets[0].baseAssetName,
        trusted: true,
      })
    }

    return {
      ...approvalHandlers,
      addConnection,
      isTrusted,
      ensureTrusted,
      ensureUntrusted,
      isAutoApproved,
      getAsset,
      onTransactionsSigned,
      getOrigin,
      getConnectedAccounts,
      getPathname,
      scanDomains,
    }
  }

export default createAppDeps
