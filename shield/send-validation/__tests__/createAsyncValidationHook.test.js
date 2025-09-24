import { t } from '@exodus/i18n-dummy'
import useDebouncedCallback from '@exodus/react-hooks/common/useDebouncedCallback.js'
import { renderHook } from '@testing-library/react-hooks/native/index.js'
import { useEffect, useMemo, useState } from 'react'

import {
  CAN_SEND_ZERO_AMOUNT,
  FIELDS,
  PRIORITY_LEVELS,
  VALIDATION_TYPES,
} from '../src/constants.js'
import createAsyncValidationHook from '../src/hooks/createAsyncValidationHook.js'
import ZERO_AMOUNT from '../src/validations/ZERO_AMOUNT.js'

const implementations = [
  ZERO_AMOUNT,
  {
    id: 'ZERO_AMOUNT_NEW',
    type: VALIDATION_TYPES.ERROR,
    field: FIELDS.AMOUNT,
    priority: PRIORITY_LEVELS.BASE,

    validateAndGetMessage: async ({ asset, destinationAddress, sendAmount }) => {
      if (
        sendAmount &&
        !CAN_SEND_ZERO_AMOUNT.includes(asset.name) &&
        !!destinationAddress &&
        sendAmount.isZero
      ) {
        return t(`${asset.displayName} doesn't allow sending zero.`)
      }
    },
  },
]

describe('createValidationHook legacy', () => {
  const throwingValidation = {
    id: 'THROWING_VALIDATION',
    type: VALIDATION_TYPES.ERROR,
    field: FIELDS.AMOUNT,
    shouldValidate: () => true,
    isValid: () => {
      throw new Error('Failed hard')
    },
    getMessage: () => 'Error',
    priority: PRIORITY_LEVELS.BASE,
  }

  for (const validator of implementations) {
    it('should still execute other validations if one throws', async () => {
      const logger = { error: jest.fn() }

      const useValidation = createAsyncValidationHook({
        validations: [validator, throwingValidation],
        logger,
        useState,
        useDebouncedCallback,
        useEffect,
        useMemo,
      })

      const props = {
        sendAmount: { isZero: true },
        asset: { name: 'bitcoin', displayName: 'Bitcoin' },
        destinationAddress: 'abc',
      }

      const { result, waitFor } = renderHook(() => useValidation(props))

      await waitFor(() => {
        return !!result.current.hasError
      })

      expect(logger.error).toHaveBeenCalledWith(
        'isValid of THROWING_VALIDATION threw an error. Please fix. Failed hard',
        expect.any(Error)
      )

      expect(result.current.hasError).toBe(true)
      expect(result.current.failedValidation.id).toEqual(validator.id)
    })
  }
})
