import assert from 'minimalistic-assert'

export async function getOrdinalAddress({
  asset,
  assetClientInterface,
  walletAccount,
  ordinalChainIndex,
}) {
  assert(asset, 'asset is required')
  assert(assetClientInterface, 'assetClientInterface is required')
  assert(walletAccount, 'walletAccount is required')
  if (ordinalChainIndex === undefined) {
    return
  }

  const purposes = await assetClientInterface.getSupportedPurposes({
    assetName: asset.name,
    walletAccount,
  })

  const purpose = 86

  if (!purposes.includes(purpose)) {
    return
  }

  return assetClientInterface.getAddress({
    assetName: asset.name,
    walletAccount,
    purpose,
    chainIndex: ordinalChainIndex,
    addressIndex: 0,
  })
}
