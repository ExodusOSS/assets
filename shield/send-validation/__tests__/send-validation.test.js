import { FIELDS, PRIORITY_LEVELS, VALIDATION_TYPES } from '../src/constants.js'
import { createSendValidation } from '../src/send-validation.js'

const mockLogger = { error: jest.fn() }
const getI18NMessage = jest.fn()

const asset = {
  baseAsset: {
    api: {
      getSendValidations: jest.fn(() => [
        {
          id: 'asset-validation',
          shouldValidate: jest.fn(() => true),
          isValid: jest.fn(() => Promise.resolve(false)),
          getMessage: jest.fn(() => 'Asset validation failed'),
          type: VALIDATION_TYPES.ERROR,
          priority: PRIORITY_LEVELS.TOP,
          field: FIELDS.AMOUNT,
        },
      ]),
    },
  },
}

describe('createSendValidation', () => {
  test('runs all validations and returns sorted results', async () => {
    const sendValidation = createSendValidation({
      logger: mockLogger,
      debounceTimeout: 300,
      getI18NMessage,
      customizations: {},
      globalValidations: [],
      customValidations: [
        {
          id: 'custom-validation',
          shouldValidate: jest.fn(() => true),
          isValid: jest.fn(() => Promise.resolve(false)),
          getMessage: jest.fn(() => 'Custom validation failed'),
          type: VALIDATION_TYPES.ERROR,
          priority: PRIORITY_LEVELS.BASE,
          field: FIELDS.AMOUNT,
        },
      ],
    })

    const props = { asset }

    const results = await sendValidation.validate(props)

    expect(results).toHaveLength(2)
    expect(results[0].message).toEqual('Asset validation failed')
    expect(results[1].message).toEqual('Custom validation failed')
    expect(mockLogger.error).not.toHaveBeenCalled()
  })

  it('returns early if validation is valid', async () => {
    const validation = {
      id: 'valid-validation',
      shouldValidate: () => true,
      isValid: () => Promise.resolve(true),
      type: VALIDATION_TYPES.ERROR,
      priority: PRIORITY_LEVELS.BASE,
      field: FIELDS.AMOUNT,
      getMessage: () => 'Failed',
    }

    const sendValidation = createSendValidation({
      logger: mockLogger,
      debounceTimeout: 300,
      getI18NMessage,
      globalValidations: [],
      customValidations: [validation],
      customizations: {
        'asset-validation': {
          isValid: () => Promise.resolve(true),
        },
      },
    })

    const results = await sendValidation.validate({ asset })
    expect(results).toHaveLength(0)
    expect(mockLogger.error).not.toHaveBeenCalled()
  })

  test('handles errors in validation gracefully', async () => {
    const brokenValidation = {
      id: 'broken',
      shouldValidate: () => true,
      isValid: () => Promise.reject(new Error('boom')),
      type: VALIDATION_TYPES.ERROR,
      priority: PRIORITY_LEVELS.BASE,
      field: FIELDS.AMOUNT,
      getMessage: () => 'Failed',
    }

    const sendValidation = createSendValidation({
      logger: mockLogger,
      debounceTimeout: 300,
      getI18NMessage,
      globalValidations: [],
      customValidations: [brokenValidation],
      customizations: {
        'asset-validation': {
          isValid: () => Promise.resolve(true),
        },
      },
    })

    const results = await sendValidation.validate({ asset })
    expect(results).toHaveLength(0)
    expect(mockLogger.error).toHaveBeenCalledWith(
      'isValid of broken threw an error. Please fix. boom',
      expect.any(Error)
    )
  })
})
