// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// eslint-disable-next-line @typescript-eslint/ban-types
let captureStackTrace: (targetObject: object, constructorOpt?: Function) => void

if (typeof Error.captureStackTrace !== 'undefined') {
  captureStackTrace = Error.captureStackTrace.bind(Error)
} else {
  try {
    const createError = (message?: string) => {
      try {
        throw new Error(message)
      } catch (err) {
        return err
      }
    }
    const getStackString = (error) => error.stack || error.stacktrace

    const testStackString = getStackString(createError('Marker'))
    if (!testStackString) {
      throw new Error('No Error.prototype.stack')
    }

    const hasHeader = /Marker/.test(testStackString.split('\n')[0])

    captureStackTrace = function (throwable) {
      const stackString = getStackString(createError())
      if (stackString === undefined) {
        return
      }

      const captured = stackString
        .trim()
        .split('\n')
        .slice(hasHeader ? 4 : 3)
      let stack
      Object.defineProperties(throwable, {
        stack: {
          configurable: true,
          get: function () {
            if (stack !== undefined) {
              return stack
            }

            stack = [
              `${throwable.name || 'Error'}: ${throwable.message || ''}`,
              ...captured,
            ].join('\n')
            return stack
          },
        },
      })
    }
  } catch (err) {
    // `Error.prototype.stack` is unsupported.
    // Not much that we can do here, fall back to just header.
    captureStackTrace = function (throwable) {
      let stack
      Object.defineProperties(throwable, {
        stack: {
          configurable: true,
          get: function () {
            if (stack !== undefined) {
              return stack
            }

            stack = `${throwable.name || 'Error'}: ${throwable.message || ''}`
            return stack
          },
        },
      })
    }
  }
}

export default captureStackTrace
