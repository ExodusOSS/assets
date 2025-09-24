import { connectAssets } from '@exodus/assets'
import assetsList from '@exodus/ethereum-meta'
import lodash from 'lodash'

const { keyBy } = lodash

import { estimateFee } from '../estimateFee.js'

const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))

const asset = assets.ethereum
const expectedFee = asset.currency.baseUnit(12e9 * 21e3).toBaseString() // 12 Gwei * 21000 gas

describe('estimateFee', () => {
  it('handles EIP-1559 fee data', () => {
    const transaction = {
      gas: '0x' + Number(21000).toString(16),
      maxFeePerGas: '0x' + Number(12000000000).toString(16), // 12 Gwei
    }

    const fee = estimateFee({ asset, transaction })
    expect(fee.toBaseString()).toEqual(expectedFee)
  })

  it('handles the legacy "gasPrice" field', () => {
    const transaction = {
      gas: '0x' + Number(21000).toString(16),
      gasPrice: '0x' + Number(12000000000).toString(16), // 12 Gwei
    }

    const fee = estimateFee({ asset, transaction })
    expect(fee.toBaseString()).toEqual(expectedFee)
  })
})
