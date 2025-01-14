import { isNumberUnit } from '@exodus/currency'

import mapValuesDeep from './map-values-deep.js'

export default function (obj) {
  return mapValuesDeep(obj, (v, k) => {
    if (isNumberUnit(v)) {
      return v.toString()
    }

    return v
  })
}
