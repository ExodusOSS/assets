import makeConcurrent from 'make-concurrent'
import assert from 'minimalistic-assert'

/**
 * Creates a limited runner that only runs callback up to a concurrency level. For example:
 *
 *  const limiter = createLimiter({ name: 'some-namespace', concurrency: 2, logger:logger })
 *  const promise1 = limiter.run(callback1)
 *  const promise2 = limiter.run(callback2)
 *  const promise3 = limiter.run(callback3)
 *  await Promise.all([promise1, promise2, promise3])
 *
 *  Only two callbacks run in parallel. Promise3 will be executed once either promise1 or promise2 have finished.
 *
 *
 * If concurrency is 0 or lower
 *
 *  const limiter = createLimiter({ name: 'some-namespace', concurrency: 0, logger:logger })
 *  const promise1 = limiter.run(callback1)
 *  const promise2 = limiter.run(callback2)
 *  const promise3 = limiter.run(callback3)
 *  await Promise.all([promise1, promise2, promise3])
 *
 *  All promises will run together.
 *
 * @param name {string} - the name for logging
 * @param concurrency {number} - how many
 * @param logger {Object} - the logger
 * @returns {{run: ((function(*): Promise<*|undefined>)|*), wrap: (function(*): function(...[*]): Promise<*|undefined>)}} an object with the runner (run) and a high order runner (wrap).
 */
export const createLimiter = ({ name, concurrency, logger }) => {
  assert(name, 'name is required')
  assert(concurrency !== undefined, 'concurrency is required')
  assert(logger, 'logger is required')
  let inProgress = 0
  const unlimited = concurrency < 1
  const concurrencyText = unlimited ? 'unlimited concurrency' : 'max concurrency: ' + concurrency
  const _run = async (fn) => {
    logger.debug(`running ${name}, in progress: ${++inProgress} ${concurrencyText}`)
    try {
      return await fn()
    } finally {
      logger.debug(`finished ${name}, in progress: ${--inProgress} ${concurrencyText}`)
    }
  }

  return unlimited ? _run : makeConcurrent(_run, { concurrency })
}
