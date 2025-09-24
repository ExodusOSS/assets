import { Address, UtxoCollection } from '@exodus/models'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import ms from 'ms'

import { isChangeAddress, isReceiveAddress } from '../address-utils.js'
import { orderTxs } from '../insight-api-client/util.js'
import { getOrdinalAddress } from '../ordinals-utils.js'
import { getOrdinalsUtxos, getUtxos, partitionUtxos } from '../utxos-utils.js'
import { indexOrdinalUnconfirmedTx } from './ordinals-indexer-utils.js'

const { compact, isEqual, uniq } = lodash

// Time to check whether to drop a sent tx
const SENT_TIME_TO_DROP = ms('2m')

const COINBASE_MATURITY_HEIGHT = 100

export class BitcoinMonitorScanner {
  #asset
  #insightClient
  #assetClientInterface
  #txFetchLimitResolver
  #shouldExcludeVoutUtxo
  #yieldToUI
  #ordinalsEnabled
  #ordinalChainIndex
  #gapLimit
  #refreshGapLimit
  constructor({
    asset,
    assetClientInterface,
    insightClient,
    yieldToUI = () => {},
    shouldExcludeVoutUtxo = () => false,
    txFetchLimitResolver = ({ refresh }) => (refresh ? 50 : 10),
    ordinalsEnabled,
    ordinalChainIndex,
    gapLimit = 10,
    refreshGapLimit = 10,
  }) {
    assert(asset, 'asset is required!')
    assert(assetClientInterface, 'assetClientInterface is required!')
    assert(insightClient, 'insightClient is required')
    assert(typeof yieldToUI === 'function', 'yieldToUI must be a function')
    assert(typeof txFetchLimitResolver === 'function', 'txFetchLimitResolver must be a function')
    assert(typeof shouldExcludeVoutUtxo === 'function', 'shouldExcludeVoutUtxo must be a function')
    assert(typeof gapLimit === 'number', 'gapLimit must be a number')
    assert(typeof refreshGapLimit === 'number', 'refreshGapLimit must be a number')

    this.#asset = asset
    this.#insightClient = insightClient
    this.#assetClientInterface = assetClientInterface
    this.#txFetchLimitResolver = txFetchLimitResolver
    this.#shouldExcludeVoutUtxo = shouldExcludeVoutUtxo
    this.#ordinalsEnabled = ordinalsEnabled
    this.#ordinalChainIndex = ordinalChainIndex
    this.#gapLimit = gapLimit
    this.#refreshGapLimit = refreshGapLimit
  }

  async #getGapLimit({ assetConfig, refresh }) {
    if (typeof assetConfig.gapLimit === 'number') return assetConfig.gapLimit
    return refresh ? this.#refreshGapLimit : this.#gapLimit
  }

  async rescanBlockchainInsight({ walletAccount, refresh }) {
    const asset = this.#asset
    const assetClientInterface = this.#assetClientInterface
    const yieldToUI = this.#yieldToUI
    const insightClient = this.#insightClient
    const txFetchLimit = this.#txFetchLimitResolver({ assetName: asset.name, refresh })
    const assetName = asset.name
    const purposes = await assetClientInterface.getSupportedPurposes({ assetName, walletAccount })
    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })
    const currency = asset.currency
    const currentTxs = await assetClientInterface.getTxLog({ assetName, walletAccount })
    const assetConfig = await this.#assetClientInterface.getAssetConfig({
      assetName,
      walletAccount,
    })

    const multisigDataLength = assetConfig.multisigDataLength

    // multiAddressMode may be null, in which case it is enabled.
    const multiAddressMode = assetConfig.multiAddressMode ?? true

    const storedUtxos = getUtxos({ asset, accountState })
    const storedOrdinalUtxos = getOrdinalsUtxos({ asset, accountState })

    const currentStoredUtxos = storedUtxos.union(storedOrdinalUtxos)

    const currentTime = Date.now()
    const unconfirmedTxsToCheck = [...currentTxs].reduce((txs, tx) => {
      if (
        tx.pending && // Don't check sent tx that is younger than 2 minutes, because server might not have indexed it yet
        (!tx.sent || !tx.date || currentTime - tx.date.getTime() > SENT_TIME_TO_DROP)
      ) {
        txs[tx.txId] = tx
      }

      return txs
    }, Object.create(null))

    // this works because txs come back descending
    // if we receive a batch that is completely in our txLog, we'll assume we reached old territory
    // we also only consider confirmed txs because unconfirmed txs' order is not guaranteed
    const shouldStop = refresh
      ? () => false
      : (txs) =>
          txs.filter((tx) => {
            const txItem = currentTxs.get(tx.txid)
            const confirmed = txItem && txItem.confirmed
            const inscriptionsIndexed = txItem?.data?.inscriptionsIndexed
            return confirmed && (!this.#ordinalsEnabled || inscriptionsIndexed)
          }).length >= txs.length

    const unusedAddressIndexes = await assetClientInterface.getUnusedAddressIndexes({
      assetName,
      walletAccount,
      highestUnusedIndexes: true,
    })

    const resolvedGapLimit = await this.#getGapLimit({ assetConfig, refresh })
    /*
     * The chain fields/variables are number arrays of size 2
     *
     * The index of the array represents a chainIndex. Possible values are [0,1]
     * A value of the array represents the largest unused addressIndex that chainIndex. Possible values are 0+
     *
     * The chains and newChains structures have the following format:
     *
     * [{ purpose: purposeNumber, chain: [receiveAddressIndexNumber, changeAddressIndexNumber] }, ...]
     *
     *  - purpose is the available purpose for the given chain. BTC allows 44, 84, 89 atm.
     *  - chain is always an array of 2. Each value represent the higher unused addressIndex
     *  - in multi-address mode on, the wallet would show the highest unused addressIndex address
     *  - in multi-address mode off, the wallet would show the 0 addressIndex address
     *
     * Example:
     * [ { purpose: 44,  chain: [5, 7] } , { purpose: 84,  chain: [1, 10] }, { purpose: 86,  chain: [0, 0] } ]
     *
     * Means:
     * - for bip/purpose 44 and chainIndex 0 (receive), 5 is the greatest unused addressIndex
     * - for bip/purpose 44 and chainIndex 1 (change), 7 is the greatest unused addressIndex
     * - for bip/purpose 84 and chainIndex 0 (receive), 1 is the greatest unused addressIndex
     * - for bip/purpose 84 and chainIndex 1 (change), 10 is the greatest unused addressIndex
     */

    const chains = purposes.map((purpose) => {
      if (multiAddressMode) {
        return {
          purpose,
          chain: unusedAddressIndexes.find((indexes) => indexes.purpose === purpose)?.chain || [
            0, 0,
          ],
        }
      }

      // If not in multi address mode then stick chains to 0
      return {
        purpose,
        chain: [0, 0],
      }
    })

    // cloning
    const newChains = chains.map(({ purpose, chain }) => ({ purpose, chain: [...chain] }))

    const addrMap = Object.create(null)
    const purposeMap = Object.create(null)

    // NOTE: the hope is that this gets replaced with a fetch by xpub method and then following the chain here won't be necessary

    const aggregateAddresses = async (chainObjects) => {
      const promises = []
      for (const chainObject of chainObjects) {
        const { purpose, chainIndex, startAddressIndex, endAddressIndex } = chainObject
        for (
          let addressIndex = startAddressIndex;
          addressIndex <= endAddressIndex;
          addressIndex++
        ) {
          const index = multisigDataLength ?? 1
          for (let i = 0; i < index; i++) {
            promises.push(
              assetClientInterface
                .getAddress({
                  assetName,
                  walletAccount,
                  purpose,
                  chainIndex,
                  addressIndex,
                  ...(multisigDataLength ? { multisigDataIndex: i } : Object.create(null)),
                })
                .then((address) => {
                  const addressObject = this.#asset.address.toLegacyAddress
                    ? Address.create(
                        this.#asset.address.toLegacyAddress(String(address)),
                        address.meta
                      )
                    : address

                  const addressString = String(addressObject)

                  if (addrMap[addressString]) {
                    return null
                  }

                  addrMap[addressString] = addressObject

                  return {
                    address: addressObject,
                    purpose,
                  }
                })
            )
          }
        }
      }

      const addresses = []
      const allAddresses = await Promise.all(promises)
      const result = allAddresses.filter(Boolean)
      result.forEach(({ address, purpose }) => {
        purposeMap[String(address)] = purpose
        addresses.push(String(address))
      })
      return addresses
    }

    const fetchAllTxs = async (addresses) => {
      if (addresses.length === 0) return []

      const promises = []
      const fetchTimeout = 250

      const fetchAddressesSize = 25
      for (let i = 0; i < addresses.length; i += fetchAddressesSize) {
        const fetchAddresses = addresses.slice(i, i + fetchAddressesSize)
        const promise = insightClient.fetchAllTxData(
          fetchAddresses,
          txFetchLimit,
          fetchTimeout,
          shouldStop
        )
        promises.push(promise)
      }

      const listOfTxs = await Promise.all(promises)
      const insightTxs = listOfTxs.flat()
      if (!this.#ordinalsEnabled) {
        return insightTxs
      }

      return Promise.all(
        insightTxs.map((tx) => {
          try {
            return indexOrdinalUnconfirmedTx({
              tx,
              currency: this.#asset.currency,
              insightClient,
            })
          } catch (e) {
            console.warn(
              `Could not index ${asset.name} ordinal tx ${tx.txid} for wallet account ${walletAccount}. message: ${e.message}`,
              e
            )
            return tx
          }
        })
      )
    }

    const gapSearchParameters = newChains.map(({ purpose, chain }) => {
      return {
        purpose,
        chain,
        startAddressIndexes: chain.map(() => 0),
        endAddressIndexes: chain.map((addressIndex) => {
          if (refresh) return resolvedGapLimit
          return addressIndex + resolvedGapLimit
        }),
      }
    })

    let allTxs = []
    for (let fetchCount = 0; ; fetchCount++) {
      const chainObjects = gapSearchParameters.flatMap(
        ({ purpose, chain, startAddressIndexes, endAddressIndexes }) => {
          return chain.map((_, chainIndex) => {
            return {
              purpose,
              chainIndex,
              startAddressIndex: startAddressIndexes[chainIndex],
              endAddressIndex: endAddressIndexes[chainIndex],
            }
          })
        }
      )

      if (
        fetchCount === 0 &&
        this.#ordinalsEnabled &&
        this.#ordinalChainIndex > 1 &&
        purposes.includes(86)
      ) {
        // this is the ordinal address
        chainObjects.push({
          purpose: 86,
          chainIndex: this.#ordinalChainIndex,
          startAddressIndex: 0,
          endAddressIndex: 1,
        })
      }

      const addresses = await aggregateAddresses(chainObjects)

      if (fetchCount === 0) {
        // in compatibility mode, the receive address could be different
        const receiveAddress = await this.#assetClientInterface.getReceiveAddressObject({
          assetName,
          walletAccount,
          useCache: true,
        })
        if (!addresses.includes(receiveAddress.toString())) {
          addresses.push(receiveAddress.toString())
          addrMap[receiveAddress.toString()] = receiveAddress
        }
      }

      const txs = await fetchAllTxs(addresses)
      if (txs.length === 0) break
      allTxs = [...allTxs, ...txs]

      // Update chains to see if we need to fetch more
      if (multiAddressMode) {
        txs.forEach((tx) =>
          tx.vout.forEach((vout) => {
            if (!vout.scriptPubKey) return
            // this is an array because legacy multisig has multiple addresses
            if (!Array.isArray(vout.scriptPubKey.addresses)) return
            if (vout.scriptPubKey.addresses.length === 0) return
            if (!addrMap[vout.scriptPubKey.addresses[0]]) return

            const address = addrMap[vout.scriptPubKey.addresses[0]]
            // this is a used address, we need to update the chain
            const pd = address.meta.path.split('/')
            const metaChainIndex = parseInt(pd[1])
            const metaAddressIndex = pd[2] ? parseInt(pd[2]) : undefined // compatibility, it could shorter eg. m/0, not m/0/0
            const addressString = String(address)
            const purposeToUpdate = purposeMap[addressString]

            if (
              metaAddressIndex === undefined ||
              (metaChainIndex === this.#ordinalChainIndex && this.#ordinalChainIndex > 1)
            ) {
              return
            }

            if (!purposeToUpdate) {
              console.warn(`${assetName}: Cannot resolve purpose from address ${addressString}`)
              return
            }

            const chainToUpgrade = newChains.find(
              (newChain) => newChain.purpose === purposeToUpdate
            )
            if (!chainToUpgrade) {
              console.log(
                `${assetName}: There is no chain info for purpose ${purposeToUpdate} and address ${addressString}`
              )
              return
            }

            if (chainToUpgrade.chain[metaChainIndex] === undefined) {
              console.log(
                `${assetName}: There is no chain info for purpose ${purposeToUpdate}, address ${addressString} and chain index ${metaChainIndex}`
              )
              return
            }

            chainToUpgrade.chain[metaChainIndex] = Math.max(
              metaAddressIndex + 1,
              chainToUpgrade.chain[metaChainIndex]
            )
          })
        )
      }

      gapSearchParameters.forEach((indexData) => {
        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        indexData.startAddressIndexes = [...indexData.endAddressIndexes]
        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        indexData.endAddressIndexes = indexData.chain.map((addressIndex) => {
          return addressIndex + resolvedGapLimit
        })
      })

      // Safety check. Slow down if after 100 iterations txs are still being fetched.
      if (fetchCount > 100) await yieldToUI(1000)
    }

    allTxs = orderTxs(allTxs)

    // post process TX data
    // NOTE: this can be optimized
    const vinTxids = Object.create(null)
    let utxos = []
    const utxosToRemove = []
    const newTxs = []
    const existingTxs = []

    allTxs.forEach((txItem) => {
      const isCoinbase = txItem.vin.length === 0

      const txLogItem = {
        txId: txItem.txid,
        coinAmount: currency.ZERO,
        date: txItem.time ? new Date(txItem.time * 1000) : new Date(),
        coinName: assetName,
        confirmations: txItem.confirmations
          ? isCoinbase
            ? Math.min(COINBASE_MATURITY_HEIGHT + 1, txItem.confirmations)
            : 1
          : 0, // we don't care about a count - this should really be block height based if we want a count
        addresses: [],
        error: null,
        dropped: false,
        selfSend: false,
        data: {
          // feePerKB in satoshis, so multiply by 1e8
          feePerKB: txItem.fees ? (txItem.fees / txItem.vsize) * 1000 * 1e8 : null,
          rbfEnabled: txItem.rbf,
          blocksSeen: 0,
          ...(isCoinbase ? { isCoinbase: true } : undefined),
        },
        currencies: { [assetName]: currency },
      }

      if (this.#ordinalsEnabled) {
        txLogItem.data = {
          ...txLogItem.data,
          inscriptionsIndexed: txItem.inscriptionsIndexed,
          sentInscriptions: [],
          receivedInscriptions: [],
        }
      }

      let from = []

      // if txItem.vin has an address that matches ours, means we've spent this tx
      let isSent = false
      txItem.vin.forEach((vin) => {
        // It's an coinbase vin
        if (Object.keys(vin).length === 0) return

        vinTxids[`${vin.txid}-${vin.vout}`] = true
        from.push(vin.addr)

        const address = addrMap[vin.addr]
        if (!address) return
        // it came from us...
        txLogItem.coinAmount = txLogItem.coinAmount.sub(currency.defaultUnit(vin.value))
        isSent = true
        txLogItem.data.sent = []
        if (this.#ordinalsEnabled && vin.inscriptions) {
          txLogItem.data.sentInscriptions.push(
            ...vin.inscriptions.map((i) => ({
              ...i,
              value: currency.defaultUnit(vin.value).toBaseNumber(),
            }))
          )
        }

        // this is only used to exclude the utxos in the reducer which is why we don't care about the other fields
        utxosToRemove.push({
          address,
          txId: vin.txid,
          vout: vin.vout,
          value: currency.defaultUnit(vin.value || 0),
        })
      })

      if (isSent && ['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(asset.name)) {
        txLogItem.data.inputs = UtxoCollection.fromArray(
          txItem.vin
            .filter((vin) => addrMap[vin.addr])
            .map((vin) => ({
              address: addrMap[vin.addr],
              script: asset.address.toScriptPubKey(vin.addr).toString('hex'),
              txId: vin.txid,
              vout: vin.vout,
              value: currency.defaultUnit(vin.value || 0),
            }))
        ).toJSON()
      }

      // Fix self send tx
      const voutAddresses = compact(
        txItem.vout.map((vout) => {
          if (!vout.scriptPubKey) return
          // this is an array because legacy multisig has multiple addresses
          if (!Array.isArray(vout.scriptPubKey.addresses)) return
          if (vout.scriptPubKey.addresses.length === 0) return
          return vout.scriptPubKey.addresses[0]
        })
      )
      const isSelfSent = isSent && voutAddresses.every((v) => addrMap[v])
      if (isSelfSent) {
        txLogItem.to = voutAddresses[0]
      }

      txItem.vout.forEach((vout) => {
        if (!vout.scriptPubKey) return
        // this is an array because legacy multisig has multiple addresses
        if (!Array.isArray(vout.scriptPubKey.addresses)) return
        if (vout.scriptPubKey.addresses.length === 0) return
        const sentAddress = vout.scriptPubKey.addresses[0]
        if (!addrMap[sentAddress]) {
          if (isSent && !txLogItem.to) {
            const val = currency.defaultUnit(vout.value)
            const sentDisplayAddress = asset.address.displayAddress?.(sentAddress) || sentAddress
            txLogItem.data.sent.push({
              address: sentDisplayAddress,
              amount: val.toDefaultString({ unit: true }),
            })
          }

          return
        }

        const address = addrMap[sentAddress]
        if (isReceiveAddress(address)) {
          txLogItem.addresses.push(address)
        }

        if (isSent && isChangeAddress(address)) {
          txLogItem.data.changeAddress = address
        }

        if (this.#ordinalsEnabled && vout.inscriptions) {
          txLogItem.data.receivedInscriptions.push(
            ...vout.inscriptions.map((i) => ({
              ...i,
              value: currency.defaultUnit(vout.value).toBaseNumber(),
            }))
          )
        }

        // it was sent to us...
        const val = currency.defaultUnit(vout.value)
        txLogItem.coinAmount = txLogItem.coinAmount.add(val)

        const output = {
          address,
          txId: txItem.txid,
          vout: vout.n,
          confirmations: txLogItem.confirmations,
          script: vout.scriptPubKey.hex,
          value: val,
          rbfEnabled: txItem.rbf,
          derivationPath: address.meta.keyIdentifier?.derivationPath,
          ...(isCoinbase ? { isCoinbase: true } : undefined),
        }

        if (this.#ordinalsEnabled) {
          output.inscriptionsIndexed = txItem.inscriptionsIndexed
          output.inscriptions = vout.inscriptions || []
        }

        if (this.#shouldExcludeVoutUtxo({ asset, output, txItem, vout })) {
          utxosToRemove.push({
            address,
            txId: txItem.txid,
            vout: vout.n,
            value: currency.defaultUnit(vout.value || 0),
          })
          return
        }

        if (vout.spentTxId) return
        utxos.push(output) // but save the unspent ones for state.utxos
      })

      if (this.#asset.address.displayAddress) {
        if (txLogItem.to) {
          txLogItem.to = asset.address.displayAddress(txLogItem.to)
        }

        from = from.map(asset.address.displayAddress)
      }

      if (isSent) {
        txLogItem.feeAmount = currency.defaultUnit(txItem.fees || 0)
        txLogItem.feeCoinName = assetName
        if (isSelfSent) {
          txLogItem.selfSend = true
          txLogItem.coinAmount = currency.ZERO
        } else {
          // we want coinAmount to be without the fee
          // so far coinAmount = -vins + vouts (to us) = - (sent amount + fees)
          // add fees to get only sent amount
          txLogItem.coinAmount = txLogItem.coinAmount.add(txLogItem.feeAmount)
        }
      } else {
        txLogItem.from = from
      }

      if (currentTxs.has(txLogItem.txId) && !refresh) {
        const existingItem = currentTxs.get(txLogItem.txId)
        // we only want to detect changes when it matters - when a tx confirms
        if (
          existingItem.confirmations !== txLogItem.confirmations ||
          existingItem.selfSend !== txLogItem.selfSend ||
          existingItem.dropped
        ) {
          existingTxs.push(txLogItem)
        }

        delete unconfirmedTxsToCheck[txLogItem.txId] // we remove what we find, so we are left with what wasn't found
      } else {
        newTxs.push(txLogItem)
      }
    })

    // this protects from the server returning bad spentTxId
    utxos = utxos.filter((utxo) => {
      return !vinTxids[`${utxo.txId}-${utxo.vout}`]
    })

    let utxoCol = UtxoCollection.fromArray(utxos, { currency })

    const utxosToRemoveCol = UtxoCollection.fromArray(utxosToRemove, { currency })
    // Keep new utxos when they intersect with the stored utxos.
    utxoCol = utxoCol.union(currentStoredUtxos).difference(utxosToRemoveCol)

    for (const tx of Object.values(unconfirmedTxsToCheck)) {
      existingTxs.push({ ...tx, dropped: true }) // TODO: this will decrease the chain index, it shouldn't be an issue considering the gap limit
      utxoCol = utxoCol.difference(utxoCol.getTxIdUtxos(tx.txId))
      const utxosToAdd = []
      if (tx.data.inputs) {
        const prevUtxos = UtxoCollection.fromJSON(tx.data.inputs, { currency })
        for (const utxo of prevUtxos.toArray()) {
          if (vinTxids[`${utxo.txId}-${utxo.vout}`]) {
            // This utxo was already spent in another tx
            continue
          }

          const tx = await insightClient.fetchTx(utxo.txId)
          if (tx) {
            // previously spent tx still exists, readd utxo
            utxosToAdd.push(utxo)
          }
        }
      }

      utxoCol = utxoCol.union(UtxoCollection.fromArray(utxosToAdd, { currency }))
    }

    // no changes, ignore
    if (utxoCol.equals(currentStoredUtxos)) {
      utxoCol = null
    }

    const changedUnusedAddressIndexes = newChains.filter(({ purpose, chain }, index) => {
      const originalChain = chains[index]
      assert(originalChain, `originalChain with purpose ${purpose} not found!`)
      return !isEqual(chain, originalChain.chain)
    })

    const ordinalAddress = await this.getOrdinalAddress({ walletAccount })

    // latest account state, in case knownBalanceUtxoIds or mustAvoidUtxoIds gets updated in on another promise
    const latestAccountState = await assetClientInterface.getAccountState({
      assetName,
      walletAccount,
    })
    const utxosData = utxoCol
      ? partitionUtxos({
          allUtxos: utxoCol,
          ordinalsEnabled: this.#ordinalsEnabled,
          ordinalAddress,
          knownBalanceUtxoIds: latestAccountState.knownBalanceUtxoIds,
          mustAvoidUtxoIds: latestAccountState.mustAvoidUtxoIds,
          additionalInscriptions: latestAccountState.additionalInscriptions,
        })
      : {}

    return {
      txsToUpdate: existingTxs,
      txsToAdd: newTxs,
      ...utxosData,
      changedUnusedAddressIndexes,
    }
  }

  async rescanOnNewBlock({ walletAccount }) {
    const aci = this.#assetClientInterface
    const asset = this.#asset
    const assetName = this.#asset.name

    const accountState = await aci.getAccountState({ assetName, walletAccount })

    const storedUtxos = getUtxos({ accountState, asset })
    const storedOrdinalsUtxos = getOrdinalsUtxos({ accountState, asset })
    const allStoredUtxos = storedUtxos.union(storedOrdinalsUtxos)

    const currentTxs = [...(await aci.getTxLog({ assetName, walletAccount }))]

    const unconfirmedTxIds = uniq([
      ...storedUtxos
        .toArray()
        .filter(
          (utxos) =>
            !utxos.confirmations ||
            (utxos.isCoinbase && utxos.confirmations < COINBASE_MATURITY_HEIGHT)
        )
        .map((utxos) => utxos.txId),
      ...currentTxs
        .filter(
          (tx) =>
            !tx.dropped &&
            (!tx.confirmations ||
              (tx.data.isCoinbase && tx.confirmations < COINBASE_MATURITY_HEIGHT))
        )
        .map((tx) => tx.txId),
    ])

    const maybeConfirmationList = await Promise.all(
      unconfirmedTxIds.map(async (txId) => {
        const txStatus = await this.#insightClient.fetchTx(txId)
        if (!txStatus?.confirmations) {
          return
        }

        return { txId, confirmations: txStatus.confirmations }
      })
    )
    const confirmationsList = maybeConfirmationList.filter(Boolean)

    const updatedPropertiesTxs = currentTxs
      .map((tx) => {
        const updatedProperties = {}
        const confirmations = confirmationsList.find(({ txId }) => tx.txId === txId)?.confirmations
        if (!tx.dropped && (!tx.confirmations || tx.data.isCoinbase) && confirmations > 0) {
          updatedProperties.confirmations = Math.min(COINBASE_MATURITY_HEIGHT + 1, confirmations)
        }

        return { txId: tx.txId, ...updatedProperties }
      })
      .filter((tx) => Object.keys(tx).length > 1)

    const txConfirmedUtxos = allStoredUtxos.updateConfirmations(confirmationsList)

    const ordinalAddress = await this.getOrdinalAddress({ walletAccount })

    // latest account state, in case knownBalanceUtxoIds or mustAvoidUtxoIds gets updated in on another promise
    const latestAccountState = await aci.getAccountState({
      assetName,
      walletAccount,
    })

    const { utxos, ordinalsUtxos } = partitionUtxos({
      allUtxos: txConfirmedUtxos,
      ordinalsEnabled: this.#ordinalsEnabled,
      ordinalAddress,
      knownBalanceUtxoIds: latestAccountState.knownBalanceUtxoIds,
      mustAvoidUtxoIds: latestAccountState.mustAvoidUtxoIds,
      additionalInscriptions: latestAccountState.additionalInscriptions,
    })

    return {
      utxos: utxos.equals(storedUtxos) ? null : utxos,
      ordinalsUtxos: ordinalsUtxos.equals(storedOrdinalsUtxos) ? null : ordinalsUtxos,
      txsToUpdate: updatedPropertiesTxs,
    }
  }

  getOrdinalAddress({ walletAccount }) {
    return getOrdinalAddress({
      asset: this.#asset,
      assetClientInterface: this.#assetClientInterface,
      walletAccount,
      ordinalChainIndex: this.#ordinalChainIndex,
    })
  }
}
