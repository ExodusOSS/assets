import { VALIDATION_TYPES } from './constants.js'
import sortValidationResults from './hooks/sortValidationResults.js'
import createValidator from './validations/createValidator.js'
import defaultGlobalValidations from './validations/global-validations.js'

function removeDuplicatesById(arr) {
  const seen = new Set()
  return arr.filter((item) => {
    const val = item.id
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

export const createSendValidation = ({
  logger = console,
  debounceTimeout,
  customizations = Object.create(null),
  customValidations = [],
  globalValidations = defaultGlobalValidations,
  useDebouncedCallback,
  useEffect,
  useState,
}) => {
  const runValidation = async ({ validation, props }) => {
    // 2 ways of creating a validation
    // New: single validate method that return true || t('some string Error'). Single validation method could be more efficient

    if (validation.validateAndGetMessage) {
      const result = await validation.validateAndGetMessage(props)
      if (result == null) {
        return
      }

      // note that empty means a "quite" error
      // result may be a i18n message component
      return result
    }

    // Legacy: split by shouldValidate, isValid and getMessage
    if ((await validation.shouldValidate(props)) && !(await validation.isValid(props))) {
      return (await validation.getMessage?.(props)) ?? ''
    }
  }

  const executeValidations = ({ validations, props }) => {
    return validations.map(async (validation) => {
      try {
        const message = await runValidation({ validation, props })
        if (message !== undefined) {
          return {
            ...validation,
            message,
            onLearnMorePress: validation.getOnLearnMorePress?.(props),
            bottomValidationComponent: validation.getComponent?.(props) ?? null,
            topValidationComponent: validation.getTopComponent?.(props) ?? null,
          }
        }
      } catch (error) {
        logger.error(
          `isValid of ${validation.id} threw an error. Please fix. ${error.message}`,
          error
        )
      }
    })
  }

  const resolveValidations = (props) => {
    const { asset } = props
    // presedence left to right, e.g. wallet or asset could customize one global generic validation
    const assetValidations = asset?.baseAsset?.api?.getSendValidations?.() || []
    // presedence left to right, e.g. wallet or asset could customize one global generic validation
    return removeDuplicatesById([...customValidations, ...assetValidations, ...globalValidations])
      .map((basicValidator) => {
        const customization = customizations[basicValidator.id] || {}
        try {
          return createValidator({
            ...basicValidator,
            ...customization,
          })
        } catch (error) {
          logger.error(
            `Error creating validator ${basicValidator.id}. Please fix. ${error.message}`,
            error
          )
        }
      })
      .filter(Boolean)
  }

  return {
    validate: async (props) => {
      const validations = resolveValidations(props)
      const validationResults = await Promise.all(executeValidations({ validations, props }))
      return sortValidationResults(validationResults.filter(Boolean))
    },

    validationHook: (props) => {
      if (!useDebouncedCallback) {
        throw new Error('useDebouncedCallback is required when creating the async validation hook')
      }

      if (!useState) {
        throw new Error('useState is required when creating the async validation hook')
      }

      if (!useEffect) {
        throw new Error('useEffect is required when creating the async validation hook')
      }

      const validations = resolveValidations(props)

      const [validationResults, setValidationResults] = useState({
        hasError: false,
        failedValidation: undefined,
      })

      const awaitPromises = async (promises) => {
        const validationResults = await Promise.all(promises)
        const sortedResults = sortValidationResults(validationResults.filter(Boolean))
        setValidationResults({
          hasError: sortedResults[0]?.type === VALIDATION_TYPES.ERROR,
          failedValidation: sortedResults[0],
        })
      }

      const awaitPromisesDebounced = useDebouncedCallback(awaitPromises, debounceTimeout)

      useEffect(() => {
        awaitPromisesDebounced(executeValidations({ validations, props }))
      }, [props])

      return validationResults
    },
  }
}
