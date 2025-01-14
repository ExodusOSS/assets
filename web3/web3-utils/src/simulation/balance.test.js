import { connectAssets } from '@exodus/assets'
import cardanoAssetsList from '@exodus/cardano-meta'
import ethereumAssetsList from '@exodus/ethereum-meta'
import { keyBy } from 'lodash'

import { hasSufficientBalance } from './balance.js'

const assets = connectAssets(
  keyBy([...ethereumAssetsList, ...cardanoAssetsList], (asset) => asset.name),
)

const asset = assets.ethereum
const txFee = asset.currency.baseUnit(1)
const availableBalance = asset.currency.defaultUnit(10)

describe('hasSufficientBalance', () => {
  it('should return false if the account balance is greater than the transaction amount', () => {
    const balanceChanges = {
      willSend: [{ balance: asset.currency.defaultUnit(100) }],
    }
    const result = hasSufficientBalance(
      asset,
      txFee,
      balanceChanges,
      availableBalance,
    )
    expect(result).toBe(false)
  })

  it('should return true if the account balance is less than the transaction amount', () => {
    const balanceChanges = {
      willSend: [{ balance: asset.currency.defaultUnit(8) }],
    }
    const result = hasSufficientBalance(
      asset,
      txFee,
      balanceChanges,
      availableBalance,
    )
    expect(result).toBe(true)
  })

  it('should ignore non matching base-asset balances', () => {
    const balanceChanges = {
      willSend: [
        { balance: asset.currency.defaultUnit(1) },
        { balance: assets.cardano.currency.defaultUnit(100) },
      ],
    }

    const result = hasSufficientBalance(
      asset,
      txFee,
      balanceChanges,
      availableBalance,
    )
    expect(result).toBe(true)
  })
})
