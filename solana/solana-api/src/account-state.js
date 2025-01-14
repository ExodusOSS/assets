import { assetsListToObject } from '@exodus/assets'
import { isNumberUnit } from '@exodus/currency'
import { AccountState } from '@exodus/models'
import lodash from 'lodash'

const { isString, reduce } = lodash

const parseBalance = (balance, asset) =>
  !isNumberUnit(balance) && isString(balance) ? asset.currency.parse(balance) : balance

export const DEFAULT_POOL_ADDRESS = '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF' // Everstake

export const createAccountState = ({ assetList }) => {
  const asset = assetList.find((asset) => asset.baseAssetName === asset.name)
  const tokens = assetList.filter((asset) => asset.baseAssetName !== asset.name)

  return class SolanaAccountState extends AccountState {
    static defaults = {
      cursor: '',
      balance: asset.currency.ZERO,
      tokenBalances: Object.create(null),
      rentExemptAmount: asset.currency.ZERO,
      stakingInfo: {
        loaded: false,
        staking: {
          // remote-config data
          enabled: true,
          pool: DEFAULT_POOL_ADDRESS,
        },
        isDelegating: false,
        locked: asset.currency.defaultUnit(0),
        withdrawable: asset.currency.defaultUnit(0),
        pending: asset.currency.defaultUnit(0),
        activating: asset.currency.defaultUnit(0),
        earned: asset.currency.defaultUnit(0),
        accounts: Object.create(null), // stake accounts
      },
    }

    static _tokens = [asset, ...tokens] // deprecated - will be removed

    static _postParse(data) {
      const assets = assetsListToObject(assetList)
      return {
        ...data,
        tokenBalances: reduce(
          data.tokenBalances,
          (r, tokenBalance, assetName) =>
            assets[assetName]
              ? Object.assign(r, { [assetName]: parseBalance(tokenBalance, assets[assetName]) })
              : r,
          Object.create(null)
        ),
      }
    }
  }
}
