// Move to shared utils...
import { UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'

import { findLargeUnconfirmedTxs } from './tx-utils.js'

const MAX_ORDINAL_VALUE_POSTAGE = 10_000

export const getInscriptionTxId = (inscriptionId) => {
  return inscriptionId.split('i')[0]
}

export function getInscriptionIds({ nft, brc20 }) {
  return nft?.tokenId ? [nft?.tokenId] : brc20 ? brc20.inscriptionIds : undefined
}

export function getTransferOrdinalsUtxos({ inscriptionIds, ordinalsUtxos }) {
  const transferOrdinalsUtxos = ordinalsUtxos.filter((utxo) =>
    utxo.inscriptions?.some((i) => inscriptionIds.includes(i.inscriptionId))
  )

  // this is for the micky mouse case. It has 2 inscriptions from the same tx but different output
  const inscriptionTxs = new Set(inscriptionIds.map(getInscriptionTxId))

  // https://ordinals.hiro.so/inscription/862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30ci0
  // https://ordinals.hiro.so/inscription/862ecd0fe343da32d19ff9277639ff71e10d894f55b6dee82dbfb9c158d5d30ci1

  const unsafeInscriptions = transferOrdinalsUtxos.toArray().flatMap(
    (utxo) =>
      utxo.inscriptions?.filter((inscription) => {
        const validInscription = isValidInscription({
          value: utxo.value.toBaseNumber(),
          offset: inscription.offset,
        })
        return (
          validInscription && !inscriptionTxs.has(getInscriptionTxId(inscription.inscriptionId))
        )
      }) || []
  )
  assert(
    unsafeInscriptions.length === 0,
    `The following inscriptions are unsafe ${unsafeInscriptions.map(
      (i) => i.inscriptionId
    )} when ${inscriptionIds} should be spent`
  )

  const transferInscriptionIds = transferOrdinalsUtxos
    .toArray()
    .flatMap((utxo) => utxo.inscriptions)
    .filter(({ inscriptionId }) => inscriptionIds.includes(inscriptionId))

  assert(
    transferInscriptionIds.length === inscriptionIds.length,
    `Expected inscriptions ${inscriptionIds.length}. Found: ${transferInscriptionIds.length}`
  )
  return transferOrdinalsUtxos
}

export function isValidInscription({ value, offset }) {
  assert(typeof value === 'number', 'value must be a number')
  assert(typeof offset === 'number', 'offset must be a number')
  // value >= 0 in case offset, alternatively convert to string/ln
  return (value >= 0 && value <= MAX_ORDINAL_VALUE_POSTAGE) || offset === 0
}

export function getUtxos({ accountState, asset }) {
  return (
    accountState?.utxos ||
    UtxoCollection.createEmpty({
      currency: asset.currency,
    })
  )
}

export function getOrdinalsUtxos({ accountState, asset }) {
  return (
    accountState?.ordinalsUtxos ||
    UtxoCollection.createEmpty({
      currency: asset.currency,
    })
  )
}

export function getValidInscriptions({ utxo }) {
  return (utxo.inscriptions || []).filter((i) =>
    isValidInscription({ value: utxo.value.toBaseNumber(), offset: i.offset })
  )
}

function isOrdinalUtxo({
  utxo,
  ordinalsEnabled,
  knownBalanceUtxoIds,
  ordinalAddress,
  mustAvoidUtxoIds,
}) {
  if (!ordinalsEnabled) {
    return false
  }

  const utxoId = `${utxo.txId}:${utxo.vout}`.toLowerCase()

  if (mustAvoidUtxoIds && mustAvoidUtxoIds.includes(utxoId)) {
    return true
  }

  if (knownBalanceUtxoIds?.includes(utxoId) && !utxo.inscriptionsIndexed) {
    return false // this allows users see and spend change balance after sending before hiro confirmation
  }

  if (!utxo.inscriptionsIndexed) {
    return true
  }

  const validInscriptions = getValidInscriptions({ utxo })
  const hasOrdinals = validInscriptions.length > 0

  if (ordinalAddress?.toString() === utxo.address.toString()) {
    // if this condition is true, that means this is taproot
    // so we always return true to ensure we accidentally don't spend an ordinal as btc
    if (!hasOrdinals) {
      console.log('Excluding utxo from btc spending:', utxo.address.toString(), utxo)
    }

    return true // assume is ordinal just in case
  }

  return hasOrdinals
}

export function mergeAdditionalInscriptions({ allUtxos, additionalInscriptions }) {
  return UtxoCollection.fromArray(
    allUtxos.toArray().map((utxo) => {
      const inscriptions = additionalInscriptions
        .filter((additionalInscription) => {
          const forUtxo =
            additionalInscription.vout === utxo.vout && additionalInscription.txId === utxo.txId
          if (forUtxo) {
            // avoid duplicated
            return !utxo.inscriptions?.find(
              (existingInscription) =>
                existingInscription.inscriptionId === additionalInscription.inscriptionId
            )
          }

          return forUtxo
        })
        .map((additionalInscription) => ({
          inscriptionId: additionalInscription.inscriptionId,
          offset: additionalInscription.offset || 0,
        }))
      if (inscriptions.length > 0) {
        // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
        utxo.inscriptions = [...(utxo.inscriptions || []), ...inscriptions]
      }

      return utxo
    }),
    {
      currency: allUtxos.currency,
    }
  )
}

export function partitionUtxos({
  allUtxos,
  ordinalsEnabled,
  knownBalanceUtxoIds,
  ordinalAddress,
  mustAvoidUtxoIds,
  additionalInscriptions,
}) {
  assert(allUtxos, 'allUtxos is required')
  if (ordinalsEnabled) assert(ordinalAddress, 'ordinalAddress is required')

  const expandedAllUtxos = ordinalsEnabled
    ? mergeAdditionalInscriptions({ allUtxos, additionalInscriptions })
    : allUtxos

  return {
    utxos: expandedAllUtxos.filter(
      (utxo) =>
        !isOrdinalUtxo({
          utxo,
          ordinalsEnabled,
          knownBalanceUtxoIds,
          ordinalAddress,
          mustAvoidUtxoIds,
        })
    ),
    ordinalsUtxos: expandedAllUtxos.filter((utxo) =>
      isOrdinalUtxo({
        utxo,
        ordinalsEnabled,
        knownBalanceUtxoIds,
        ordinalAddress,
        mustAvoidUtxoIds,
      })
    ),
  }
}

export const isUtxoConfirmed = (utxo) => utxo.confirmations > 0

export function getConfirmedUtxos({ utxos }) {
  assert(utxos, 'utxos is required')
  return utxos.filter(isUtxoConfirmed)
}

export function getUnconfirmedUtxos({ utxos }) {
  assert(utxos, 'utxos is required')
  return utxos.filter((utxo) => !isUtxoConfirmed(utxo))
}

export function getConfirmedOrRfbDisabledUtxos({ utxos, allowUnconfirmedRbfEnabledUtxos }) {
  assert(utxos, 'utxos is required')
  assert(
    allowUnconfirmedRbfEnabledUtxos !== undefined,
    'allowUnconfirmedRbfEnabledUtxos is required'
  )
  if (allowUnconfirmedRbfEnabledUtxos) {
    return utxos
  }

  return utxos.filter((utxo) => utxo.confirmations > 0 || !utxo.rbfEnabled)
}

function filterDustUtxos({ utxos, feeData }) {
  if (feeData.utxoDustValue) {
    return utxos.filter((utxo) => utxo.value.toBaseNumber() > feeData.utxoDustValue)
  }

  return utxos
}

const COINBASE_MATURITY_HEIGHT = 100

export function getUsableUtxos({
  asset,
  utxos: someCoinbaseUtxos,
  feeData,
  txSet,
  unconfirmedTxAncestor,
}) {
  assert(asset, 'asset is required')
  assert(someCoinbaseUtxos, 'utxos is required')
  assert(feeData, 'feeData is required')
  assert(txSet, 'txSet is required')

  // Filter out immature coinbase outputs. They are not spendable.
  const utxos = someCoinbaseUtxos.filter(
    (utxo) => !utxo.isCoinbase || utxo.confirmations >= COINBASE_MATURITY_HEIGHT
  )

  if (!['bitcoin', 'bitcointestnet', 'bitcoinregtest'].includes(asset.name))
    return filterDustUtxos({ utxos, feeData })

  assert(feeData.fastestFee, 'feeData.fastestFee is required')
  assert(
    typeof feeData.maxExtraCpfpFee === 'number' && !Number.isNaN(feeData.maxExtraCpfpFee),
    ' feeData.maxExtraCpfpFee must be a number'
  )

  const { fastestFee, maxExtraCpfpFee: maxFee } = feeData
  const feeRate = fastestFee.toBaseNumber()

  const largeUnconfirmedTxs = findLargeUnconfirmedTxs({
    txSet,
    feeRate,
    maxFee,
    unconfirmedTxAncestor,
  })
  const confirmedAndSmallUtxos =
    largeUnconfirmedTxs.size === 0
      ? utxos
      : utxos.filter((utxo) => !largeUnconfirmedTxs.has(utxo.txId))
  return filterDustUtxos({ utxos: confirmedAndSmallUtxos, feeData })
}
