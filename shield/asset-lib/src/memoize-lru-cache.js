import LRU from 'lru-cache'

/**
 * A count limited memoize. Cache is handled by 'lru-cache', removing the least-recently-used from it.
 *
 * const getSomeExpensiveValue = memoizeLruCache(
 *   someExpensiveFunction),
 *   (params) => params.someKey,
 *   { max: 100 }
 * )
 *
 * @param fn - the expensive function that calculates the value
 * @param resolver - the function to calculate the key for caching from the fn params.
 * @param options - the lru options, for example:  { max: 100 }
 * @returns {function(...[*]): *} a function that calls and caches the expensive fn. It returns the cached value if it's stored.
 */
export const memoizeLruCache = (fn, resolver, options) => {
  const cache = new LRU(options)
  return (...args) => {
    const key = resolver(...args)
    if (!cache.has(key)) {
      // result could be a promise or a real value.
      const result = fn(...args)
      cache.set(key, result)
      // works the same for promises or real values
      Promise.resolve(result).catch(() => cache.del(key))
    }

    return cache.get(key)
  }
}
