import { getOrdinalsUtxos, toAsyncSigner } from '@exodus/bitcoin-api'
import { getTxSequence } from '@exodus/bitcoin-lib'
import * as bitcoinjsLib from '@exodus/bitcoinjs'
import { randomBytes } from '@exodus/crypto/randomBytes'
import { privateKeyToPublicKey, publicKeyToX } from '@exodus/crypto/secp256k1'
import { TextEncoder } from '@exodus/text-encoding-utf8'
import assert from 'minimalistic-assert'

import { DEFAULT_BRC20_POSTAGE, DEFAULT_ORDINAL_POSTAGE } from './ordinals-constants.js'

const encoder = new TextEncoder()
export function createInscriptionScript({ xOnlyPublicKey, inscription }) {
  assert(xOnlyPublicKey instanceof Buffer, `xOnlyPublicKey must be a Buffer`)
  assert(inscription, `inscription is required`)
  assert(inscription.content instanceof Buffer, `inscription.content must be a Buffer`)
  assert(inscription.contentType instanceof Buffer, `inscription.content must be a Buffer`)
  const protocolId = Buffer.from(encoder.encode('ord'))
  return [
    xOnlyPublicKey,
    bitcoinjsLib.opcodes.OP_CHECKSIG,
    bitcoinjsLib.opcodes.OP_0,
    bitcoinjsLib.opcodes.OP_IF,
    protocolId,
    1,
    1, // double 1 to avoid hitting asMinimalOP
    inscription.contentType,
    bitcoinjsLib.opcodes.OP_0,
    inscription.content,
    bitcoinjsLib.opcodes.OP_ENDIF,
  ]
}

export const inscriptionsServiceFactory = ({ network, ordinalChainIndex }) => {
  assert(network, 'network is required')
  assert(typeof ordinalChainIndex === 'number', 'ordinalChainIndex must be a number')

  function createInscription({ contentType, content, postage }) {
    assert(Number.isSafeInteger(postage), 'postage must be a Safe integer')
    assert(contentType, 'contentType is required integer')
    assert(content, 'content is required integer')

    return {
      contentType: Buffer.from(encoder.encode(contentType)),
      content: Buffer.from(content),
      postage,
    }
  }

  function createTextInscription({ text, postage = DEFAULT_ORDINAL_POSTAGE }) {
    const contentType = 'text/plain;charset=utf-8'
    const content = encoder.encode(text)
    return createInscription({ contentType, content, postage })
  }

  function createBrc20Inscription({
    op,
    tick,
    amt,
    max,
    lim,
    dec,
    postage = DEFAULT_BRC20_POSTAGE,
  }) {
    let body

    assert(['deploy', 'mint', 'transfer'].includes(op), `invalid brc20 op ${op}`)
    assert(typeof tick === 'string', 'tick is required')

    if (['mint', 'transfer'].includes(op)) {
      assert(typeof amt === 'string', 'amt is required')
      body = { p: 'brc-20', op, tick, amt }
    } else {
      assert(typeof max === 'string', 'max is required')
      assert(typeof lim === 'string', 'lim is required')
      body = { p: 'brc-20', op, tick, max, lim, dec }
    }

    const contentType = 'text/plain;charset=utf-8'
    const content = encoder.encode(JSON.stringify(body))
    return createInscription({ contentType, content, postage })
  }

  function createCommitTxData({ publicKey, inscription }) {
    assert(publicKey, 'encodePublic is required')
    assert(inscription, 'inscription is required')
    const xOnlyPublicKey = publicKeyToX({ publicKey, format: 'buffer' })
    const script = createInscriptionScript({ xOnlyPublicKey, inscription })

    const outputScript = bitcoinjsLib.script.compile(script)

    const scriptTree = {
      output: outputScript,
    }

    const scriptTaproot = bitcoinjsLib.payments.p2tr({
      internalPubkey: xOnlyPublicKey,
      scriptTree,
      redeem: scriptTree,
      network,
    })

    const tapleaf = scriptTaproot.hash.toString('hex')

    const revealAddress = scriptTaproot.address
    const tpubkey = scriptTaproot.pubkey.toString('hex')
    const cblock = scriptTaproot.witness?.[scriptTaproot.witness.length - 1].toString('hex')

    return {
      script,
      tapleaf,
      tpubkey,
      cblock,
      revealAddress,
      scriptTaproot,
      outputScript,
    }
  }

  function createPsbt({ scriptTaproot, outputScript, cblock, commitTxResult, amount, toAddress }) {
    const tapLeafScript = {
      leafVersion: scriptTaproot.redeemVersion, // 192 0xc0
      script: outputScript,
      controlBlock: Buffer.from(cblock, 'hex'),
    }

    const psbt = new bitcoinjsLib.Psbt({ network })
    psbt.addInput({
      hash: commitTxResult.txId,
      index: commitTxResult.sendUtxoIndex,
      witnessUtxo: { value: commitTxResult.sendAmount, script: scriptTaproot.output },
      tapLeafScript: [tapLeafScript],
      sequence: getTxSequence(false),
    })

    psbt.addOutput({
      value: amount, // generally 1000 for nfts, 549 for brc20
      address: toAddress.toString(),
    })
    return { tapLeafScript, psbt }
  }

  function finalizePsbt({ psbt, signature, commitTxData, tapLeafScript }) {
    const customFinalizer = () => {
      const witness = [
        Buffer.from(signature, 'hex'),
        commitTxData.outputScript,
        tapLeafScript.controlBlock,
      ]

      return {
        finalScriptWitness: bitcoinjsLib.witnessStackToScriptWitness(witness),
      }
    }

    psbt.finalizeInput(0, customFinalizer)
    return psbt.extractTransaction()
  }

  const estimationStaticData = {
    toAddress: 'bc1p4vgmzfzu642zxj04525xr8szd446ydct3y44dqc7wg88wd8e4v9qzaz7k9',
    publicKey: Buffer.from(
      '041b84c5567b126440995d3ed5aaba0565d71e1834604819ff9c17f5e9d5dd078f70beaf8f588b541507fed6a642c5ab42dfdf8120a7f639de5122d47a69a8e8d1',
      'hex'
    ),
    txId: '2222222222222222222222222222222222222222222222222222222222222222',
    signature: Buffer.alloc(64, 3),
  }

  const estimateTxSize = ({ inscription }) => {
    const { publicKey, txId, toAddress, signature } = estimationStaticData

    const commitTxData = createCommitTxData({ publicKey, inscription })

    const amount = inscription.postage

    const commitTxResult = {
      txId,
      sendUtxoIndex: 0,
      sendAmount: 100_000,
    }

    const { tapLeafScript, psbt } = createPsbt({
      commitTxResult,
      amount,
      toAddress,
      ...commitTxData,
    })

    const tx = finalizePsbt({ signature, commitTxData, tapLeafScript, psbt })

    return tx.virtualSize()
  }

  async function createRevealTx({ commitTxData, commitTxResult, toAddress, privateKey, amount }) {
    assert(commitTxData, `commitTxData is required`)
    assert(commitTxResult, `commitTxResult is required`)
    assert(toAddress, `toAddress is required`)
    assert(privateKey instanceof Buffer, `privateKey must be a Buffer`)
    assert(typeof amount === 'number', `amount must be a number`)

    const { tapLeafScript, psbt } = createPsbt({
      commitTxResult,
      amount,
      toAddress,
      ...commitTxData,
    })

    const publicKey = privateKeyToPublicKey({ privateKey, format: 'buffer' })
    await psbt.signInputAsync(0, toAsyncSigner({ privateKey, publicKey }))

    const signature = psbt.data.inputs[0].tapScriptSig[0].signature.toString('hex')

    const tx = finalizePsbt({ amount, signature, commitTxData, tapLeafScript, psbt })

    const virtualSize = tx.virtualSize()
    const rawTx = tx.toBuffer().toString('hex')
    const txId = tx.getId()
    const vout = 0
    const script = tx.outs[vout].script.toString('hex')
    const inscriptionId = `${txId}i0`

    return {
      txId,
      rawTx,
      inscriptionId,
      signature,
      virtualSize,
      vout,
      script,
      value: amount,
    }
  }

  const resolveMinersFee = ({ inscription, customFee, feeData, asset }) => {
    assert(Number.isSafeInteger(inscription.postage), 'inscription.postage must be a safe integer')
    const txSize = estimateTxSize({ inscription })
    const feePerKB = customFee || feeData.feePerKB
    const minersFeeBaseUnit = Math.ceil((feePerKB.toBaseNumber() * txSize) / 1000)
    assert(Number.isSafeInteger(minersFeeBaseUnit), 'minersFeeBaseUnit must be a safe integer')
    return asset.currency.baseUnit(minersFeeBaseUnit)
  }

  const broadcastInscription = async ({
    asset,
    walletAccount, // The portfolio that spends the fees when creating the inscription. Also, the portfolio that receives the inscription if the 2 belows are not provided
    receiverWalletAccount, // Optional: send the inscription to a different portfolio
    receiverAddress, // Optional: send the inscription to a third party wallet
    assetClientInterface,
    inscription,
    privateKey = randomBytes(32),
    customFee,
  }) => {
    assert(asset, 'asset is required')
    assert(walletAccount, 'walletAccount is required')
    assert(assetClientInterface, 'assetClientInterface is required')
    assert(inscription, 'inscription is required')

    const assetName = asset.name

    const resolvedReceiverWalletAccount = receiverWalletAccount || walletAccount

    const accountState = await assetClientInterface.getAccountState({
      assetName,
      walletAccount: resolvedReceiverWalletAccount,
    })

    const toAddress =
      receiverAddress ||
      (await assetClientInterface.getAddress({
        assetName,
        walletAccount: resolvedReceiverWalletAccount,
        purpose: 86,
        chainIndex: ordinalChainIndex,
        addressIndex: 0,
      }))

    const postage = inscription.postage

    const publicKey = privateKeyToPublicKey({ privateKey, compressed: false, format: 'buffer' })
    const commitTxData = createCommitTxData({ publicKey, inscription })

    const feeData = await assetClientInterface.getFeeConfig({ assetName })

    const minersFee = resolveMinersFee({ inscription, customFee, feeData, asset })
    const commitAmount = minersFee.add(asset.currency.baseUnit(postage))

    const commitTxResult = await asset.api.sendTx({
      asset,
      walletAccount,
      address: commitTxData.revealAddress,
      amount: commitAmount,
      options: { isRbfAllowed: false, customFee },
    })

    const revealTx = await createRevealTx({
      commitTxData,
      amount: postage,
      commitTxResult,
      toAddress,
      privateKey,
    })

    if (!receiverAddress && resolvedReceiverWalletAccount) {
      // only add the utxo
      const storedOrdinalsUtxos = getOrdinalsUtxos({ accountState, asset })

      const ordinalsUtxos = storedOrdinalsUtxos.addUtxo({
        txId: revealTx.txId,
        address: toAddress,
        vout: revealTx.vout,
        script: revealTx.script,
        value: asset.currency.baseUnit(revealTx.value),
        confirmations: 0,
        inscriptions: [{ inscriptionId: revealTx.inscriptionId, offset: 0 }],
        inscriptionIndexed: false,
        rbfEnabled: false,
      })

      await assetClientInterface.updateAccountState({
        assetName,
        walletAccount: resolvedReceiverWalletAccount,
        newData: { ordinalsUtxos },
      })
    }

    await asset.api.broadcastTx(revealTx.rawTx)
    return { ...revealTx, ...commitTxData }
  }

  const getInscriptionFees = ({
    accountState,
    asset,
    customFee,
    feeData,
    getFee,
    inscription,
    txSet,
  }) => {
    assert(accountState, 'accountState is required')
    assert(asset, 'asset is required')
    assert(feeData, 'feeData is required')
    assert(getFee, 'getFee is required')
    assert(inscription, 'inscription is required')
    assert(txSet, 'txSet is required')

    const minersFee = resolveMinersFee({ inscription, customFee, feeData, asset })
    const postageFee = asset.currency.baseUnit(inscription.postage)
    // Total fees: postage + fee of sending from wallet => inscribe taproot address + fee of sending inscribe taproot address => wallet
    const { fee: foundInscriptionFee } = getFee({
      asset,
      accountState,
      txSet,
      feeData,
      amount: minersFee.add(postageFee),
      customFee,
      isSendAll: false,
      receiveAddress: 'P2TR',
    })

    return {
      totalFee: foundInscriptionFee.add(minersFee).add(postageFee),
      foundInscriptionFee,
      minersFee,
      postageFee,
    }
  }

  return {
    createTextInscription,
    createBrc20Inscription,
    createCommitTxData,
    createRevealTx,
    broadcastInscription,
    estimateTxSize,
    getInscriptionFees,
  }
}
