import { getOrdinalsUtxos } from '@exodus/bitcoin-api'
import assert from 'minimalistic-assert'

import { xverse49, xverse49NotMerged } from '../compatibility-modes.js'

export const getInscriptionAddresses = async ({
  assetClientInterface: aci,
  walletAccount: walletAccountInstance,
  asset,
  ordinalChainIndex,
}) => {
  assert(aci, 'assetClientInterface is required')
  assert(asset, 'asset is required')
  assert(walletAccountInstance, 'walletAccount is required')
  assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')

  const assetName = asset.name
  const walletAccount = walletAccountInstance.toString()
  const accountState = await aci.getAccountState({ walletAccount, assetName })

  // all the known utxos addresses are monitored,
  // just in case the user received it to a standard btc address
  const allUtxos = getOrdinalsUtxos({ accountState, asset }).union(accountState.utxos)
  const addresses = allUtxos.toArray().map((utxos) => utxos.address)
  const specialAddress1 = await aci.getAddress({
    assetName,
    walletAccount,
    purpose: 86,
    chainIndex: ordinalChainIndex,
    addressIndex: 0,
  })

  const specialAddress2 = await aci.getAddress({
    assetName,
    walletAccount,
    purpose: 86,
    chainIndex: 0,
    addressIndex: 0,
  })

  const specialAddress3 =
    walletAccountInstance.compatibilityMode === xverse49 ||
    walletAccountInstance.compatibilityMode === xverse49NotMerged
      ? await aci.getAddress({
          // xverse
          assetName,
          walletAccount,
          purpose: 49,
          chainIndex: 0,
          addressIndex: 0,
        })
      : undefined

  const allAddresses = [specialAddress1, specialAddress2, specialAddress3, ...addresses]
    .filter(Boolean)
    .map((t) => t.address.toString())

  return [...new Set(allAddresses)]
}
