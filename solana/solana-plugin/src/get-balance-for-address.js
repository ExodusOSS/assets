import assert from 'minimalistic-assert'

export const createGetBalanceForAddress = ({ api, asset }) => {
  assert(api, 'api is required')
  assert(asset, 'asset is required')
  return async (address) => {
    const accountInfo = await api.getAccountInfo(address)

    if (accountInfo) {
      return asset.currency.baseUnit(accountInfo.lamports)
    }

    return asset.currency.ZERO
  }
}
