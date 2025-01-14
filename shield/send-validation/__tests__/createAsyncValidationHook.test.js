import { renderHook } from '@testing-library/react-hooks'

import { PRIORITY_LEVELS, VALIDATION_TYPES } from '../src/constants.js'
import createAsyncValidationHook from '../src/hooks/createAsyncValidationHook.js'
import ZERO_AMOUNT from '../src/validations/ZERO_AMOUNT.js'

describe('createValidationHook', () => {
  const throwingValidation = {
    id: 'THROWING_VALIDATION',
    type: VALIDATION_TYPES.ERROR,

    shouldValidate: () => true,
    isValid: () => {
      throw new Error('Failed hard')
    },
    priority: PRIORITY_LEVELS.BASE,
  }

  it('should still execute other validations if one throws', async () => {
    const logger = { error: jest.fn() }

    const useValidation = createAsyncValidationHook({
      validations: [ZERO_AMOUNT, throwingValidation],
      logger,
    })

    const props = {
      sendAmount: { isZero: true },
    }

    const { result, waitFor } = renderHook(() => useValidation(props))

    await waitFor(() => !!result.current.hasError)

    expect(logger.error).toHaveBeenCalledWith(
      `isValid of THROWING_VALIDATION threw an error. Please fix.`,
      'Failed hard'
    )

    expect(result.current.hasError).toBe(true)
    expect(result.current.failedValidation.id).toEqual('ZERO_AMOUNT')
  })
})
