import assert from 'minimalistic-assert'

const createValidator = ({
  id,
  shouldValidate,
  isValid,
  type,
  priority,
  field,
  getMessage,
  ...rest
}) => {
  assert(id, 'id required')
  assert(shouldValidate, 'shouldValidate required')
  assert(isValid, 'isValid required')
  assert(type !== undefined, 'type required')
  assert(priority !== undefined, 'priority required')
  assert(field !== undefined, 'field required')
  assert(getMessage, 'getMessage required')

  return {
    id,
    shouldValidate,
    isValid,
    getMessage,
    type,
    priority,
    field,
    ...rest,
  }
}

export default createValidator
