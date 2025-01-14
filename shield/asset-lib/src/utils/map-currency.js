import { isNumberUnit } from '@exodus/currency'
import lodash from 'lodash'

const { isString, mapValues } = lodash

// convert { a: '1 ETH' } to { a: unit }
export default function mapCurrency(config, currencies, unitKeysGuard = []) {
  return mapValues(config, (v, k) => {
    for (const currency of currencies) {
      if (isString(v)) {
        try {
          const trimedValue = v.trim()
          return currency.parse(trimedValue)
        } catch {
          // continue
        }
      }
    }

    if (unitKeysGuard.includes(k) && !isNumberUnit(v)) {
      throw new Error(`mapCurrency invalid value ${JSON.stringify({ [k]: v })}`)
    }

    // return if it's not a unit value
    return v
  })
}
