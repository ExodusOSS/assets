import { getTxSequence } from '@exodus/bitcoin-lib'
import * as defaultBitcoinjsLib from '@exodus/bitcoinjs'
import { Address, UtxoCollection } from '@exodus/models'
import { retry } from '@exodus/simple-retry'
import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { getChangeDustValue } from '../dust.js'
import { parseCurrency, serializeCurrency } from '../fee/fee-utils.js'
import { selectUtxos } from '../fee/utxo-selector.js'
import { findUnconfirmedSentRbfTxs } from '../tx-utils.js'
import { getUnconfirmedTxAncestorMap } from '../unconfirmed-ancestor-data.js'
import {
  getInscriptionIds,
  getOrdinalsUtxos,
  getTransferOrdinalsUtxos,
  getUsableUtxos,
  getUtxos,
} from '../utxos-utils.js'
import {
  createInputs as dogecoinCreateInputs,
  createOutput as dogecoinCreateOutput,
} from './dogecoin.js'

const ASSETS_SUPPORTED_BIP_174 = new Set([
  'bitcoin',
  'bitcoinregtest',
  'bitcointestnet',
  'litecoin',
  'dash',
  'dogecoin',
  'ravencoin',
  'digibyte',
  'qtumignition',
  'vertcoin', // is not available on mobile!
])

const ASSETS_USING_BUFFER_VALUES = new Set(['dogecoin', 'digibyte'])

export async function getNonWitnessTxs(asset, utxos, insightClient) {
  const rawTxs = []

  // BIP 174 (PSBT) requires full transaction for non-witness outputs
  if (ASSETS_SUPPORTED_BIP_174.has(asset.name)) {
    const nonWitnessTxIds = utxos.txIds.filter((txId) =>
      utxos
        .getAddressesForTxId(txId)
        .toAddressStrings()
        .some(
          (a) =>
            asset.address.isP2PKH(a) ||
            asset.address.isP2SH(a) ||
            asset.address.isP2SH2?.(a) ||
            asset.address.isP2WPKH?.(a) ||
            asset.address.isP2WSH?.(a)
        )
    )

    if (nonWitnessTxIds.length > 0) {
      for (const txId of nonWitnessTxIds) {
        // full transaction is required for non-witness outputs
        const rawData = await insightClient.fetchRawTx(txId)
        rawTxs.push({ txId, rawData })
      }
    }
  }

  return rawTxs
}

const getSize = (tx) => {
  if (typeof tx.size === 'number') return tx.size
  if (typeof tx.virtualSize === 'function') {
    return tx.virtualSize()
  }

  if (typeof tx.virtualSize === 'number') {
    return tx.virtualSize
  }
}

export const getSizeAndChangeScriptFactory =
  ({ bitcoinjsLib = defaultBitcoinjsLib } = {}) =>
  ({ assetName, tx, rawTx, changeUtxoIndex, txId }) => {
    assert(assetName, 'assetName is required')
    assert(rawTx, 'rawTx is required')
    assert(typeof changeUtxoIndex === 'number', 'changeUtxoIndex must be a number')

    if (tx) {
      return {
        script: tx.outs?.[changeUtxoIndex]?.script.toString('hex'),
        size: getSize(tx),
      }
    }

    // Trezor doesn't return tx!! we need to reparse it!
    const parsedTx = bitcoinjsLib.Transaction.fromBuffer(Buffer.from(rawTx, 'hex'))
    try {
      return {
        script: parsedTx.outs?.[changeUtxoIndex]?.script.toString('hex'),
        size: getSize(parsedTx),
      }
    } catch (e) {
      console.warn(
        `tx-send warning: ${assetName} cannot extract script and size from tx ${txId}. ${e}`
      )
      return {}
    }
  }

/**
 * Signs a transaction using the provided asset client interface.
 *
 * @async
 * @function signTransaction
 * @param {Object} assetClientInterface - The asset client interface to use for signing the transaction.
 * @param {string} assetName - The name of the asset.
 * @param {Object} unsignedTx - The unsigned transaction to sign.
 * @param {Object} walletAccount - The wallet account to use for signing.
 * @returns {Promise<Object>} An object containing the signed raw transaction, transaction ID, and the signed transaction.
 * @throws {Error} Throws an error if signing the transaction fails.
 *
 * @example
 * // Example usage:
 * const { rawTx, txId, tx } = await signTransaction({assetClientInterface, assetName, unsignedTx, walletAccount});
 * // rawTx: Buffer data representing the signed raw transaction
 * // txId: The ID of the signed transaction
 * // tx: An object representing the signed transaction, containing virtualSize and outs
 * // Example returned object:
 * {
 *    rawTx: {
 *        type: "Buffer",
 *        data: [
 *            2,
 *            ...
 *        ]
 *    },
 *    txId: "35244fba5cc46d6f3773689dce11ddba3f341149ef627c051e1a0bacd9458a1c",
 *    tx: {
 *        virtualSize: 110,
 *        outs: [
 *            {
 *                script: "0014c06da7c31e24ba4e7a0656443e17c00572a3e9f7"
 *            }
 *        ]
 *    }
 * }
 */
export async function signTransaction({
  assetClientInterface,
  assetName,
  unsignedTx,
  walletAccount,
}) {
  const { rawTx, txId, tx } = await assetClientInterface.signTransaction({
    assetName,
    unsignedTx,
    walletAccount,
  })
  return { rawTx, txId, tx }
}

async function createUnsignedTx({
  inputs,
  outputs,
  useCashAddress,
  addressPathsMap,
  blockHeight,
  asset,
  selectedUtxos,
  insightClient,
}) {
  const unsignedTx = {
    txData: {
      inputs,
      outputs,
    },
    txMeta: {
      useCashAddress, // for trezor to show the receiver cash address
      addressPathsMap,
      blockHeight,
    },
  }

  const nonWitnessTxs = await getNonWitnessTxs(asset, selectedUtxos, insightClient)
  Object.assign(unsignedTx.txMeta, { rawTxs: nonWitnessTxs })
  return unsignedTx
}

async function getBlockHeight({ assetName, insightClient }) {
  return ['zcash', 'bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(assetName)
    ? insightClient.fetchBlockHeight()
    : 0
}

export const getPrepareSendTransaction =
  ({
    blockHeight: providedBlockHeight,
    ordinalsEnabled,
    getFeeEstimator,
    allowUnconfirmedRbfEnabledUtxos,
    utxosDescendingOrder,
    rbfEnabled: providedRbfEnabled,
    assetClientInterface,
    changeAddressType,
  }) =>
  async ({ asset, walletAccount, address, amount, options }) => {
    const {
      multipleAddressesEnabled,
      feePerKB,
      customFee,
      isSendAll,
      bumpTxId,
      nft,
      isExchange,
      isBip70,
      isRbfAllowed,
      taprootInputWitnessSize,
    } = options

    const assetName = asset.name
    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })
    const feeData = await assetClientInterface.getFeeConfig({ assetName })
    feeData.feePerKB = feePerKB ?? feeData.feePerKB
    const insightClient = asset.baseAsset.insightClient

    const blockHeight = providedBlockHeight || (await getBlockHeight({ assetName, insightClient }))

    const rbfEnabled =
      providedRbfEnabled || (feeData.rbfEnabled && !isExchange && !isBip70 && isRbfAllowed && !nft)

    const inscriptionIds = getInscriptionIds({ nft })

    assert(
      ordinalsEnabled || !inscriptionIds,
      'inscriptions cannot be sent when ordinalsEnabled=false '
    )

    const shuffle = (list) => {
      // Using full lodash.shuffle notation so it can be mocked with spyOn in tests
      return inscriptionIds ? list : lodash.shuffle(list) // don't shuffle when sending ordinal!!!!
    }

    assert(
      assetClientInterface,
      `assetClientInterface must be supplied in sendTx for ${asset.name}`
    )
    assert(
      address || bumpTxId,
      'should not be called without either a receiving address or to bump a tx'
    )

    if (inscriptionIds) {
      assert(!bumpTxId, 'only inscriptionIds or bumpTxId must be provided')
      assert(address, 'address must be provided when sending ordinals')
    }

    const useCashAddress = asset.address.isCashAddress?.(address)

    const changeAddress = multipleAddressesEnabled
      ? await assetClientInterface.getNextChangeAddress({ assetName, walletAccount })
      : await assetClientInterface.getReceiveAddressObject({ assetName, walletAccount })

    const txSet = await assetClientInterface.getTxLog({ assetName, walletAccount })

    const currentOrdinalsUtxos = getOrdinalsUtxos({ accountState, asset })
    const transferOrdinalsUtxos = inscriptionIds
      ? getTransferOrdinalsUtxos({ inscriptionIds, ordinalsUtxos: currentOrdinalsUtxos })
      : undefined

    const currency = asset.currency

    const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({ accountState })
    const usableUtxos = getUsableUtxos({
      asset,
      utxos: getUtxos({ accountState, asset }),
      feeData,
      txSet,
      unconfirmedTxAncestor,
    })

    let replaceableTxs = findUnconfirmedSentRbfTxs(txSet)

    if (asset.address.toLegacyAddress) {
      address = asset.address.toLegacyAddress(address)
    }

    if (assetName === 'digibyte' && asset.address.isP2SH2(address)) {
      address = asset.address.P2SH2ToP2SH(address)
    }

    let utxosToBump
    if (bumpTxId) {
      const bumpTx = replaceableTxs.find(({ txId }) => txId === bumpTxId)
      if (bumpTx) {
        replaceableTxs = [bumpTx]
      } else {
        utxosToBump = usableUtxos.getTxIdUtxos(bumpTxId)
        if (utxosToBump.size === 0) {
          throw new Error(`Cannot bump transaction ${bumpTxId}`)
        }

        replaceableTxs = []
      }
    }

    const sendAmount = bumpTxId || transferOrdinalsUtxos ? asset.currency.ZERO : amount
    const receiveAddress = bumpTxId
      ? replaceableTxs.length > 0
        ? null
        : changeAddressType
      : address
    const feeRate = feeData.feePerKB
    const resolvedIsSendAll = (!rbfEnabled && feePerKB) || transferOrdinalsUtxos ? false : isSendAll

    let { selectedUtxos, fee, replaceTx } = selectUtxos({
      asset,
      usableUtxos,
      replaceableTxs,
      amount: sendAmount,
      feeRate: customFee || feeRate,
      receiveAddress,
      isSendAll: resolvedIsSendAll,
      getFeeEstimator: (asset, { feePerKB, ...options }) =>
        getFeeEstimator(asset, feePerKB, options),
      mustSpendUtxos: utxosToBump,
      allowUnconfirmedRbfEnabledUtxos,
      unconfirmedTxAncestor,
      inscriptionIds,
      transferOrdinalsUtxos,
      utxosDescendingOrder,
      taprootInputWitnessSize,
      changeAddressType,
    })

    if (!selectedUtxos && !replaceTx) throw new Error('Not enough funds.')

    // When bumping a tx, we can either replace the tx with RBF or spend its selected change.
    // If there is no selected UTXO or the tx to replace is not the tx we want to bump,
    // then something is wrong because we can't actually bump the tx.
    // This shouldn't happen but might due to either the tx confirming before accelerate was
    // pressed, or if the change was already spent from another wallet.
    if (bumpTxId && (!selectedUtxos || (replaceTx && replaceTx.txId !== bumpTxId))) {
      throw new Error(`Unable to bump ${bumpTxId}`)
    }

    if (replaceTx) {
      replaceTx = replaceTx.clone()
      replaceTx = replaceTx.update({ data: { ...replaceTx.data } })
      replaceTx.data.sent = replaceTx.data.sent.map((to) => {
        return { ...to, amount: serializeCurrency(to.amount, asset.currency) }
      })
      selectedUtxos = selectedUtxos.union(
        // how to avoid replace tx inputs when inputs are ordinals? !!!!
        UtxoCollection.fromJSON(replaceTx.data.inputs, { currency: asset.currency })
      )
    }

    const addressPathsMap = selectedUtxos.getAddressPathsMap()

    // Inputs and Outputs
    const inputs = shuffle(createInputs(assetName, selectedUtxos.toArray(), rbfEnabled))
    let outputs = replaceTx
      ? replaceTx.data.sent.map(({ address, amount }) =>
          createOutput(assetName, address, parseCurrency(amount, currency))
        )
      : []

    // Send output
    let sendOutput
    if (address) {
      if (transferOrdinalsUtxos) {
        outputs.push(
          ...transferOrdinalsUtxos
            .toArray()
            .map((ordinalUtxo) => createOutput(assetName, address, ordinalUtxo.value))
        )
      } else {
        sendOutput = createOutput(assetName, address, sendAmount)
        outputs.push(sendOutput)
      }
    }

    const totalAmount = replaceTx
      ? replaceTx.data.sent.reduce(
          (total, { amount }) => total.add(parseCurrency(amount, asset.currency)),
          sendAmount
        )
      : sendAmount

    const change = selectedUtxos.value
      .sub(totalAmount)
      .sub(transferOrdinalsUtxos?.value || currency.ZERO)
      .sub(fee)
    const dust = getChangeDustValue(asset)
    let ourAddress = replaceTx?.data?.changeAddress || changeAddress
    if (asset.address.toLegacyAddress) {
      const legacyAddress = asset.address.toLegacyAddress(ourAddress.address)
      ourAddress = Address.create(legacyAddress, ourAddress.meta)
    }

    // Change Output
    let changeOutput
    if (change.gte(dust)) {
      changeOutput = createOutput(assetName, ourAddress.address ?? ourAddress.toString(), change)
      // Add the keypath of change address to support Trezor detect the change output.
      // Output is change and does not need approval from user which shows the strange address that user never seen.
      addressPathsMap[changeAddress] = ourAddress.meta.path
      outputs.push(changeOutput)
    } else {
      // If we don't have enough for a change output, then all remaining dust is just added to fee
      fee = fee.add(change)
    }

    outputs = replaceTx ? outputs : shuffle(outputs)

    const unsignedTx = await createUnsignedTx({
      inputs,
      outputs,
      useCashAddress,
      addressPathsMap,
      blockHeight,
      asset,
      selectedUtxos,
      insightClient,
    })
    return {
      amount,
      change,
      totalAmount,
      currentOrdinalsUtxos,
      inscriptionIds,
      address,
      ourAddress,
      receiveAddress,
      sendAmount,
      fee,
      usableUtxos,
      selectedUtxos,
      transferOrdinalsUtxos,
      replaceTx,
      sendOutput,
      changeOutput,
      unsignedTx,
    }
  }

// not ported from Exodus; but this demos signing / broadcasting
// NOTE: this will be ripped out in the coming weeks
export const createAndBroadcastTXFactory =
  ({
    getFeeEstimator,
    getSizeAndChangeScript = getSizeAndChangeScriptFactory(), // for decred customizations
    allowUnconfirmedRbfEnabledUtxos,
    ordinalsEnabled = false,
    utxosDescendingOrder,
    assetClientInterface,
    changeAddressType,
  }) =>
  async ({ asset, walletAccount, address, amount, options }) => {
    // Prepare transaction
    const { bumpTxId, nft, isExchange, isBip70, isRbfAllowed = true } = options

    const assetName = asset.name
    const feeData = await assetClientInterface.getFeeConfig({ assetName })
    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })
    const insightClient = asset.baseAsset.insightClient

    const rbfEnabled = feeData.rbfEnabled && !isExchange && !isBip70 && isRbfAllowed && !nft

    // blockHeight
    const blockHeight = await getBlockHeight({ assetName, insightClient })

    const transactionDescriptor = await getPrepareSendTransaction({
      blockHeight,
      ordinalsEnabled,
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      utxosDescendingOrder,
      rbfEnabled,
      assetClientInterface,
      changeAddressType,
    })({ asset, walletAccount, address, amount, options })
    const {
      change,
      totalAmount,
      currentOrdinalsUtxos,
      inscriptionIds,
      ourAddress,
      receiveAddress,
      sendAmount,
      fee,
      usableUtxos,
      selectedUtxos,
      transferOrdinalsUtxos,
      replaceTx,
      sendOutput,
      changeOutput,
      unsignedTx,
    } = transactionDescriptor
    const outputs = unsignedTx.txData.outputs

    address = transactionDescriptor.address

    // Sign transaction
    const { rawTx, txId, tx } = await signTransaction({
      assetClientInterface,
      assetName,
      unsignedTx,
      walletAccount,
    })

    // Broadcast transaction
    const broadcastTxWithRetry = retry(
      async (rawTx) => {
        try {
          return await asset.api.broadcastTx(rawTx)
        } catch (e) {
          if (
            /missing inputs/i.test(e.message) ||
            /absurdly-high-fee/.test(e.message) ||
            /too-long-mempool-chain/.test(e.message) ||
            /txn-mempool-conflict/.test(e.message) ||
            /tx-size/.test(e.message) ||
            /txn-already-in-mempool/.test(e.message)
          ) {
            e.finalError = true
          }

          throw e
        }
      },
      { delayTimesMs: ['10s'] }
    )

    try {
      await broadcastTxWithRetry(rawTx.toString('hex'))
    } catch (err) {
      if (err.message.includes('txn-already-in-mempool')) {
        // It's not an error, we must ignore it.
        console.log('Transaction is already in the mempool.')
      } else if (/insight broadcast http error.*missing inputs/i.test(err.message)) {
        err.txInfo = JSON.stringify({
          amount: sendAmount.toDefaultString({ unit: true }),
          fee: ((fee && fee.toDefaultString({ unit: true })) || 0).toString(), // todo why does 0 not have a unit? Is default unit ok here?
          allUtxos: usableUtxos.toJSON(),
        })
        throw err
      } else {
        throw err
      }
    }

    function findUtxoIndex(output) {
      let utxoIndex = -1
      if (output) {
        for (const [i, [address, amount]] of outputs.entries()) {
          if (output[0] === address && output[1] === amount) {
            utxoIndex = i
            break
          }
        }
      }

      return utxoIndex
    }

    const changeUtxoIndex = findUtxoIndex(changeOutput)
    const sendUtxoIndex = findUtxoIndex(sendOutput)

    const { script, size } = getSizeAndChangeScript({ assetName, tx, rawTx, changeUtxoIndex, txId })

    // for ordinals, used to allow users spending change utxos even when unconfirmed and ordinals are unknown
    const knownBalanceUtxoIds = accountState.knownBalanceUtxoIds || []
    let remainingUtxos = usableUtxos.difference(selectedUtxos)
    if (changeUtxoIndex !== -1) {
      const address = Address.create(ourAddress.address, ourAddress.meta)
      const changeUtxo = {
        txId,
        address,
        vout: changeUtxoIndex,
        script,
        value: change,
        confirmations: 0,
        rbfEnabled,
      }

      knownBalanceUtxoIds.push(`${changeUtxo.txId}:${changeUtxo.vout}`.toLowerCase())
      remainingUtxos = remainingUtxos.addUtxo(changeUtxo)
    }

    if (replaceTx) {
      remainingUtxos = remainingUtxos.difference(remainingUtxos.getTxIdUtxos(replaceTx.txId))
    }

    const remainingOrdinalsUtxos = transferOrdinalsUtxos
      ? currentOrdinalsUtxos.difference(transferOrdinalsUtxos)
      : currentOrdinalsUtxos

    await assetClientInterface.updateAccountState({
      assetName,
      walletAccount,
      newData: {
        utxos: remainingUtxos,
        ordinalsUtxos: remainingOrdinalsUtxos,
        knownBalanceUtxoIds,
      },
    })

    const config = await assetClientInterface.getAssetConfig?.({
      assetName,
      walletAccount,
    })
    const walletAddressObjects = await assetClientInterface.getReceiveAddresses({
      walletAccount,
      assetName,
      multiAddressMode: config?.multiAddressMode ?? true,
    })
    // There are two cases of bumping, replacing or chaining a self-send.
    // If we have a bumpTxId, but we aren't replacing, then it is a self-send.
    const selfSend = bumpTxId
      ? !replaceTx
      : walletAddressObjects.some((receiveAddress) => String(receiveAddress) === String(address))

    const displayReceiveAddress = asset.address.displayAddress?.(receiveAddress) || receiveAddress

    const receivers = bumpTxId
      ? replaceTx
        ? replaceTx.data.sent
        : []
      : replaceTx
        ? [
            ...replaceTx.data.sent,
            { address: displayReceiveAddress, amount: serializeCurrency(amount, asset.currency) },
          ]
        : [{ address: displayReceiveAddress, amount: serializeCurrency(amount, asset.currency) }]

    const calculateCoinAmount = () => {
      if (selfSend) {
        return asset.currency.ZERO
      }

      if (nft) {
        return transferOrdinalsUtxos.value.abs().negate()
      }

      return totalAmount.abs().negate()
    }

    const coinAmount = calculateCoinAmount()

    await assetClientInterface.updateTxLogAndNotify({
      assetName: asset.name,
      walletAccount,
      txs: [
        {
          txId,
          confirmations: 0,
          coinAmount,
          coinName: asset.name,
          feeAmount: fee,
          feeCoinName: assetName,
          selfSend,
          data: {
            sent: selfSend ? [] : receivers,
            rbfEnabled,
            feePerKB: size ? fee.div(size / 1000).toBaseNumber() : undefined,
            changeAddress: changeOutput ? ourAddress : undefined,
            blockHeight,
            blocksSeen: 0,
            inputs: selectedUtxos.toJSON(),
            replacedTxId: replaceTx ? replaceTx.txId : undefined,
            nftId: nft ? `${assetName}:${nft.tokenId}` : undefined, // it allows BE to load the nft info while the nft is in transit
            inscriptionsIndexed: ordinalsEnabled ? true : undefined,
            sentInscriptions: inscriptionIds
              ? inscriptionIds.map((inscriptionId) => {
                  return {
                    inscriptionId,
                    offset: 0,
                    value: 0,
                  }
                })
              : undefined,
          },
        },
      ],
    })

    // If we are replacing the tx, add the replacedBy info to the previous tx to update UI
    // Also, clone the personal note and attach it to the new tx so it is not lost
    if (replaceTx) {
      replaceTx.data.replacedBy = txId
      await assetClientInterface.updateTxLogAndNotify({
        assetName,
        walletAccount,
        txs: [replaceTx],
      })
    }

    return {
      txId,
      sendUtxoIndex,
      sendAmount: sendAmount.toBaseNumber(),
      replacedTxId: replaceTx?.txId,
    }
  }

export function createInputs(assetName, ...rest) {
  if (ASSETS_USING_BUFFER_VALUES.has(assetName)) {
    return dogecoinCreateInputs(...rest)
  }

  return defaultCreateInputs(...rest)
}

function defaultCreateInputs(utxos, rbfEnabled) {
  return utxos.map((utxo) => ({
    txId: utxo.txId,
    vout: utxo.vout,
    address: utxo.address.toString(),
    value: parseInt(utxo.value.toBaseString(), 10),
    script: utxo.script,
    sequence: getTxSequence(rbfEnabled),
    inscriptionId: utxo.inscriptionId,
    derivationPath: utxo.derivationPath,
  }))
}

export function createOutput(assetName, ...rest) {
  if (ASSETS_USING_BUFFER_VALUES.has(assetName)) {
    return dogecoinCreateOutput(...rest)
  }

  return defaultCreateOutput(...rest)
}

function defaultCreateOutput(address, sendAmount) {
  return [address, parseInt(sendAmount.toBaseString(), 10)]
}

// back compatibiliy
export { getSendDustValue as getDustValue } from '../dust.js'
