import { getOrdinalAddress, getOrdinalsUtxos, getUtxos, partitionUtxos } from '@exodus/bitcoin-api'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { getInscriptionAddresses } from './get-inscription-addresses.js'
import { isNftBrc20 } from './nft-utils.js'

const { isEqual, uniq } = lodash

export const nftsApiFactory = ({ ordinalChainIndex, asset, assetClientInterface: aci }) => {
  assert(asset, 'asset is required')
  assert(aci, 'aci is required')
  assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')

  const processAdditionalInscriptions = async function ({ walletAccount, nfts }) {
    const ordinalAddress = await getOrdinalAddress({
      asset,
      assetClientInterface: aci,
      walletAccount,
      ordinalChainIndex,
    })

    const accountState = await aci.getAccountState({
      assetName: asset.name,
      walletAccount,
    })

    const storedOrdinalsUtxos = getOrdinalsUtxos({ accountState, asset })
    const storedUtxos = getUtxos({ accountState, asset })
    const allStoredUtxos = storedUtxos.union(storedOrdinalsUtxos)

    const knownUtxoIds = new Set(
      [...allStoredUtxos].map((utxo) => `${utxo.txId}:${utxo.vout}`.toLowerCase())
    )

    const additionalInscriptions = nfts
      .filter((nft) => knownUtxoIds.has(nft.output.toLowerCase()))
      .map((nft) => {
        const output = nft.output.split(':')
        return { txId: output[0], vout: parseInt(output[1]), inscriptionId: nft.tokenId }
      })

    if (!isEqual(accountState.additionalInscriptions || [], additionalInscriptions)) {
      const { utxos, ordinalsUtxos } = partitionUtxos({
        allUtxos: getUtxos({ accountState, asset }).union(
          getOrdinalsUtxos({ accountState, asset })
        ),
        ordinalsEnabled: true,
        ordinalAddress,
        mustAvoidUtxoIds: accountState.mustAvoidUtxoIds,
        knownBalanceUtxoIds: accountState.knownBalanceUtxoIds,
        additionalInscriptions,
      })

      await aci.updateAccountState({
        walletAccount,
        assetName: asset.name,
        newData: {
          utxos,
          ordinalsUtxos,
          additionalInscriptions,
        },
      })
      return ordinalsUtxos
    }

    return storedOrdinalsUtxos
  }

  return {
    // this extension returns all possible addresses that may contain nfts
    getNftsAddresses: async ({ walletAccount: walletAccountInstance }) => {
      return getInscriptionAddresses({
        assetClientInterface: aci,
        walletAccount: walletAccountInstance,
        ordinalChainIndex,
        asset,
      })
    },

    /*
      It flags the nfts in transfer, that don't have a utxo anymore
      It removes nfts that have brc20 content
    */
    postProcessNfts: async ({ nfts, walletAccount: walletAccountInstance, nftsProxy }) => {
      const walletAccount = walletAccountInstance.toString()

      const storedOrdinalsUtxos = await processAdditionalInscriptions({
        walletAccount,
        nfts,
      })

      if (nftsProxy) {
        const unconfirmedUtxosArray = storedOrdinalsUtxos
          .toArray()
          .filter((utxo) => !utxo.confirmations)

        const inscriptionIds = unconfirmedUtxosArray.flatMap(({ inscriptions }) =>
          inscriptions.map(({ inscriptionId }) => inscriptionId)
        )
        const uniqueInscriptionIds = uniq(inscriptionIds)

        try {
          const retrievedNfts = await Promise.all(
            uniqueInscriptionIds.map(async (inscriptionId) => {
              if (nfts.some((nft) => nft.tokenId === inscriptionId)) {
                return
              }

              try {
                const json = await nftsProxy.getNft(inscriptionId)
                const utxo = unconfirmedUtxosArray.find((utxo) =>
                  utxo.inscriptions
                    .map(({ inscriptionId }) => inscriptionId)
                    .includes(inscriptionId)
                )
                return {
                  ...json,
                  receiving: true,
                  output: `${utxo.txId}:${utxo.vout}`,
                  pendingTxId: utxo.txId,
                }
              } catch (e) {
                console.warn(
                  `Cannot load ${asset.name} nft ${inscriptionId} from proxy server. Error: ${e.message}`
                )
              }
            })
          )
          const unconfirmedNfts = retrievedNfts.flat().filter(Boolean)
          nfts.push(...unconfirmedNfts)
        } catch (e) {
          console.warn(
            `There has been an error adding mempool bitcoin ordinals into nfts list. Error: ${e.message}`
          )
        }
      }

      const unconfirmedTxs = [
        ...(await aci.getTxLog({
          walletAccount,
          assetName: asset.name,
        })),
      ].filter((tx) => !tx.confirmations)

      const utxosOutputs = new Set(
        storedOrdinalsUtxos
          .toArray()
          .map((utxo) => {
            return `${utxo.txId}:${utxo.vout}`.toLowerCase()
          })
          .filter(Boolean)
      )

      const expandedNfts = nfts.map((nft) => {
        const sending = !utxosOutputs.has(nft.output.toLowerCase())

        const sendingTx =
          sending &&
          unconfirmedTxs.find((tx) =>
            tx.data.sentInscriptions?.find((i) => i.inscriptionId === nft.tokenId)
          )
        return {
          pendingTxId: sendingTx?.txId,
          sending, // always set the field, if not, nft atoms deep merge could pick the old value
          ...nft,
          receiving: Boolean(nft.receiving),
        }
      })

      return expandedNfts
        .filter((nft) => !isNftBrc20(nft))
        .map((nft) => ({ ...nft, collectionName: nft.collectionName || 'No Collection' }))
    },

    addMustAvoidUtxoIds: async ({
      walletAccount: walletAccountInstance,
      mustAvoidUtxoIds: newMustAvoidUtxoIds,
      prune = false,
    }) => {
      assert(walletAccountInstance, 'walletAccount is required')
      assert(newMustAvoidUtxoIds, 'mustAvoidUtxoIds is required')

      if (!prune && newMustAvoidUtxoIds.length === 0) {
        return
      }

      const walletAccount = walletAccountInstance.toString()

      const accountState = await aci.getAccountState({
        assetName: asset.name,
        walletAccount,
      })

      const storedMustAvoidUtxosIds = accountState.mustAvoidUtxoIds || []

      const storedUtxos = getUtxos({ accountState, asset })

      const storedOrdinalsUtxos = getOrdinalsUtxos({ accountState, asset })

      const allStoredUtxos = storedUtxos.union(storedOrdinalsUtxos)

      const allMustAvoidUtxoIds = [
        ...new Set([...storedMustAvoidUtxosIds, ...newMustAvoidUtxoIds].sort()),
      ]

      const knownUtxoIds = new Set(
        [...allStoredUtxos].map((utxo) => `${utxo.txId}:${utxo.vout}`.toLowerCase())
      )

      const mustAvoidUtxoIds = prune
        ? allMustAvoidUtxoIds.filter((id) => knownUtxoIds.has(id))
        : allMustAvoidUtxoIds

      if (isEqual(mustAvoidUtxoIds, storedMustAvoidUtxosIds)) {
        return
      }

      const ordinalAddress = await getOrdinalAddress({
        asset,
        assetClientInterface: aci,
        walletAccount,
        ordinalChainIndex,
      })

      const { utxos, ordinalsUtxos } = partitionUtxos({
        allUtxos: allStoredUtxos,
        ordinalsEnabled: true,
        ordinalAddress,
        mustAvoidUtxoIds,
        knownBalanceUtxoIds: accountState.knownBalanceUtxoIds,
        additionalInscriptions: accountState.additionalInscriptions,
      })

      await aci.updateAccountState({
        walletAccount,
        assetName: asset.name,
        newData: {
          utxos,
          ordinalsUtxos,
          mustAvoidUtxoIds,
        },
      })
    },
  }
}
