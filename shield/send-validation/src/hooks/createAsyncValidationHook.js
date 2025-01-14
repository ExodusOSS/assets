import useDebouncedCallback from '@exodus/react-hooks/common/useDebouncedCallback.js'
import { useEffect, useMemo, useState } from 'react'

import { VALIDATION_TYPES } from '../constants.js'
import sortValidationResults from './sortValidationResults.js'

/**
 * A song
 * @typedef {object} Validation
 * @property {string} id - unique id
 * @property {string} type - VALIDATION_TYPES
 * @property {(params: object) => boolean} shouldValidate - switch function to stop/run validation
 * @property {(params: object) => string} getMessage - print error message as text
 * @property {(params: object) => string=} getComponent - show error message as component
 * @property {(params: object) => string=} getTopComponent - show error message as component
 * @property {(params: object) => boolean} isValid - validation function, check valid conditions here
 */

/**
 * Creates an async validation hook
 *
 * Takes an object with the following properties:
 * @param {{ validations: Array<Validation>, logger:? typeof console, debounceTimeout:? typeof number }} options
 * @returns {(params: object) => { hasError: boolean, failedValidation: {} }} n
 */
const createAsyncValidationHook = ({ validations, logger = console, debounceTimeout = 500 }) => {
  return (_props) => {
    const [validationResults, setValidationResults] = useState({
      hasError: false,
      failedValidation: undefined,
    })

    const executedPromises = async (promises) => {
      const validationResults = await Promise.all(promises)
      const sortedResults = sortValidationResults(validationResults.filter(Boolean))
      setValidationResults({
        hasError:
          sortedResults &&
          sortedResults.some((validation) => validation.type === VALIDATION_TYPES.ERROR),
        failedValidation: sortValidationResults ? sortedResults[0] : undefined,
      })
    }

    const executedPromisesDebounced = useDebouncedCallback(executedPromises, debounceTimeout)

    const props = useMemo(() => _props, Object.values(_props))

    useEffect(() => {
      executedPromisesDebounced(
        validations
          .filter((validation) => validation.shouldValidate(props))
          .map(async (validation) => {
            try {
              const isValid = await validation.isValid(props)
              if (isValid) return
              return {
                ...validation,
                message: validation.getMessage?.(props) ?? '',
                bottomValidationComponent: validation.getComponent?.(props) ?? null,
                topValidationComponent: validation.getTopComponent?.(props) ?? null,
              }
            } catch (error) {
              logger.error(`isValid of ${validation.id} threw an error. Please fix.`, error.message)
            }
          })
      )
    }, [props])

    return validationResults
  }
}

export default createAsyncValidationHook
