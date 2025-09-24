import { connectAssets } from '@exodus/assets'
import assetsList from '@exodus/ethereum-meta'
import lodash from 'lodash'

const { keyBy } = lodash
const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))

import {
  estimateSimpleTransfer,
  NotSimpleTransferError,
} from '../estimateSimpleTransfer.js'

const asset = assets.ethereum

const createTransaction = () => ({
  from: '0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6',
  to: '0xc4F28E9D9EcA931064257cb82B3f53f32ae4eFE6',
  value: '0xFFF',
  data: '0x',
  nonce: 0,
  gas: '0x' + Number(21000).toString(16),
  maxPriorityFeePerGas: '0x' + Number(12000000000).toString(16), // 12 Gwei
  maxFeePerGas: '0x' + Number(5000000000).toString(16), // 1.5 Gwei
})

describe('estimateSimpleTransfer', () => {
  it('throws if the "data" field provides parameters', () => {
    const transaction = createTransaction()
    transaction.data = '0xFFF' // some random data.
    try {
      estimateSimpleTransfer({ asset, transaction })
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.message).toEqual(
        'The transaction input should be empty ("0x").',
      )
      expect(err instanceof NotSimpleTransferError).toBeTruthy()
    }
  })

  it('returns the value if transaction is a simple transfer', () => {
    const transaction = createTransaction()

    const estimatedTransferValue = estimateSimpleTransfer({
      asset,
      transaction,
    })

    expect(estimatedTransferValue.toNumber()).toEqual(
      parseInt(transaction.value, 16),
    )
  })
})
