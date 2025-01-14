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
  signHardwareFactory,
  signMessage,
  signTxFactory,
} from '@exodus/bitcoin-api'
import { parseCurrency } from '@exodus/bitcoin-api/src/fee/fee-utils.js'
import { createGetKeyIdentifier } from '@exodus/bitcoin-lib'
import * as bitcoinjsLib from '@exodus/bitcoinjs'
import { Tx } from '@exodus/models'
import _coinInfo from 'coininfo'
import assert from 'minimalistic-assert'

import { createGetSupportedPurposes, getDefaultAddressPath } from './compatibility-modes.js'
import { createCustomFeesApi } from './custom-fees.js'
import { bitcoinFeeDataFactory } from './fee-data.js'
import BitcoinFeeMonitor from './fee-monitor.js'
import { brc20BalancesAndFeeAdapterFactory } from './ordinals/brc-20-balances-and-fee-adapter.js'
import { brc20ApiClientFactory, DEFAULT_BRC_20_URL } from './ordinals/brc-20-client.js'
import { createTokenFactory } from './ordinals/create-token-factory.js'
import { inscriptionsServiceFactory } from './ordinals/inscriptions-service.js'
import { nftsApiFactory } from './ordinals/nfts.js'
import { DEFAULT_ORDINAL_CHAIN_INDEX } from './ordinals/ordinals-constants.js'
import { reloadBrc20TokenBalances } from './ordinals/reload-brc20-token-balances.js'
import { tickInscriptionIdIndexerFactory } from './ordinals/tick-inscription-id-indexer.js'
import { createWeb3API } from './web3/index.js'

const DEFAULT_TICKS_BETWEEN_BRC20_FETCHES = 30

export const createBitcoinAssetFactory =
  ({ asset, apiUrl: defaultApiUrl, coinInfoNetwork, isTestnet = false }) =>
  (
    {
      assetClientInterface,
      overrideCallback = ({ asset }) => asset,
      config: {
        apiUrl: customApiUrl,
        allowUnconfirmedRbfEnabledUtxos = false,
        ordinalChainIndex = DEFAULT_ORDINAL_CHAIN_INDEX,
        ordinalsEnabled = false,
        brc20Enabled = false,
        brc20Url = DEFAULT_BRC_20_URL,
        brc20TickInterval = DEFAULT_TICKS_BETWEEN_BRC20_FETCHES,
        gapLimit = 10,
        refreshGapLimit = 25,
        feeDataCustomValues,
        utxosDescendingOrder = false,
        omitSupportedPurposes = [],
        defaultOutputType = 'P2WSH',
        changeAddressType = 'P2WPKH',
      } = Object.create(null),
    } = Object.create(null)
  ) => {
    const apiUrl = customApiUrl || defaultApiUrl
    assert(assetClientInterface, 'assetClientInterface is required')
    assert(asset, 'asset is required')
    assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')
    assert(apiUrl, 'apiUrl is required')
    assert(
      brc20Enabled ? ordinalsEnabled : true,
      'if brc20Enabled is true then ordinalsEnabled must be true'
    )
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

    const useMultipleAddresses = true

    const features = {
      accountState: true,
      feeMonitor: true,
      feesApi: true,
      moveFunds: true,
      multipleAddresses: true,
      nfts: ordinalsEnabled,
      customTokens: brc20Enabled,
      isTestnet,
      signWithSigner: true,
      supportsCustomFees: true,
    }

    const getFeeEstimator = getFeeEstimatorFactory({
      defaultOutputType,
      addressApi: address,
    })

    const baseFeeResolver = new GetFeeResolver({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      utxosDescendingOrder,
      changeAddressType,
    })

    const feeData = bitcoinFeeDataFactory({
      currency: asset.currency,
      overrideDefaults: feeDataCustomValues,
    })

    const baseGetBalances = getBalancesFactory({
      feeData,
      getSpendableBalance: baseFeeResolver.getSpendableBalance,
      ordinalsEnabled,
    })

    const brc20Client = brc20Enabled ? brc20ApiClientFactory({ brc20Url }) : undefined
    const tickInscriptionIdIndexer = brc20Enabled
      ? tickInscriptionIdIndexerFactory({ brc20Client })
      : undefined

    const baseGetPrepareSendTx = getPrepareSendTransaction({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      ordinalsEnabled,
      utxosDescendingOrder,
      assetClientInterface,
      changeAddressType,
    })

    const baseSendTx = createAndBroadcastTXFactory({
      getFeeEstimator,
      allowUnconfirmedRbfEnabledUtxos,
      ordinalsEnabled,
      utxosDescendingOrder,
      assetClientInterface,
      changeAddressType,
    })
    const inscriptionsService = brc20Enabled
      ? inscriptionsServiceFactory({
          asset,
          network: coinInfo.toBitcoinJS(),
          ordinalChainIndex,
        })
      : undefined

    const { getFee, getBalances, getAvailableBalance, canBumpTx, getSpendableBalance, sendTx } =
      brc20Enabled
        ? brc20BalancesAndFeeAdapterFactory({
            assetClientInterface,
            inscriptionsService,
            ...baseFeeResolver,
            getBalances: baseGetBalances,
            sendTx: baseSendTx,
            tickInscriptionIdIndexer,
          })
        : {
            ...baseFeeResolver,
            getBalances: baseGetBalances,
            sendTx: baseSendTx,
          }

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
      brc20Enabled,
    })

    const nfts = ordinalsEnabled
      ? nftsApiFactory({ ordinalChainIndex, asset, assetClientInterface })
      : undefined

    const { createToken, getTokens, validateAssetId } = brc20Enabled
      ? createTokenFactory({ address, bip44, keys, getBalances }, [])
      : {}

    const createHistoryMonitor = (args) => {
      const monitor = createBitcoinMonitor({
        assetClientInterface,
        insightClient,
        ordinalsEnabled,
        ordinalChainIndex,
        apiUrl,
        gapLimit,
        refreshGapLimit,
        ...args,
      })

      if (brc20Enabled) {
        monitor.addHook('after-tick', async ({ walletAccount }) => {
          const brc20UpdateTick = monitor.tickCount[walletAccount] % brc20TickInterval === 0
          if (brc20UpdateTick) {
            const { unknownDeployInscriptionIds } = await reloadBrc20TokenBalances({
              walletAccount,
              asset,
              ordinalChainIndex,
              brc20Client,
              assetClientInterface,
              tickInscriptionIdIndexer,
            })
            if (unknownDeployInscriptionIds.length > 0) {
              monitor.emit('unknown-tokens', unknownDeployInscriptionIds)
            }
          }
        })
      }

      return monitor
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

    const getActivityTxs = ({ txs, asset }) => {
      return txs
        .flatMap((tx) => {
          if (tx.sent && Array.isArray(tx.data.sent) && tx.data.sent.length > 0) {
            const feeAmount = tx.feeAmount.div(tx.data.sent.length)
            return tx.data.sent
              .map((to, i) => {
                // Avoids using tx.update(...) because it uses lodash _.merge
                // which can be pretty slow on mobile.
                const current = tx.toJSON()
                return Tx.fromJSON({
                  ...current,
                  to: to.address,
                  data: {
                    ...current.data,
                    sentIndex: i,
                    activityIndex: i,
                  },
                  coinAmount: to.amount
                    ? parseCurrency(to.amount, asset.currency).negate()
                    : asset.currency.ZERO,
                  feeAmount,
                })
              })
              .reverse()
          }

          return tx
        })
        .filter(txLogFilter)
    }

    const createBatchTx = getCreateBatchTransaction({
      getFeeEstimator,
      assetClientInterface,
      changeAddressType,
      allowUnconfirmedRbfEnabledUtxos,
    })
    const encodeMultisigContract = createEncodeMultisigContract({ network: coinInfo.toBitcoinJS() })
    const psbtToUnsignedTx = createPsbtToUnsignedTx({ assetClientInterface, assetName: asset.name })

    const api = {
      getActivityTxs,
      addressHasHistory,
      defaultAddressPath: 'm/0/0', // deprecated
      broadcastTx: (...args) => insightClient.broadcastTx(...args),
      createFeeMonitor: (args) =>
        new BitcoinFeeMonitor({ ...args, insight: () => insightClient, assetName: asset.name }),
      createHistoryMonitor,
      customFees: createCustomFeesApi({ baseAsset: asset }),
      features,
      getDefaultAddressPath,
      getFeeData: () => feeData,
      getBalances,
      getBalanceForAddress,
      getKeyIdentifier,
      getSupportedPurposes: createGetSupportedPurposes({ omitPurposes: omitSupportedPurposes }),
      hasFeature: (feature) => !!features[feature], // @deprecated use api.features instead
      createAccountState: () => accountStateClass,
      privateKeyEncodingDefinition: { encoding: 'wif', version: [coinInfo.versions.private] },
      sendTx,
      signTx,
      signHardware,
      signMessage,
      getFee,
      moveFunds,
      nfts,
      createToken,
      getTokens,
      validateAssetId,
      web3: createWeb3API({ asset, assetClientInterface, prepareForSigning }),
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
      useMultipleAddresses,
      insightClient,
      canBumpTx,
      getAvailableBalance,
      getSpendableBalance,
      inscriptions: inscriptionsService,
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
        brc20Enabled,
        brc20Url,
        brc20TickInterval,
        gapLimit,
        refreshGapLimit,
        feeDataCustomValues,
        utxosDescendingOrder,
        omitSupportedPurposes,
        defaultOutputType,
        changeAddressType,
      },
      insightClient,
    })
  }
