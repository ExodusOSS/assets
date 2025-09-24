import { createSendValidation } from '../send-validation.js'

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
 * @deprecated use createSendValidation().validationHook
 *
 * Takes an object with the following properties:
 * @param {{ validations: Array<Validation>, logger:? typeof console, debounceTimeout:? typeof number }} options
 * @returns {(params: object) => { hasError: boolean, failedValidation: {} }} n
 */
const createAsyncValidationHook = ({ validations, ...rest }) =>
  createSendValidation({
    customValidations: validations,
    globalValidations: [],
    ...rest,
  }).validationHook

export default createAsyncValidationHook
