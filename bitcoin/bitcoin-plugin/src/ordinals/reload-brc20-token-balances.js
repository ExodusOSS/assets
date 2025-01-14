import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { getInscriptionAddresses } from './get-inscription-addresses.js'

const { groupBy, mapValues } = lodash

const toTxLog = ({ historyItem, baseAsset, asset }) => {
  const amount = asset.currency.defaultUnit(historyItem.brc20Amt || 0)

  const isSend = historyItem.brc20Op === 'send'
  const isReceive = historyItem.brc20Op === 'receive'
  const isMint = historyItem.brc20Op === 'mint'
  const isTransfer = historyItem.brc20Op === 'transfer'

  const data = { operation: historyItem.brc20Op }
  return {
    txId: historyItem.txId,
    date: new Date(historyItem.createdAt),
    confirmations: 1,
    data: isSend
      ? {
          ...data,
          sent: [
            {
              address: historyItem.transferTo,
              amount: amount.toDefaultString({ unit: true }),
            },
          ],
        }
      : data,
    selfSend: isTransfer, // transfer is self inscribed ordinal that hasn't been sent yet
    from: isReceive ? [historyItem.transferFrom] : undefined,
    addresses: isReceive || isMint ? [historyItem.owner] : undefined,
    dropped: false,
    coinAmount: isSend ? amount.negate() : amount,
    coinName: asset.name,
    feeAmount: baseAsset.currency.defaultUnit(0), // unsure a possible value
    feeCoinName: baseAsset.name,
    currencies: { [baseAsset.name]: baseAsset.currency, [asset.name]: asset.currency },
  }
}

export const reloadBrc20TokenBalances = async ({
  brc20Client,
  assetClientInterface,
  walletAccount,
  asset,
  ordinalChainIndex,
  tickInscriptionIdIndexer,
}) => {
  assert(brc20Client, 'brc20Client is required')
  assert(assetClientInterface, 'assetClientInterface is required')
  assert(asset, 'asset is required')
  assert(walletAccount, 'walletAccount is required')
  assert(tickInscriptionIdIndexer, 'tickInscriptionIdIndexer is required')
  assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')
  const addresses = await getInscriptionAddresses({
    assetClientInterface,
    walletAccount,
    asset,
    ordinalChainIndex,
  })

  const assets = await assetClientInterface.getAssetsForNetwork({ baseAssetName: asset.name })

  const assetByAssetId = Object.values(assets)
    .filter((asset) => asset.assetId)
    .reduce((map, token) => {
      map.set(token.assetId, token)
      return map
    }, new Map())

  const unknownDeployInscriptionIds = new Set()

  const historyLists = await Promise.all(
    addresses.map(async (address) => {
      const tokensHistoryList = await brc20Client.getTokenTransactionHistory({ address })
      const history = await Promise.all(
        tokensHistoryList.map(async (token) => {
          const deployInscriptionId = await tickInscriptionIdIndexer.getDeployInscriptionId(
            token.brc20Tick
          )
          const assetName = assetByAssetId.get(deployInscriptionId)?.name
          if (assetName) {
            return { ...token, address, assetName, deployInscriptionId }
          }

          unknownDeployInscriptionIds.add(deployInscriptionId)
        })
      )
      return history.filter(Boolean)
    })
  )
  const brc20History = historyLists.flat()

  const eventsByAssetNameAndAddress = mapValues(
    groupBy(brc20History, (event) => event.assetName),
    (anotherList) => groupBy(anotherList, (event) => event.address)
  )

  const brc20Balances = mapValues(eventsByAssetNameAndAddress, (eventsByAddress) => {
    return mapValues(eventsByAddress, (events) => {
      const { brc20OwnerAvailableBalance, brc20OwnerTransferBalance, brc20Tick } = events[0]

      const sentList = new Set(
        events.filter((event) => event.brc20Op === 'send').map((event) => event.inscriptionId)
      )

      const transferableList = events
        .filter((event) => event.brc20Op === 'transfer')
        .map((event) => {
          return {
            inscriptionId: event.inscriptionId,
            inscriptionNumber: event.inscriptionNumber,
            brc20Amt: event.brc20Amt,
            txId: event.txId,
            sent: sentList.has(event.inscriptionId),
          }
        })
      return {
        brc20Tick,
        brc20OwnerAvailableBalance,
        brc20OwnerTransferBalance,
        brc20OwnerTotalBalance: brc20OwnerAvailableBalance + brc20OwnerTransferBalance,
        transferableList,
      }
    })
  })

  const allLogItems = brc20History
    .filter(({ assetName }) => assetName)
    .map((historyItem) => {
      return toTxLog({ historyItem, baseAsset: asset, asset: assets[historyItem.assetName] })
    })

  const logItemsByAsset = groupBy(allLogItems, 'coinName')

  await Promise.all(
    Object.entries(logItemsByAsset).map(([assetName, txs]) => {
      return assetClientInterface.updateTxLogAndNotify({
        assetName,
        walletAccount,
        txs,
      })
    })
  )

  await assetClientInterface.updateAccountState({
    assetName: asset.name,
    walletAccount,
    newData: { brc20Balances },
  })

  return {
    unknownDeployInscriptionIds: [...unknownDeployInscriptionIds],
  }
}
