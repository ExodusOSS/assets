import { getOrdinalsUtxos } from '@exodus/bitcoin-api'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

const { sumBy } = lodash

export const brc20Utils = {
  getKnownInscriptionIds: ({ asset, accountState }) => {
    assert(accountState, 'accountState is required')
    assert(asset, 'asset is required')
    return getOrdinalsUtxos({ accountState, asset })
      .toArray()
      .flatMap((utxo) => utxo.inscriptions?.map((i) => i.inscriptionId))
  },

  getAllTransferableList: ({ accountState, asset }) => {
    assert(accountState, 'accountState is required')
    assert(asset, 'asset is required')
    const assetBalances = Object.values(accountState?.brc20Balances?.[asset.name] || {})
    const knownInscriptionIds = brc20Utils.getKnownInscriptionIds({ asset, accountState })
    return assetBalances
      .flatMap((item) => item.transferableList)
      .map((item) => {
        const sent = item.sent
        const ordinalUtxoKnown = knownInscriptionIds.includes(item.inscriptionId)
        return {
          inscriptionId: item.inscriptionId,
          inscriptionNumber: item.inscriptionNumber,
          txId: item.txId,
          amount: asset.currency.defaultUnit(item.brc20Amt),
          sent,
          isOrdinalUtxoKnown: ordinalUtxoKnown,
          valid: !sent && ordinalUtxoKnown,
        }
      })
      .sort((a, b) => {
        // valid first, then by inscription number descending
        if (a.valid && !b.valid) return -1
        if (!a.valid && b.valid) return 1
        return b.inscriptionNumber - a.inscriptionNumber
      })
  },

  getTransferableList: ({ asset, accountState }) => {
    const transferableList = brc20Utils.getAllTransferableList({ asset, accountState })
    // return the list of transferable inscription items that we hold of the utxos
    return transferableList
      .filter((item) => item.valid)
      .sort((a, b) => {
        // let's consume old ones first!
        return a.inscriptionNumber - b.inscriptionNumber
      })
  },

  getInTransitBalance: ({ asset, accountState }) => {
    const transferableList = brc20Utils.getAllTransferableList({ asset, accountState })
    const inTransitList = transferableList.filter((item) => !item.isOrdinalUtxoKnown && !item.sent)
    return inTransitList.reduce((amount, item) => amount.add(item.amount), asset.currency.ZERO)
  },

  isToken: ({ asset }) => {
    assert(asset, 'asset must be provided')
    return asset.name !== asset.baseAsset.name
  },

  getTokenBalance: ({ asset, accountState }) => {
    assert(asset, 'asset must be provided')
    assert(accountState, 'accountState must be provided')
    assert(brc20Utils.isToken({ asset }), `${asset.name} is must be a token`)
    const assetBalances = Object.values(accountState?.brc20Balances?.[asset.name] || {})
    const sum = sumBy(assetBalances, 'brc20OwnerTotalBalance')
    return asset.currency
      .defaultUnit(sum || 0)
      .sub(brc20Utils.getInTransitBalance({ asset, accountState }))
      .clampLowerZero()
  },

  getAvailableBalance: ({ asset, accountState }) => {
    assert(asset, 'asset must be provided')
    assert(accountState, 'accountState must be provided')
    assert(brc20Utils.isToken({ asset }), `${asset.name} is must be a token`)
    const assetBalances = Object.values(accountState?.brc20Balances?.[asset.name] || {})
    const sum = sumBy(assetBalances, 'brc20OwnerAvailableBalance')
    return asset.currency.defaultUnit(sum || 0)
  },

  getTransferableBalance: ({ asset, accountState }) => {
    assert(asset, 'asset must be provided')
    assert(accountState, 'accountState must be provided')
    assert(brc20Utils.isToken({ asset }), `${asset.name} is must be a token`)
    const assetBalances = Object.values(accountState?.brc20Balances?.[asset.name] || {})
    const sum = sumBy(assetBalances, 'brc20OwnerTransferBalance')
    return asset.currency
      .defaultUnit(sum || 0)
      .sub(brc20Utils.getInTransitBalance({ asset, accountState }))
      .clampLowerZero()
  },

  getAllSublists(transferableList) {
    const result = []

    const generateSublists = (sublist, index) => {
      if (index === transferableList.length) {
        result.push(sublist)
        return
      }

      // Include the current element in the sublist
      generateSublists([...sublist, transferableList[index]], index + 1)

      // Exclude the current element from the sublist
      generateSublists(sublist, index + 1)
    }

    generateSublists([], 0)
    return result
  },

  findTransferableItems({ transferableList, amount, currency }) {
    const sublists = brc20Utils
      .getAllSublists(transferableList)
      .map((transferableItems) => {
        const transferableItemsAmount = transferableItems.reduce(
          (acc, item) => acc.add(item.amount),
          currency.ZERO
        )
        return { transferableItemsAmount, transferableItems }
      })
      .filter((item) => item.transferableItemsAmount.lte(amount))
    const found = sublists.find((item) => item.transferableItemsAmount.equals(amount))
    if (found) {
      return found
    }

    return sublists.sort((a, b) => b.transferableItems.length - a.transferableItems.length)[0]
  },
}
