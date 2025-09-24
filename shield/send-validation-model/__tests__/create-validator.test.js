import sendValidationModel from '../src/index.js'

const { createValidator, FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } = sendValidationModel

describe('createValidator legacy', () => {
  const baseValidatorProps = {
    id: 'test-validator-legacy',
    shouldValidate: () => true,
    isValid: () => true,
    getMessage: () => 'All good',
  }

  it('creates a validator with all default values', () => {
    const validator = createValidator(baseValidatorProps)

    expect(validator).toEqual({
      ...baseValidatorProps,
      type: VALIDATION_TYPES.ERROR,
      priority: PRIORITY_LEVELS.BASE,
      field: FIELDS.AMOUNT,
    })
  })

  it('creates a validator with custom type, priority, and field', () => {
    const customProps = {
      ...baseValidatorProps,
      type: VALIDATION_TYPES.WARN,
      priority: PRIORITY_LEVELS.TOP,
      field: FIELDS.ADDRESS,
    }

    const validator = createValidator(customProps)

    expect(validator.type).toBe(VALIDATION_TYPES.WARN)
    expect(validator.priority).toBe(PRIORITY_LEVELS.TOP)
    expect(validator.field).toBe(FIELDS.ADDRESS)
  })

  it('includes additional props in the returned object', () => {
    const extraProps = {
      ...baseValidatorProps,
      extraKey: 'extraValue',
    }

    const validator = createValidator(extraProps)
    expect(validator.extraKey).toBe('extraValue')
  })

  describe('validation of required fields', () => {
    const requiredFields = ['id', 'shouldValidate', 'isValid', 'getMessage']

    requiredFields.forEach((field) => {
      it(`throws an error if ${field} is missing`, () => {
        const props = { ...baseValidatorProps }
        delete props[field]

        expect(() => createValidator(props)).toThrow(new RegExp(`${field}.*required`))
      })
    })
  })

  it('does not throw when optional fields are passed explicitly', () => {
    const props = {
      ...baseValidatorProps,
      type: VALIDATION_TYPES.INFO,
      priority: PRIORITY_LEVELS.MIDDLE,
      field: FIELDS.MEMO,
    }

    expect(() => createValidator(props)).not.toThrow()
  })
})

describe('createValidator new', () => {
  const baseValidatorProps = {
    id: 'test-validator-new',
    validateAndGetMessage: () => Promise.resolve(),
  }

  it('creates a validator with all default values', () => {
    const validator = createValidator(baseValidatorProps)

    expect(validator).toEqual({
      ...baseValidatorProps,
      type: VALIDATION_TYPES.ERROR,
      priority: PRIORITY_LEVELS.BASE,
      field: FIELDS.AMOUNT,
    })
  })

  it('creates a validator with custom type, priority, and field', () => {
    const customProps = {
      ...baseValidatorProps,
      type: VALIDATION_TYPES.WARN,
      priority: PRIORITY_LEVELS.TOP,
      field: FIELDS.ADDRESS,
    }

    const validator = createValidator(customProps)

    expect(validator.type).toBe(VALIDATION_TYPES.WARN)
    expect(validator.priority).toBe(PRIORITY_LEVELS.TOP)
    expect(validator.field).toBe(FIELDS.ADDRESS)
  })

  it('includes additional props in the returned object', () => {
    const extraProps = {
      ...baseValidatorProps,
      extraKey: 'extraValue',
    }

    const validator = createValidator(extraProps)
    expect(validator.extraKey).toBe('extraValue')
  })

  it('does not throw when optional fields are passed explicitly', () => {
    const props = {
      ...baseValidatorProps,
      type: VALIDATION_TYPES.INFO,
      priority: PRIORITY_LEVELS.MIDDLE,
      field: FIELDS.MEMO,
    }
    expect(() => createValidator(props)).not.toThrow()
  })
})
