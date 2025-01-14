import { createAndSignTxFactory } from '@exodus/ethereum-lib'

import assetPlugin from '../index.js'

const PUBLIC_API = 'https://api.avax-test.network/'
const RPC_ENDPOINT = `${PUBLIC_API}ext/bc/C/rpc`

// only funded on Fuji testnet, faucet: https://faucet.avax-test.network/
const PRIVATE_KEY = '8985df5f35f11ad2b2f5e8bebd28e738fd731949ce43fde88634704b4026366e'
const FROM_ADDRESS = '0x32255f101da293a908805b16af8a4619dc1d3c78'
const TO_ADDRESS = '0x081e475e32aa5ebbc993c3948927a8f9b580a037'

const chainId = 43_113 // Fuji Network

const asset = assetPlugin.createAsset({ assetClientInterface: {} })

const createAndSignTx = createAndSignTxFactory({ chainId })

const sampleInput = {
  baseAsset: asset,
  asset,
  address: TO_ADDRESS,
  amount: asset.currency.defaultUnit('0.0001'),
  nonce: 1,
  txInput: Buffer.alloc(0),
  gasLimit: 21_000,
  gasPrice: asset.currency.baseUnit('33000000000'),
  fromAddress: FROM_ADDRESS,
}

describe('sendTransaction', () => {
  it.skip('send a signed transaction', async () => {
    const res = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getTransactionCount',
        params: [FROM_ADDRESS, 'latest'],
      }),
    })
    let { result: nonce } = await res.json()
    nonce = parseInt(nonce)

    const { rawTx, txId } = createAndSignTx(
      { ...sampleInput, nonce },
      Buffer.from(PRIVATE_KEY, 'hex')
    )
    const resSend = await fetch(RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendRawTransaction',
        params: ['0x' + rawTx.toString('hex')],
      }),
    })
    const { result: txHash } = await resSend.json()
    expect(txHash).toBe('0x' + txId)

    console.log(`Check tx at https://testnet.snowtrace.io/tx/${txHash}`)
  })
})
