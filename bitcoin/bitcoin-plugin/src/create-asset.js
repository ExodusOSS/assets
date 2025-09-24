import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import {
  createAccountState,
  createAndBroadcastTXFactory,
  createBitcoinMonitor,
  createBtcLikeAddress,
  createBtcLikeKeys,
  createEncodeMultisigContract,
  createPrepareForSigning,
  createPsbtToUnsignedTx,
  getActivityTxs as getActivityTxsBase,
  getAddressesFromPrivateKeyFactory,
  getBalancesFactory,
  getBtcVersions,
  getCreateBatchTransaction,
  getFeeEstimatorFactory,
  GetFeeResolver,
  getPrepareSendTransaction,
  InsightAPIClient,
  isValidInscription,
  moveFundsFactory,
  sendValidations,
  signHardwareFactory,
  signMessage,
  signMessageWithSigner,
  signTxFactory,
} from '@exodus/bitcoin-api'
import { createGetKeyIdentifier } from '@exodus/bitcoin-lib'
import * as bitcoinjsLib from '@exodus/bitcoinjs'
import _coinInfo from 'coininfo'
import assert from 'minimalistic-assert'

import { createGetSupportedPurposes, getDefaultAddressPath } from './compatibility-modes.js'
import { createCustomFeesApi } from './custom-fees.js'
import { bitcoinFeeDataFactory } from './fee-data.js'
import BitcoinFeeMonitor from './fee-monitor.js'
import { nftsApiFactory } from './ordinals/nfts.js'
import { DEFAULT_ORDINAL_CHAIN_INDEX } from './ordinals/ordinals-constants.js'
import { createWeb3API } from './web3/index.js'

export const createBitcoinAssetFactory =
  ({ asset, apiUrl: defaultApiUrl, coinInfoNetwork, isTestnet = false }) =>
  ({
    assetClientInterface,
    overrideCallback = ({ asset }) => asset,
    config: {
      apiUrl: customApiUrl,
      allowUnconfirmedRbfEnabledUtxos = false,
      ordinalChainIndex = DEFAULT_ORDINAL_CHAIN_INDEX,
      ordinalsEnabled = false,
      gapLimit = 10,
      refreshGapLimit = 25,
      feeDataCustomValues,
      utxosDescendingOrder = false,
      omitSupportedPurposes = [],
      defaultOutputType = 'P2WSH',
      changeAddressType = 'P2WPKH',
    } = Object.create(null),
  }) => {
    const apiUrl = customApiUrl || defaultApiUrl
    assert(assetClientInterface, 'assetClientInterface is required')
    assert(asset, 'asset is required')
    assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')
    assert(apiUrl, 'apiUrl is required')

    const multipleAddresses = true // Indicates multiple addresses are supported. This is not configurable as it also affects address derivation.

    const coinInfo = _coinInfo(coinInfoNetwork || asset.name)

    const insightClient = new InsightAPIClient(apiUrl)

    if (customApiUrl) insightClient.setBaseUrl = () => {} // not let the configuration override url when providing a custom one

    const useBip84 = true
    const useBip86 = true

    const versions = getBtcVersions(coinInfo)
    const address = createBtcLikeAddress({
      versions,
      coinInfo,
      useBip86,
      bitcoinjsLib,
    })

    const keys = createBtcLikeKeys({ coinInfo, versions, useBip86 })
    const bip44 = bip44Constants['BTC']

    const allowedPurposes = [44, 49, 84, 86]

    const features = {
      accountState: true,
      feeMonitor: true,
      feesApi: true,
      moveFunds: true,
      multipleAddresses,
      nfts: ordinalsEnabled,
      isTestnet,
      signWithSigner: true,
      signMessageWithSigner: true,
      supportsCustomFees: true,
      balancesRequireFeeData: true,
    }

    const getFeeEstimator = getFeeEstimatorFactory({
      defaultOutputType,
      addressApi: address,
    })

    const { getFee, canBumpTx } = new GetFeeResolver({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      utxosDescendingOrder,
      changeAddressType,
    })

    const feeData = bitcoinFeeDataFactory({
      currency: asset.currency,
      overrideDefaults: feeDataCustomValues,
    })

    const getBalances = getBalancesFactory({ feeData, allowUnconfirmedRbfEnabledUtxos })

    const baseGetPrepareSendTx = getPrepareSendTransaction({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      ordinalsEnabled,
      utxosDescendingOrder,
      assetClientInterface,
      changeAddressType,
    })

    const sendTx = createAndBroadcastTXFactory({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      ordinalsEnabled,
      utxosDescendingOrder,
      assetClientInterface,
      changeAddressType,
    })

    const prepareForSigning = createPrepareForSigning({
      assetName: asset.name,
      resolvePurpose: address.resolvePurpose,
      coinInfo,
    })

    const getKeyIdentifier = createGetKeyIdentifier({
      bip44,
      allowedPurposes,
      allowedChainIndices: [0, 1, 2],
      assetName: asset.name,
    })

    const signTx = signTxFactory({
      assetName: asset.name,
      resolvePurpose: address.resolvePurpose,
      coinInfo,
      getKeyIdentifier,
    })

    const signHardware = signHardwareFactory({
      assetName: asset.name,
      resolvePurpose: address.resolvePurpose,
      keys,
      coinInfo,
    })

    const moveFunds = moveFundsFactory({
      asset,
      insightClient,
      getFeeEstimator,
      address,
      signTx,
      getAddressesFromPrivateKey: getAddressesFromPrivateKeyFactory({
        purposes: allowedPurposes,
        keys,
        coinInfo,
      }),
    })

    const accountStateClass = createAccountState({
      asset,
      ordinalsEnabled,
    })

    const nfts = ordinalsEnabled
      ? nftsApiFactory({ ordinalChainIndex, asset, assetClientInterface })
      : undefined

    const createHistoryMonitor = (args) => {
      return createBitcoinMonitor({
        assetClientInterface,
        insightClient,
        ordinalsEnabled,
        ordinalChainIndex,
        apiUrl,
        gapLimit,
        refreshGapLimit,
        ...args,
      })
    }

    const addressHasHistory = async (address) => {
      assert(typeof address === 'string', 'Address is required')
      const result = await insightClient.fetchTxData([address], { from: 0, to: 1 })
      return !!result?.items.length
    }

    const getBalanceForAddress = async (address) => {
      assert(typeof address === 'string', 'Address is required')
      const { balance } = await insightClient.fetchBalance(address)
      return asset.currency.defaultUnit(balance)
    }

    const isOrdinalTx = (tx) => {
      if (!ordinalsEnabled || tx.coinName !== asset.name) {
        return false
      }

      if (!tx.data.inscriptionsIndexed) {
        return false // allows users seeing the pending tx because we don't know yet if it is ordinals or btc
      }

      return (
        tx.data.receivedInscriptions?.some(isValidInscription) ||
        tx.data.sentInscriptions?.some(isValidInscription)
      )
    }

    const txLogFilter = (tx) => {
      const isDroppedBitcoinTx = tx.dropped
      const isWaitingRbf = tx.data && tx.data.replacedBy && tx.pending
      return !isDroppedBitcoinTx && !isWaitingRbf && !isOrdinalTx(tx)
    }

    const getActivityTxs = ({ txs, asset }) =>
      getActivityTxsBase({ txs, asset }).filter(txLogFilter)

    const createBatchTx = getCreateBatchTransaction({
      getFeeEstimator,
      assetClientInterface,
      changeAddressType,
      allowUnconfirmedRbfEnabledUtxos,
    })
    const encodeMultisigContract = createEncodeMultisigContract({ network: coinInfo.toBitcoinJS() })
    const psbtToUnsignedTx = createPsbtToUnsignedTx({ assetClientInterface, assetName: asset.name })

    const signMessageApi = ({ privateKey, signer, message }) =>
      signer ? signMessageWithSigner({ signer, message }) : signMessage({ privateKey, message })
    const web3 = createWeb3API({
      assetClientInterface,
      baseAssetName: asset.name,
      currency: asset.currency,
      insightClient,
      prepareForSigning,
    })
    const createFeeMonitor = (args) =>
      new BitcoinFeeMonitor({ ...args, insight: () => insightClient, assetName: asset.name })

    const api = {
      addressHasHistory,
      broadcastTx: (...args) => insightClient.broadcastTx(...args),
      createAccountState: () => accountStateClass,
      createFeeMonitor,
      createHistoryMonitor,
      customFees: createCustomFeesApi({ baseAsset: asset, feeData }),
      defaultAddressPath: 'm/0/0', // deprecated
      features,
      getActivityTxs,
      getBalanceForAddress,
      getBalances,
      getDefaultAddressPath,
      getFee,
      getFeeData: () => feeData,
      getKeyIdentifier,
      getSendValidations: () => sendValidations,
      getSupportedPurposes: createGetSupportedPurposes({ omitPurposes: omitSupportedPurposes }),
      hasFeature: (feature) => !!features[feature], // @deprecated use api.features instead
      moveFunds,
      nfts,
      privateKeyEncodingDefinition: { encoding: 'wif', version: [coinInfo.versions.private] },
      sendTx,
      signHardware,
      signMessage: signMessageApi,
      signTx,
      web3,
    }

    const fullAsset = {
      ...asset,
      address,
      api,
      bip44,
      coinInfo,
      keys,
      useBip84,
      useBip86,
      useMultipleAddresses: multipleAddresses, // @deprecated use api.features.multipleAddresses instead
      insightClient,
      canBumpTx,
      prepareSendTx: baseGetPrepareSendTx,
      createBatchTx,
      encodeMultisigContract,
      psbtToUnsignedTx,
    }

    return overrideCallback({
      asset: fullAsset,
      config: {
        apiUrl: customApiUrl || defaultApiUrl,
        allowUnconfirmedRbfEnabledUtxos,
        ordinalChainIndex,
        ordinalsEnabled,
        gapLimit,
        refreshGapLimit,
        feeDataCustomValues,
        utxosDescendingOrder,
        omitSupportedPurposes,
        defaultOutputType,
        changeAddressType,
        multipleAddresses,
      },
      insightClient,
    })
  }
