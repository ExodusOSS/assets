import { privateKeyToPublicKey, publicKeyConvert } from '@exodus/crypto/secp256k1'
import { Address, UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'
import wif from 'wif'

import { createInputs, createOutput, getNonWitnessTxs } from './tx-send/index.js'

const isValidPrivateKey = (privateKey) => {
  try {
    wif.decode(privateKey)
    return true
  } catch {
    return false
  }
}

const wifToPublicKey = ({ coinInfo, privateKeyWIF }) => {
  assert(coinInfo, 'coinInfo is required')
  assert(privateKeyWIF, 'privateKeyWIF is required')
  const { versions } = coinInfo

  const { privateKey, compressed } = wif.decode(privateKeyWIF, versions.private)
  const publicKey = privateKeyToPublicKey({ privateKey, compressed, format: 'buffer' })
  return { compressed, publicKey }
}

export const getAddressesFromPrivateKeyFactory = ({ purposes, keys, coinInfo }) => {
  assert(purposes, 'purposes is required')
  assert(keys, 'keys is required')
  assert(coinInfo, 'coinInfo is required')

  return ({ privateKey }) => {
    if (!isValidPrivateKey(privateKey)) {
      return { invalid: true }
    }

    const { publicKey, compressed } = wifToPublicKey({ coinInfo, privateKeyWIF: privateKey })
    const addresses = purposes.map((purpose) =>
      keys.encodePublic(
        purpose === 49
          ? publicKeyConvert({ publicKey, compressed: true, format: 'buffer' })
          : publicKey,
        { purpose }
      )
    )
    return { addresses, compressed }
  }
}

export const renderAddresses = (addresses) => {
  if (addresses.length === 0) {
    return ''
  }

  if (addresses.length === 1) {
    return `${addresses[0]}`
  }

  return `${addresses.slice(0, -1).join(', ')}, or ${addresses[addresses.length - 1]}`
}

export const moveFundsFactory = ({
  asset,
  insightClient,
  getFeeEstimator,
  signTx,
  address,
  getAddressesFromPrivateKey,
  shouldExcludeVoutUtxo = () => false,
}) => {
  assert(asset, 'asset is required')
  assert(insightClient, 'insightClient is required')
  assert(getFeeEstimator, 'getFeeEstimator is required')
  assert(address, 'address is required')
  assert(signTx, 'signTx is required')
  assert(getAddressesFromPrivateKey, 'getAddressesFromPrivateKey is required')
  assert(typeof shouldExcludeVoutUtxo === 'function', 'shouldExcludeVoutUtxo must be a function')

  async function prepareSendFundsTx({
    assetName,
    walletAccount,
    input,
    toAddress,
    assetClientInterface,
    MoveFundsError,
  }) {
    assert(asset.name === assetName, `expected asset ${asset.name} but got assetName ${assetName}`)
    assert(walletAccount, 'walletAccount is required')
    assert(toAddress, 'toAddress is required')
    assert(assetClientInterface, 'assetClientInterface is required')
    assert(MoveFundsError, 'MoveFundsError is required') // should we move MoveFundsError to asset libs?

    const formatProps = {
      assetName: asset.name,
    }
    // WIF format private key
    const privateKey = input

    const { addresses, compressed, invalid } = getAddressesFromPrivateKey({ privateKey })

    if (invalid) {
      throw new MoveFundsError('private-key-invalid', formatProps)
    }

    const config = await assetClientInterface.getAssetConfig?.({
      assetName,
      walletAccount,
    })
    const recieveAddressesObjects = await assetClientInterface.getReceiveAddresses({
      walletAccount,
      assetName,
      multiAddressMode: config?.multiAddressMode ?? true,
    })

    const receiveAddresses = recieveAddressesObjects.map(
      (receiveAddress) =>
        address.toLegacyAddress?.(receiveAddress.toString()) || receiveAddress.toString()
    )

    const findFromAddress = async () => {
      for (const originalCurrentAddress of addresses) {
        const currentAddress =
          address.toLegacyAddress?.(originalCurrentAddress) || originalCurrentAddress
        const selfSend = receiveAddresses.some(
          (receiveAddress) => String(receiveAddress) === String(currentAddress)
        )
        if (selfSend) {
          throw new MoveFundsError('private-key-own-key', formatProps)
        }

        const collectedUtxos = await getUtxos({ asset, address: currentAddress })
        const utxos = collectedUtxos.filter((utxo) => !shouldExcludeVoutUtxo({ output: utxo }))

        if (!utxos.value.isZero) {
          return { fromAddress: currentAddress, utxos }
        }
      }

      throw new MoveFundsError('balance-zero', {
        ...formatProps,
        fromAddress: renderAddresses(addresses),
        fromAddresses: addresses.map(String),
      })
    }

    const { fromAddress, utxos } = await findFromAddress()
    formatProps.fromAddress = fromAddress
    const feeData = await assetClientInterface.getFeeConfig({ assetName })
    const { fee, sizeKB } = getFee({ asset, feeData, utxos, compressed })

    const amount = utxos.value.sub(fee)
    if (amount.isNegative) {
      throw new MoveFundsError('balance-negative', formatProps)
    }

    const unsignedTx = {
      txData: {
        inputs: createInputs(assetName, utxos.toArray()),
        outputs: [
          createOutput(assetName, address.toLegacyAddress?.(toAddress) || toAddress, amount),
        ],
      },
      txMeta: {
        addressPathsMap: utxos.getAddressPathsMap(),
      },
    }
    const nonWitnessTxs = await getNonWitnessTxs(
      { name: assetName, address }, // pretty ugly hack!
      utxos,
      insightClient
    )
    Object.assign(unsignedTx.txMeta, { rawTxs: nonWitnessTxs })

    return { fromAddress, toAddress, amount, fee, utxos, unsignedTx, sizeKB, privateKey }
  }

  const sendFunds = async ({
    assetName,
    fromAddress,
    toAddress,
    amount,
    fee,
    unsignedTx,
    privateKey,
  }) => {
    // the response from prepareSendFundsTx
    assert(assetName, 'assetName is required')
    assert(fromAddress, 'fromAddress is required')
    assert(toAddress, 'toAddress is required')
    assert(amount, 'amount is required')
    assert(fee, 'fee is required')
    assert(unsignedTx, 'unsignedTx is required')
    assert(privateKey, 'privateKey is required')

    const privateKeysAddressMap = {
      [fromAddress]: privateKey,
    }

    const { rawTx, txId } = await signTx({ unsignedTx, privateKeysAddressMap })

    await insightClient.broadcastTx(rawTx.toString('hex'))

    return { txId, fromAddress, toAddress, amount, fee }
  }

  async function getUtxos({ asset, address }) {
    const rawUtxos = await insightClient.fetchUTXOs([address])
    return UtxoCollection.fromArray(
      rawUtxos.map((utxo) => ({
        txId: utxo.txId,
        vout: utxo.vout,
        value: asset.currency.defaultUnit(utxo.value),
        address: Address.create(utxo.address, { path: 'm/0/0' }),
        script: utxo.script,
      })),
      { currency: asset.currency }
    )
  }

  function getFee({ asset, feeData, utxos, compressed }) {
    const { feePerKB } = feeData
    const feeEstimator = getFeeEstimator(asset, feePerKB, { compressed })
    const fee = feeEstimator({ inputs: utxos, outputs: [null] })
    const sizeKB = fee.toDefaultNumber() / feePerKB
    return { fee, sizeKB }
  }

  return {
    prepareSendFundsTx,
    sendFunds,
  }
}
