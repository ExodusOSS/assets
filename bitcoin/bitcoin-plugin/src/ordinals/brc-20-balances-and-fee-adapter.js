import { getOrdinalsUtxos } from '@exodus/bitcoin-api'
import { BumpType } from '@exodus/bitcoin-lib'
import { Address, UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'

import { brc20Utils } from './brc-20-utils.js'
import { createBrc20Command } from './create-brc-20-command.js'

export const brc20BalancesAndFeeAdapterFactory = ({
  assetClientInterface,
  inscriptionsService,
  getBalances,
  getFee,
  getAvailableBalance,
  canBumpTx,
  getSpendableBalance,
  sendTx,
  tickInscriptionIdIndexer,
}) => {
  assert(inscriptionsService, 'inscriptionsService is required')
  assert(getBalances, 'getBalances is required')
  assert(getFee, 'getFee is required')
  assert(getAvailableBalance, 'getAvailableBalance is required')
  assert(canBumpTx, 'canBumpTx is required')
  assert(getSpendableBalance, 'getSpendableBalance is required')
  assert(sendTx, 'sendTx is required')
  assert(tickInscriptionIdIndexer, 'unknownDeployInscriptionIds is required')

  const { isToken, getTokenBalance } = brc20Utils

  const isInscription = ({ options }) => {
    return !options?.feeOpts?.inscriptionIds?.length
  }

  const sendBrc20 = async ({ asset: token, walletAccount, address, amount, options }) => {
    const { broadcastInscription, createBrc20Inscription } = inscriptionsService

    const { customFee, isSendAll } = options || {}

    const asset = token.baseAsset
    const accountState = await assetClientInterface.getAccountState({
      walletAccount,
      assetName: asset.name,
    })

    const tick = await tickInscriptionIdIndexer.getBrc20TickFromAsset(token)

    const tokenAmount =
      (isSendAll ? getTokenBalance({ asset: token, accountState }) : amount) || token.currency.ZERO

    if (tokenAmount.lte(token.currency.ZERO)) {
      throw new Error(
        `Cannot send ${tokenAmount.toDefaultString({ unit: true })} amount for asset :${
          token.name
        }. Tick: ${tick}`
      )
    }

    const { inscriptionIds, newInscriptions } = createBrc20Command({
      asset: token,
      amount: tokenAmount,
      accountState,
    })

    for (const newInscription of newInscriptions) {
      const inscription = createBrc20Inscription({
        op: 'transfer',
        tick,
        amt: newInscription.amount.toDefaultString({ unit: false }),
      })

      const inscriptionResult = await broadcastInscription({
        asset,
        assetClientInterface,
        walletAccount,
        receiverWalletAccount: walletAccount,
        inscription,
        customFee,
      })

      inscriptionIds.push(inscriptionResult.inscriptionId)
    }

    return sendTx({
      asset: token,
      walletAccount,
      address,
      amount: tokenAmount,
      options: {
        ...options,
        isRbfAllowed: false,
        brc20: { inscriptionIds },
      },
    })
  }

  const getFeeBrc20 = ({
    asset: token,
    accountState,
    txSet,
    feeData,
    amount,
    customFee,
    isSendAll,
  }) => {
    const { getInscriptionFees, createBrc20Inscription } = inscriptionsService

    const asset = token.baseAsset

    const availableBalance = getTokenBalance({ asset: token, accountState })

    const tokenAmount = (isSendAll ? availableBalance : amount) || token.currency.ZERO

    if (tokenAmount.lte(token.currency.ZERO) || availableBalance.lt(tokenAmount)) {
      return { fee: asset.currency.ZERO }
    }

    const { inscriptionIds, newInscriptions } = createBrc20Command({
      asset: token,
      amount: tokenAmount,
      accountState,
    })

    const newInscriptionFees = []

    let index = 0
    for (const newInscription of newInscriptions) {
      const inscription = createBrc20Inscription({
        op: 'transfer',
        tick: 'abcd',
        amt: newInscription.amount.toDefaultString({ unit: false }),
      })
      const newInscriptionFee = getInscriptionFees({
        asset,
        getFee,
        txSet,
        inscription,
        customFee,
        accountState,
        feeData,
      })
      newInscriptionFees.push(newInscriptionFee)
      const inscriptionId = `new_inscription_${index++}`
      newInscription.inscriptionId = inscriptionId
      inscriptionIds.push(inscriptionId) // this is just to count how many utxos needs to be send in the last txs
    }

    const ordinalsUtxos = getOrdinalsUtxos({ accountState, asset })

    const mockedOrdinalsUtxos = ordinalsUtxos.union(
      UtxoCollection.fromArray(
        newInscriptions.map(({ address, inscriptionId }, index) => {
          return {
            address: Address.create(address),
            txId: inscriptionId,
            confirmations: 1,
            value: '600 satoshis',
            vout: 0,
            script: '5120d96a4516786abc536ac4445887262770134f2ab139012856c1f3fdd13c1b02ac', // dummy taproot script
            inscriptions: [{ inscriptionId, offset: 0 }],
          }
        }),
        { currency: asset.currency }
      )
    )
    const { fee: lastSendingFee } = getFee({
      asset,
      accountState: {
        ...accountState,
        ordinalsUtxos: mockedOrdinalsUtxos,
      },
      txSet,
      feeData,
      amount: asset.currency.ZERO,
      customFee,
      brc20: { inscriptionIds },
    })

    const fee = newInscriptionFees.reduce(
      (total, newInscriptionFee) => total.add(newInscriptionFee.totalFee),
      lastSendingFee
    )

    return { fee, lastSendingFee, newInscriptionFees }
  }

  return {
    canBumpTx: (args) => {
      return isToken(args) ? { bumpType: BumpType.NONE } : canBumpTx(args)
    },

    getSpendableBalance: (args) => {
      return isToken(args) ? getTokenBalance(args) : getSpendableBalance(args)
    },

    getFee: (args) => {
      return isToken(args) ? getFeeBrc20(args) : getFee(args)
    },

    getAvailableBalance: (args) => {
      return isToken(args) ? getTokenBalance(args) : getAvailableBalance(args)
    },

    getBalances: (args) => {
      return isToken(args) ? { balance: getTokenBalance(args) } : getBalances(args)
    },

    sendTx: (...args) => {
      return isToken(args[0]) && isInscription(...args) ? sendBrc20(...args) : sendTx(...args)
    },
  }
}
