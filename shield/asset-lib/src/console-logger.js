/**
 * A basic implementation of logger that console outs messages prefixing a namespace.
 *
 * Clients could use this implementation or provide their one when using this library. Examples:
 *
 * - A logger that uses 'debug' library.
 * - A logger that doesn't use console.error/warning to avoid nasty user messages in mobile.
 *
 * @param  namespace {string} = the namespace to prefix all the consoled out messages.
 * @returns a new logger instance. It's just a console wrapper with prefixed messages.
 */
export const createConsoleLogger = (namespace) => ({
  trace: (...args) => console.trace(`[${namespace}:trace]`, ...args),
  debug: (...args) => console.debug(`[${namespace}:debug]`, ...args),
  log: (...args) => console.log(`[${namespace}]`, ...args),
  info: (...args) => console.info(`[${namespace}:info]`, ...args),
  warn: (...args) => console.warn(`[${namespace}:warn]`, ...args),
  error: (...args) => console.error(`[${namespace}:error]`, ...args),
})
