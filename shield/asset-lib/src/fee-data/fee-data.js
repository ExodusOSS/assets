import lodash from 'lodash'
import assert from 'minimalistic-assert'

import { mapCurrency, modelToJSON } from '../utils/index.js'
import BaseFeeData from './base-fee-data.js'

const { isEmpty, isEqual, merge } = lodash

// immutable
/**
 * mainKey is for remote config: multiplier, max, min
 * const config = { fee: '0.1 XRP', max: '1 XRP', min: '0.1 XRP', multiplier: 1 }
 * const mainKey = 'fee'
 * new FeeData({ config, mainKey, currency: someAsset.currency })
 * new FeeData({ config, currency: someAsset.currency })
 *
 * remoteConfig.feeData
 *
 * Methods
 * - constructor({ config, mainKey, currency }) // for init
 * - update(feeConfig) // for monitor and remote config
 */
export default class FeeData extends BaseFeeData {
  // legacy arguments is to avoid breaking change while assets are being updated.
  constructor({ currency, config: argConfig, mainKey }) {
    super()
    assert(argConfig, `config has not been resolved`)
    assert(currency, `currency has not been resolved`)
    const config = mapCurrency(argConfig, [currency], [mainKey])
    Object.assign(this, config)
    this.origin = config.origin || config[mainKey]
    Object.defineProperty(this, 'currency', { value: currency, enumerable: false })
    Object.defineProperty(this, 'mainKey', { value: mainKey, enumerable: false })
  }

  update(config = {}) {
    if (isEmpty(config)) {
      return this
    }

    config = mapCurrency(config, [this.currency], [this.mainKey])

    // Terser compresser panics on AST_Expansion when it can't find the definition of a object being destructured (i.e. ...this)
    // It optimizes out simple variable renames (like self = this), but having it wrapped in a function is enough to fix this
    // This affects only some cases (mixing with local vars?) and e.g. doesn't affect a lone { ...this }
    // Refs: https://github.com/terser/terser/blob/v3.14.1/lib/compress.js#L1135-L1137
    const wrap = (x) => x
    const newConfig = merge(Object.create(null), wrap(this), config)
    if (config[this.mainKey]) {
      newConfig.origin = config[this.mainKey]
    }

    const { multiplier, max, min } = newConfig

    if (this.mainKey) {
      let fee = newConfig.origin
      if (multiplier) {
        fee = fee.mul(multiplier)
      }

      if (max) {
        fee = fee.lte(max) ? fee : max
      }

      if (min) {
        fee = fee.gte(min) ? fee : min
      }

      newConfig[this.mainKey] = fee
    }

    if (isEqual(this.toJSON(), modelToJSON({ ...newConfig }))) {
      return this
    }

    return new this.constructor({
      config: newConfig,
      mainKey: this.mainKey,
      currency: this.currency,
    })
  }

  toJSON() {
    return modelToJSON({ ...this })
  }
}
