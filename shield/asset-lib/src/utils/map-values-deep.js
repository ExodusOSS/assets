import lodash from 'lodash'

const { isArray, isPlainObject, mapValues } = lodash

export default function mapValuesDeep(obj, cb) {
  if (isPlainObject(obj)) {
    return mapValues(obj, (v) => mapValuesDeep(v, cb))
  }

  if (isArray(obj)) {
    return obj.map((v) => mapValuesDeep(v, cb))
  }

  return cb(obj)
}
