import assert from 'minimalistic-assert'

import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from './constants.js'

const createValidator = ({
  id,
  validateAndGetMessage,
  shouldValidate,
  isValid,
  type = VALIDATION_TYPES.ERROR,
  priority = PRIORITY_LEVELS.BASE,
  field = FIELDS.AMOUNT,
  getMessage,
  ...rest
}) => {
  assert(id, 'id required')
  assert(type !== undefined, `${id}: type required`)
  assert(priority !== undefined, `${id}: priority required`)
  assert(field !== undefined, `${id}: field required`)
  // new way, single function
  if (validateAndGetMessage) {
    assert(
      !shouldValidate,
      `${id}: shouldValidate must not be provided when using validateAndGetMessage`
    )
    assert(!isValid, `${id}: isValid must not be provided when using validateAndGetMessage`)
    assert(!getMessage, `${id}: getMessage must not be provided when using validateAndGetMessage`)
    assert(typeof validateAndGetMessage === 'function', `${id}: validate must be a function`)
  } else {
    // legacy way, 3 functions
    assert(shouldValidate, `${id}: shouldValidate required`)
    assert(isValid, `${id}: isValid required`)
    assert(getMessage, `${id}: getMessage required`)
  }

  return {
    id,
    shouldValidate,
    isValid,
    getMessage,
    type,
    priority,
    field,
    validateAndGetMessage,
    ...rest,
  }
}

export default createValidator
