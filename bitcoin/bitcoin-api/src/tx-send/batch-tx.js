import BIP32 from '@exodus/bip32'
import { Psbt } from '@exodus/bitcoinjs'
import BipPath from 'bip32-path'
import lodash from 'lodash' // mockable in tests
import assert from 'minimalistic-assert'

import { selectUtxos } from '../fee/utxo-selector.js'
import { getUnconfirmedTxAncestorMap } from '../unconfirmed-ancestor-data.js'
import { getUsableUtxos, getUtxos } from '../utxos-utils.js'

const DUST_VALUES = {
  P2WPKH: 294,
  P2TR: 330,
}

export const getCreateBatchTransaction = ({
  getFeeEstimator,
  assetClientInterface,
  changeAddressType,
  allowUnconfirmedRbfEnabledUtxos,
}) => {
  assert(assetClientInterface, `assetClientInterface must be supplied in sendTx`)

  return async ({ asset, walletAccount, recipients, options = {} }) => {
    const assetName = asset.name
    const {
      feeData = await assetClientInterface.getFeeConfig({ assetName }),
      taprootInputWitnessSize,
    } = options

    const accountState = await assetClientInterface.getAccountState({ assetName, walletAccount })

    const txSet = await assetClientInterface.getTxLog({ assetName, walletAccount })
    const unconfirmedTxAncestor = getUnconfirmedTxAncestorMap({ accountState })
    const usableUtxos = getUsableUtxos({
      asset,
      utxos: getUtxos({ accountState, asset }),
      feeData,
      txSet,
      unconfirmedTxAncestor,
    })

    const amount = recipients.reduce((acc, curr) => acc.add(curr.amount), asset.currency.ZERO)
    const receiveAddresses = recipients.map((recipient) => recipient.address)

    const { selectedUtxos, fee } = selectUtxos({
      asset,
      usableUtxos,
      amount,
      feeRate: feeData.feePerKB,
      receiveAddresses,
      getFeeEstimator: (asset, { feePerKB, ...options }) =>
        getFeeEstimator(asset, feePerKB, options),
      unconfirmedTxAncestor,
      taprootInputWitnessSize,
      changeAddressType,
      allowUnconfirmedRbfEnabledUtxos,
    })

    if (!selectedUtxos) throw new Error('Not enough funds.')

    const addressPathsMap = selectedUtxos.getAddressPathsMap()

    const psbt = new Psbt({ network: asset.coinInfo.toBitcoinJS() })

    for (const utxo of lodash.shuffle(selectedUtxos.toArray())) {
      const path = addressPathsMap[utxo.address]
      if (!path) {
        throw new Error(`Path missing for input address ${utxo.address}`)
      }

      const [chainIndex, addressIndex] = BipPath.fromString(path).toPathArray()
      const addressOpts = {
        walletAccount,
        assetName,
        chainIndex,
        addressIndex,
        purpose: utxo.address.meta.purpose ?? 86,
      }

      const [address, xpub] = await Promise.all([
        assetClientInterface.getAddress(addressOpts),
        assetClientInterface.getExtendedPublicKey(addressOpts),
      ])
      assert(String(address) === String(utxo.address))

      const hdkey = BIP32.fromXPub(xpub)
      const masterFingerprint = Buffer.alloc(4)
      masterFingerprint.writeUint32BE(hdkey.fingerprint)

      const input = {
        hash: utxo.txId,
        index: utxo.vout,
        witnessUtxo: {
          value: parseInt(utxo.value.toBaseString(), 10),
          script: Buffer.from(utxo.script, 'hex'),
        },
      }

      if (address.meta.spendingInfo) {
        const { witness, redeem } = address.meta.spendingInfo
        input.tapLeafScript = [
          {
            leafVersion: redeem.redeemVersion,
            script: redeem.output,
            controlBlock: witness[witness.length - 1],
          },
        ]
      }

      psbt.addInput(input)

      const pubkey = hdkey.derive(path).publicKey.slice(1)
      const index = psbt.data.inputs.length - 1
      psbt.data.inputs[index].tapBip32Derivation = [
        {
          path,
          leafHashes: [],
          masterFingerprint,
          pubkey,
        },
      ]
    }

    const change = selectedUtxos.value.sub(amount).sub(fee)
    if (change.gte(asset.currency.baseUnit(DUST_VALUES[changeAddressType]))) {
      const changeAddress = await assetClientInterface.getNextChangeAddress({
        assetName,
        walletAccount,
      })

      const output = { address: String(changeAddress), amount: change }

      const path = changeAddress.meta.path

      const xpub = await assetClientInterface.getExtendedPublicKey({ walletAccount, assetName })
      const hdkey = BIP32.fromXPub(xpub)
      const masterFingerprint = Buffer.alloc(4)
      masterFingerprint.writeUint32BE(hdkey.fingerprint)

      const pubkey = hdkey.derive(path).publicKey.slice(1)
      output.tapBip32Derivation = [
        {
          path,
          leafHashes: [],
          masterFingerprint,
          pubkey,
        },
      ]

      recipients.push(output)
    }

    for (const recipient of lodash.shuffle(recipients)) {
      psbt.addOutput({
        address: recipient.address,
        value: parseInt(recipient.amount.toBaseString(), 10),
        unknownKeyVals: [],
      })

      const index = psbt.data.outputs.length - 1
      if (recipient.tapBip32Derivation) {
        psbt.data.outputs[index].tapBip32Derivation = recipient.tapBip32Derivation
      }

      if (recipient.name) {
        psbt.data.outputs[index].unknownKeyVals.push({
          key: Buffer.from('name', 'utf8'),
          value: Buffer.from(recipient.name, 'utf8'),
        })
      }

      if (recipient.email) {
        psbt.data.outputs[index].unknownKeyVals.push({
          key: Buffer.from('email', 'utf8'),
          value: Buffer.from(recipient.email, 'utf8'),
        })
      }

      if (recipient.description) {
        psbt.data.outputs[index].unknownKeyVals.push({
          key: Buffer.from('description', 'utf8'),
          value: Buffer.from(recipient.description, 'utf8'),
        })
      }

      if (recipient.fiatAmount) {
        psbt.data.outputs[index].unknownKeyVals.push({
          key: Buffer.from('fiatAmount', 'utf8'),
          value: Buffer.from(recipient.fiatAmount.toDefaultString(), 'utf8'),
        })
      }
    }

    const blockHeight = await asset.baseAsset.insightClient.fetchBlockHeight()

    psbt.setLocktime(blockHeight)

    return psbt
  }
}
