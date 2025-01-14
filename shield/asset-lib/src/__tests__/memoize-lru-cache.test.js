import { memoizeLruCache } from '../index.js'

describe('when catching an ASYNC function', () => {
  const expensiveFunction = jest.fn(({ name, value, error }) => {
    if (error) return Promise.reject(new Error(error))
    return Promise.resolve(`${name} => ${value}`)
  })

  beforeEach(() => {
    expensiveFunction.mockClear()
  })

  test('memoizeLruCache caches one value function', async () => {
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })

    await expect(memoize({ name: 'A', value: 1 })).resolves.toEqual('A => 1')
    await expect(memoize({ name: 'A', value: 2 })).resolves.toEqual('A => 1')

    await expect(memoize({ name: 'B', value: 11 })).resolves.toEqual('B => 11')

    await expect(memoize({ name: 'A', value: 3 })).resolves.toEqual('A => 1')
    await expect(memoize({ name: 'B', value: 22 })).resolves.toEqual('B => 11')
    await expect(memoize({ name: 'B', value: 33 })).resolves.toEqual('B => 11')

    expect(expensiveFunction).toBeCalledTimes(2)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, { name: 'A', value: 1 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'B', value: 11 })
  })

  test('memoizeLruCache recalls when max cache is reached', async () => {
    const expensiveFunction = jest.fn(({ name, value }) => Promise.resolve(`${name} => ${value}`))
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })

    await expect(memoize({ name: 'A', value: 1 })).resolves.toEqual('A => 1')
    await expect(memoize({ name: 'A', value: 2 })).resolves.toEqual('A => 1')

    await expect(memoize({ name: 'B', value: 11 })).resolves.toEqual('B => 11')
    await expect(memoize({ name: 'B', value: 22 })).resolves.toEqual('B => 11')

    await expect(memoize({ name: 'C', value: 111 })).resolves.toEqual('C => 111')
    await expect(memoize({ name: 'C', value: 222 })).resolves.toEqual('C => 111')

    await expect(memoize({ name: 'D', value: 1111 })).resolves.toEqual('D => 1111')
    await expect(memoize({ name: 'D', value: 2222 })).resolves.toEqual('D => 1111')

    await expect(memoize({ name: 'A', value: 3 })).resolves.toEqual('A => 3') // call again!

    expect(expensiveFunction).toBeCalledTimes(5)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, { name: 'A', value: 1 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'B', value: 11 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(3, { name: 'C', value: 111 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(4, { name: 'D', value: 1111 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(5, { name: 'A', value: 3 })
  })

  test('memoizeLruCache memoize should not cache rejections', async () => {
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })
    await expect(memoize({ name: 'A', value: 1, error: 'Break me 1' })).rejects.toThrowError(
      'Break me 1'
    )
    await expect(memoize({ name: 'A', value: 1 })).resolves.toEqual('A => 1') // The previous error was ignored and not cached :)
    await expect(memoize({ name: 'A', value: 2 })).resolves.toEqual('A => 1')
    await expect(memoize({ name: 'B', value: 1 })).resolves.toEqual('B => 1')
    await expect(memoize({ name: 'B', value: 1, error: 'Break me 2' })).resolves.toEqual('B => 1') // it's not breaking because using the cache.

    expect(expensiveFunction).toBeCalledTimes(3)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, {
      name: 'A',
      value: 1,
      error: 'Break me 1',
    })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'A', value: 1 }) // called again, error not cached.
    expect(expensiveFunction).toHaveBeenNthCalledWith(3, { name: 'B', value: 1 })
  })
})

describe('when catching A SYNC function', () => {
  const expensiveFunction = jest.fn(({ name, value, error }) => {
    if (error) throw new Error(error)
    return `${name} => ${value}`
  })

  beforeEach(() => {
    expensiveFunction.mockClear()
  })

  test('memoizeLruCache caches one value', () => {
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })

    expect(memoize({ name: 'A', value: 1 })).toEqual('A => 1')
    expect(memoize({ name: 'A', value: 2 })).toEqual('A => 1')

    expect(memoize({ name: 'B', value: 11 })).toEqual('B => 11')

    expect(memoize({ name: 'A', value: 3 })).toEqual('A => 1')
    expect(memoize({ name: 'B', value: 22 })).toEqual('B => 11')
    expect(memoize({ name: 'B', value: 33 })).toEqual('B => 11')

    expect(expensiveFunction).toBeCalledTimes(2)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, { name: 'A', value: 1 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'B', value: 11 })
  })

  test('memoizeLruCache recalls when max cache is reached', () => {
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })

    expect(memoize({ name: 'A', value: 1 })).toEqual('A => 1')
    expect(memoize({ name: 'A', value: 2 })).toEqual('A => 1')

    expect(memoize({ name: 'B', value: 11 })).toEqual('B => 11')
    expect(memoize({ name: 'B', value: 22 })).toEqual('B => 11')

    expect(memoize({ name: 'C', value: 111 })).toEqual('C => 111')
    expect(memoize({ name: 'C', value: 222 })).toEqual('C => 111')

    expect(memoize({ name: 'D', value: 1111 })).toEqual('D => 1111')
    expect(memoize({ name: 'D', value: 2222 })).toEqual('D => 1111')

    expect(memoize({ name: 'A', value: 3 })).toEqual('A => 3') // call again!

    expect(expensiveFunction).toBeCalledTimes(5)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, { name: 'A', value: 1 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'B', value: 11 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(3, { name: 'C', value: 111 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(4, { name: 'D', value: 1111 })
    expect(expensiveFunction).toHaveBeenNthCalledWith(5, { name: 'A', value: 3 })
  })

  test('memoizeLruCache memoize should not cache error, function is async', () => {
    const memoize = memoizeLruCache(expensiveFunction, ({ name }) => name, { max: 3 })
    expect(() => memoize({ name: 'A', value: 1, error: 'Break me 1' })).toThrowError('Break me 1')
    expect(memoize({ name: 'A', value: 1 })).toEqual('A => 1') // The previous error was ignored and not cached :)
    expect(memoize({ name: 'A', value: 2 })).toEqual('A => 1')
    expect(memoize({ name: 'B', value: 1 })).toEqual('B => 1')
    expect(memoize({ name: 'B', value: 1, error: 'Break me 2' })).toEqual('B => 1') // it's not breaking because using the cache.

    expect(expensiveFunction).toBeCalledTimes(3)
    expect(expensiveFunction).toHaveBeenNthCalledWith(1, {
      name: 'A',
      value: 1,
      error: 'Break me 1',
    })
    expect(expensiveFunction).toHaveBeenNthCalledWith(2, { name: 'A', value: 1 }) // called again, error not cached.
    expect(expensiveFunction).toHaveBeenNthCalledWith(3, { name: 'B', value: 1 })
  })
})
