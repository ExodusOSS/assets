import { connectAssetsList } from '@exodus/assets'
import bip44Constants from '@exodus/bip44-constants/by-ticker.js'
import {
  createAccountState,
  createAndBroadcastTXFactory,
  getBalancesFactory,
  getFeeAsyncFactory,
  isSolanaRewardsActivityTx,
  SolanaMonitor,
} from '@exodus/solana-api'
import {
  createFeeData,
  createGetKeyIdentifier,
  getAddressFromPublicKey,
  getEncodedSecretKey,
  isValidAddress,
  prepareForSigning,
  signHardware,
  signMessageNew,
  signMessageWithSigner,
  signUnsignedTx,
  signUnsignedTxWithSigner,
} from '@exodus/solana-lib'
import ms from 'ms'

import { createGetBalanceForAddress } from './get-balance-for-address.js'
import sendValidationsFactory from './send-validations.js'
import { createWeb3API } from './web3/index.js'

const DEFAULT_ACCOUNT_RESERVE = 0
const DEFAULT_LOW_BALANCE = 0.01
const DEFAULT_MIN_STAKING_AMOUNT = 0.01

export const createSolanaAssetFactory =
  ({ assetList, serverApi, isTestnet = false }) =>
  ({
    assetClientInterface,
    config: {
      stakingFeatureAvailable = true,
      includeUnparsed = false,
      allowSendingAll = true,
      monitorInterval = ms('30s'),
      shouldUpdateBalanceBeforeHistory = true,
      defaultAccountReserve = DEFAULT_ACCOUNT_RESERVE,
      defaultLowBalance = DEFAULT_LOW_BALANCE,
      defaultMinStakingAmount = DEFAULT_MIN_STAKING_AMOUNT,
      ticksBetweenHistoryFetches,
      ticksBetweenStakeFetches,
      txsLimit,
      signWithSigner = true,
      feePayerApiUrl,
    } = {},
    overrideCallback = ({ asset }) => asset,
  } = {}) => {
    const assets = connectAssetsList(assetList)

    const { name: baseAssetName } = assetList.find((asset) => asset.baseAssetName === asset.name)
    const base = assets[baseAssetName]

    const smallTxAmount = base.currency.defaultUnit('0.00005')
    const accountReserve = base.currency.defaultUnit(
      defaultAccountReserve ?? DEFAULT_ACCOUNT_RESERVE
    )

    const lowBalance = base.currency.defaultUnit(defaultLowBalance ?? DEFAULT_LOW_BALANCE)

    const MIN_STAKING_AMOUNT = base.currency.defaultUnit(
      defaultMinStakingAmount ?? DEFAULT_MIN_STAKING_AMOUNT
    )

    const address = {
      validate: isValidAddress,
    }

    const bip44 = bip44Constants['SOL']

    const keys = {
      encodePrivate: getEncodedSecretKey,
      encodePublic: getAddressFromPublicKey,
    }

    const getBalances = getBalancesFactory({ stakingFeatureAvailable, allowSendingAll })

    const feeData = createFeeData({ asset: base })

    const sendTx = createAndBroadcastTXFactory({
      api: serverApi,
      assetClientInterface,
      feePayerApiUrl,
    })

    const createToken = ({ mintAddress, name, ...tokenDef }) => ({
      ...tokenDef,
      address,
      assetId: mintAddress,
      bip44,
      keys,
      mintAddress,
      name,
      api: {
        features: {},
        getBalances: (...args) => api.getBalances(...args),
      },
    })

    const createCustomToken = ({ assetId, assetName, ...rest }) =>
      createToken({ ...rest, name: assetName, mintAddress: assetId })

    const isSmallValueTx = (tx) =>
      !tx.tokens?.length &&
      !isSolanaRewardsActivityTx(tx) &&
      // check that the coinAmount does not drop below the solana base fee
      // we shouldn't see users sending under the base fee so we consider this safe
      tx.coinAmount.abs().lte(smallTxAmount)

    const getActivityTxs = ({ txs }) => txs.filter((tx) => !isSmallValueTx(tx))

    const features = {
      accountState: true,
      customTokens: base.name === 'solana',
      feeMonitor: false,
      feesApi: true,
      nfts: true,
      staking: {},
      isTestnet,
      signWithSigner,
      signMessageWithSigner: true,
    }

    const assetStakingApi = {
      isStaking: ({ accountState }) => accountState.stakingInfo.isDelegating,
    }

    const SolanaAccountState = createAccountState({ assetList })

    const defaultAddressPath = 'm/0/0'

    const getFee = ({ asset, feeData }) => {
      const priorityFee = feeData.priorityFee ?? 0
      // NOTE: fee is bumped via remote config, eventually fee = feeData.fee + (priorityFee * unitsConsumed * feeData.computeUnitsMultiplier)
      const SOL_TRANSFER_CU = 450 // standard SOL transfer // HACK: solana needs to use getFeeAsync
      const SPL_TRANSFER_CU = 4944 // SPL transfer // HACK: solana needs to use getFeeAsync
      const isToken = asset.name !== base.name

      const computeUnits = isToken ? SPL_TRANSFER_CU : SOL_TRANSFER_CU
      const fee = feeData.baseFee.add(
        base.currency.baseUnit(priorityFee).mul(computeUnits).div(1_000_000) // micro lamports to lamports
      )

      return { fee, priorityFee }
    }

    const getFeeAsync = getFeeAsyncFactory({ api: serverApi })

    const sendValidations = sendValidationsFactory({
      api: serverApi,
      assetName: baseAssetName,
      assetClientInterface,
    })

    const api = {
      getActivityTxs,
      addressHasHistory: (...args) => serverApi.getAccountInfo(...args).then((acc) => !!acc),
      broadcastTx: (...args) => serverApi.broadcastTransaction(...args),
      createAccountState: () => SolanaAccountState,
      createHistoryMonitor: (args) =>
        new SolanaMonitor({
          assetClientInterface,
          interval: monitorInterval,
          shouldUpdateBalanceBeforeHistory,
          ticksBetweenHistoryFetches,
          ticksBetweenStakeFetches,
          includeUnparsed,
          api: serverApi,
          txsLimit,
          ...args,
        }),
      createToken: (tokenDef) =>
        tokenDef.isBuiltIn ? createToken(tokenDef) : createCustomToken(tokenDef),
      defaultAddressPath,
      features,
      getBalances,
      getBalanceForAddress: createGetBalanceForAddress({ api: serverApi, asset: base }),
      getDefaultAddressPath: () => defaultAddressPath,
      getFee,
      getFeeAsync,
      getFeeData: () => feeData,
      getSupportedPurposes: () => [44],
      getKeyIdentifier: createGetKeyIdentifier({ bip44, assetName: base.name }),
      getSendValidations: () => sendValidations,
      getTokens: () =>
        Object.values(assets)
          .filter((asset) => asset.name !== base.name)
          .map(createToken),
      hasFeature: (feature) => !!features[feature], // @deprecated use api.features instead
      privateKeyEncodingDefinition: { encoding: 'base58', data: 'priv|pub' },
      sendTx,
      signTx: ({ unsignedTx, privateKey, signer }) =>
        signer
          ? signUnsignedTxWithSigner(unsignedTx, signer)
          : signUnsignedTx(unsignedTx, privateKey),
      signHardware,
      signMessage: ({ privateKey, signer, message }) =>
        signer
          ? signMessageWithSigner({ signer, message })
          : signMessageNew({ privateKey, message }),
      staking: assetStakingApi,
      validateAssetId: isValidAddress,
      web3: createWeb3API({
        asset: base,
        assetClientInterface,
        prepareForSigning,
      }),
    }

    const fullAsset = {
      ...base,
      address,
      keys,
      api,
      bip44,
      accountReserve,
      lowBalance,
      MIN_STAKING_AMOUNT,
      serverApi,
    }

    return overrideCallback({
      asset: fullAsset,
      config: {
        stakingFeatureAvailable,
        includeUnparsed,
        monitorInterval,
        shouldUpdateBalanceBeforeHistory,
        defaultAccountReserve,
        defaultLowBalance,
        defaultMinStakingAmount,
        ticksBetweenHistoryFetches,
        ticksBetweenStakeFetches,
        txsLimit,
        signWithSigner,
      },
    })
  }
