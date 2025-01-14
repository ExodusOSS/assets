import { getTestingSeed, walletTester } from '@exodus/assets-testing'
import defaultEntropy from '@exodus/bitcoin-api/src/tx-sign/default-entropy.cjs'
import * as btc from '@scure/btc-signer'

import assetPlugin from '../index.js'

// removes the random ouf of the taproot signature
jest
  .spyOn(defaultEntropy, 'getSchnorrEntropy')
  .mockImplementation(() =>
    Buffer.from('1230000000000000000000000000000000000000000000000000000000000000', 'hex')
  )

export const getUTXOs = async (network, address) => {
  const networkSubpath = network === 'testnet' ? '/testnet' : ''

  const url = `https://mempool.space${networkSubpath}/api/address/${address}/utxo`
  const response = await fetch(url)

  return response.json()
}

export const createSelfSendPSBT = async ({
  asset,
  networkType,
  unspentOutputs,
  publicKey,
  recipient,
  inputType,
  sighashType,
}) => {
  const network = networkType === 'testnet' ? btc.TEST_NETWORK : btc.NETWORK

  // choose first unspent output
  const utxo = unspentOutputs[0]

  const tx = new btc.Transaction()

  // set transfer amount and calculate change
  const fee = 300 // set the miner fee amount
  const recipientAmount = BigInt(Math.min(utxo.value, 3000)) - BigInt(fee)
  const changeAmount = BigInt(utxo.value) - recipientAmount - BigInt(fee)

  tx.addInput(
    createInput({
      asset,
      inputType,
      sighashType,
      publicKey,
      network,
      utxo,
    })
  )

  tx.addOutputAddress(recipient, recipientAmount, network)
  tx.addOutputAddress(recipient, changeAmount, network)

  const psbt = tx.toPSBT(0)
  return Buffer.from(psbt).toString('hex')
}

const createInput = ({ asset, inputType, sighashType, publicKey, network, utxo }) => {
  if (inputType === 'p2wpkh') {
    const p2wpkh = btc.p2wpkh(publicKey, network)
    const script = asset.address.toScriptPubKey(p2wpkh.address)

    return {
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script,
        amount: BigInt(utxo.value),
      },
      sighashType,
    }
  }

  if (inputType === 'p2tr') {
    const internalPubKey = publicKey.slice(1, 33)
    const p2tr = btc.p2tr(internalPubKey, undefined, network)

    return {
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2tr.script,
        amount: BigInt(utxo.value),
      },
      tapInternalKey: p2tr.tapInternalKey,
      sighashType,
    }
  }
}

const createTransactionAndSign = async ({
  asset,
  getPrivateKey,
  assetClientInterface,
  purpose,
  inputType,
  shouldBroadcast = false,
  providedUnspentOutputs,
  sighashType,
  sighashTypeInput,
  expectedInputPSBT,
  expectedRawPSBT,
}) => {
  const network = 'bitcoin'

  const accountIndex = 0
  const { publicKey, address } = await getPrivateKey({
    asset,
    purpose,
    accountIndex,
    chainIndex: 0,
    addressIndex: 0,
  })
  const unspentOutputs = providedUnspentOutputs || (await getUTXOs(network, address))

  expect(unspentOutputs.length).toBeGreaterThan(0)

  // create psbt sending from the supplied address to itself
  const outputRecipient = address

  const psbtString = await createSelfSendPSBT({
    asset,
    networkType: network,
    publicKey,
    unspentOutputs,
    recipient: outputRecipient,
    inputType,
    sighashType,
  })

  expect(psbtString).toEqual(expectedInputPSBT)

  const inputsToSign = [
    {
      address,
      signingIndexes: [0],
      sigHash: sighashTypeInput ?? sighashType,
    },
  ]

  const walletAccount = `exodus_${accountIndex}`
  const assetName = asset.name
  const addressPathsMap = { [address]: 'm/0/0' }
  const { rawTx, txId, plainTx } = await assetClientInterface.signTransaction({
    assetName,
    unsignedTx: {
      txMeta: { addressPathsMap, inputsToSign },
      txData: { psbtBuffer: Buffer.from(psbtString, 'hex') },
    },
    walletAccount,
  })

  // Only `plainTx` including a `rawPSBT` is returned when signing a PSBT from 3rd party buffer.
  expect(rawTx).not.toBeDefined()
  expect(txId).not.toBeDefined()
  expect(Buffer.isBuffer(plainTx.rawPSBT)).toBeTruthy()
  expect(plainTx.rawPSBT.toString('hex')).toEqual(expectedRawPSBT)

  const recreatedTx = btc.Transaction.fromPSBT(plainTx.rawPSBT)
  expect(recreatedTx).toBeDefined()

  if (shouldBroadcast) {
    const rawTxHex = rawTx.toString('hex')
    await asset.api.broadcastTx(rawTxHex)
  }
}

describe(`pbst signing test`, () => {
  walletTester({
    assetPlugin,
    seed: getTestingSeed(),
    testPurposes: [44, 49, 84, 86],
    // expectedAddresses: {
    //   bitcoin_44_exodus_0_0_0: '1Ce5zNA1ZhTxCgXd9XQdb87Bf78VR8zL8j',
    //   bitcoin_44_exodus_1_0_0: '1Kb7JNhQ7ULHBx1TFJuEAmQFb1FFAYYxhs',
    //   bitcoin_44_exodus_2_0_0: '1NJaYYJ4HDAFYuswMeFCwFrJ3i4HKfgzDC',
    //   bitcoin_49_exodus_0_0_0: '38J1QSqDKYdVBCpeL55NfrL67puokCojDn',
    //   bitcoin_49_exodus_1_0_0: '3LEatWBiKwRw7umdgLiGL4afxHuv93tRpC',
    //   bitcoin_49_exodus_2_0_0: '34mjb8ooyr9AqAyhMmuopP2kFG97kPg3x8',
    //   bitcoin_84_exodus_0_0_0: 'bc1qlrh635rpvps06d9klakf7k3lq4tlnd25e53pez',
    //   bitcoin_84_exodus_1_0_0: 'bc1q78ne29cynskvmx3r647m9dyhngsw5gjpencs0d',
    //   bitcoin_84_exodus_2_0_0: 'bc1qcg9vcs203yv6t3z4tnkftsyx6hy6wj6fkmrd4r',
    //   bitcoin_86_exodus_0_0_0: 'bc1pcf8yrw8vf5y3lxlmkjqlme7wpqywmqsdhr5ngzwvgpx63ww706fq3y4x0q',
    //   bitcoin_86_exodus_1_0_0: 'bc1pms29vk2n5ds5e2a8tepdahaljjzfaskg5tcx64uharj6fagut6gq7ygsk4',
    //   bitcoin_86_exodus_2_0_0: 'bc1pffcpm60f00ttg7mqz3zg9ale4fdqajqyr87jeswqs8uxnrc4yvgsxkwazk',
    // },
    tests: {
      'Native Segwit Address': (args) => {
        return createTransactionAndSign({
          ...args,
          providedUnspentOutputs: [
            {
              txid: '875bb40ad587fcb03c912ac2ca5f7113fb4e118a130a09646f2eb1db30b77d76',
              vout: 0,
              status: { confirmed: false },
              value: 2700,
            },
          ],
          inputType: 'p2wpkh',
          purpose: 84,
          expectedInputPSBT:
            '70736274ff0100710200000001767db730dbb12e6f64090a138a114efb13715fcac22a913cb0fc87d50ab45b870000000000ffffffff026009000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b5540000000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b554000000000001011f8c0a000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b55401030481000000000000',

          expectedRawPSBT:
            '70736274ff0100710200000001767db730dbb12e6f64090a138a114efb13715fcac22a913cb0fc87d50ab45b870000000000ffffffff026009000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b5540000000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b554000000000001011f8c0a000000000000160014f8efa8d0616060fd34b6ff6c9f5a3f0557f9b5542202026b25317ab8f8a343a0a1d0506ed7c446e430ea9e3d7ed69082b8c07425cf679e4730440220195d724756cf20fdd3b341b9c77e5dd6d628ec414a63a425523a7e2b1a96d6c6022072daeeb44ee447a5bf5596a9c266553c86161c70457c4b05652fead50a517f1a8101030481000000000000',
          sighashType: btc.SigHash.ALL_ANYONECANPAY,
        })
      },
      'Taproot Address': (args) => {
        return createTransactionAndSign({
          ...args,
          providedUnspentOutputs: [
            {
              txid: 'fd47cd17a95c097c3d6eff2fffe6199e09080dd86701dff61c886c74c704cb5e',
              vout: 0,
              status: { confirmed: false },
              value: 58_513,
            },
          ],
          inputType: 'p2tr',
          purpose: 86,
          expectedInputPSBT:
            '70736274ff01008902000000015ecb04c7746c881cf6df0167d80d08099e19e6ff2fff6e3d7c095ca917cd47fd0000000000ffffffff028c0a000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92d9d8000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92000000000001012b91e4000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e920103048200000001172073ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91000000',

          expectedRawPSBT:
            '70736274ff01008902000000015ecb04c7746c881cf6df0167d80d08099e19e6ff2fff6e3d7c095ca917cd47fd0000000000ffffffff028c0a000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92d9d8000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92000000000001012b91e4000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92010304820000000113413cb74e42ebcd142ce2467cac5afac917c774580f3f0fde136c8f8dad5316093c1e51c382a826c5b69b7fcb3befe4e9c469dc1bb6004c3eb0c689fcb6a4fba45e8201172073ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91000000',
          sighashType: btc.SigHash.NONE_ANYONECANPAY,
        })
      },
      'Taproot Address zero sighash type': (args) => {
        return createTransactionAndSign({
          ...args,
          providedUnspentOutputs: [
            {
              txid: 'fd47cd17a95c097c3d6eff2fffe6199e09080dd86701dff61c886c74c704cb5e',
              vout: 0,
              status: { confirmed: false },
              value: 58_513,
            },
          ],
          inputType: 'p2tr',
          purpose: 86,
          expectedInputPSBT:
            '70736274ff01008902000000015ecb04c7746c881cf6df0167d80d08099e19e6ff2fff6e3d7c095ca917cd47fd0000000000ffffffff028c0a000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92d9d8000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92000000000001012b91e4000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e920103040100000001172073ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91000000',

          expectedRawPSBT:
            '70736274ff01008902000000015ecb04c7746c881cf6df0167d80d08099e19e6ff2fff6e3d7c095ca917cd47fd0000000000ffffffff028c0a000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92d9d8000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e92000000000001012b91e4000000000000225120c24e41b8ec4d091f9bfbb481fde7ce0808ed820db8e93409cc404da8b9de7e9201030401000000011341c2259b1fc27b846b7204b571a43e4951ef53e40b7486732673ac8d9187eb95d230ccdc5ab20e4e1e975fb211d13531de77f3ea70397fcca8d74629d20ffb4a3f0101172073ae16fb2721654c8735487c024f9a137511eb2d4f2c39e3084bd87cf044ac91000000',
          sighashType: btc.SigHash.ALL,
          sighashTypeInput: 0,
        })
      },
    },
  })
})
