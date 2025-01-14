import { createLimiter } from '../limit-concurrency.js'

test('createLimiter with concurrency 2 and one callback', async () => {
  const run1 = jest.fn()
  const debug = jest.fn()
  const limiter = createLimiter({ name: 'some-namespace', concurrency: 2, logger: { debug } })
  await Promise.all([limiter(run1)])
  expect(run1).toHaveBeenCalledTimes(1)

  expect(debug.mock.calls).toEqual([
    ['running some-namespace, in progress: 1 max concurrency: 2'],
    ['finished some-namespace, in progress: 0 max concurrency: 2'],
  ])
})

test('createLimiter with concurrency 2 no delay callbacks', async () => {
  const run1 = jest.fn()
  const run2 = jest.fn()
  const run3 = jest.fn()
  const debug = jest.fn()
  const limiter = createLimiter({ name: 'some-namespace', concurrency: 2, logger: { debug } })
  await Promise.all([limiter(run1), limiter(run2), limiter(run3)])
  expect(run1).toHaveBeenCalledTimes(1)
  expect(run2).toHaveBeenCalledTimes(1)
  expect(run3).toHaveBeenCalledTimes(1)

  expect(run1).toHaveBeenCalledBefore(run2)
  expect(run2).toHaveBeenCalledBefore(run3)

  expect(debug.mock.calls).toEqual([
    ['running some-namespace, in progress: 1 max concurrency: 2'],
    ['running some-namespace, in progress: 2 max concurrency: 2'],
    ['finished some-namespace, in progress: 1 max concurrency: 2'],
    ['finished some-namespace, in progress: 0 max concurrency: 2'],
    ['running some-namespace, in progress: 1 max concurrency: 2'],
    ['finished some-namespace, in progress: 0 max concurrency: 2'],
  ])
})

test('createLimiter with concurrency 4 no delay callbacks', async () => {
  const run1 = jest.fn()
  const run2 = jest.fn()
  const run3 = jest.fn()
  const debug = jest.fn()
  const limiter = createLimiter({ name: 'some-namespace', concurrency: 4, logger: { debug } })
  await Promise.all([limiter(run1), limiter(run2), limiter(run3)])
  expect(run1).toHaveBeenCalledTimes(1)
  expect(run2).toHaveBeenCalledTimes(1)
  expect(run3).toHaveBeenCalledTimes(1)

  expect(run1).toHaveBeenCalledBefore(run2)
  expect(run2).toHaveBeenCalledBefore(run3)

  expect(debug.mock.calls).toEqual([
    ['running some-namespace, in progress: 1 max concurrency: 4'],
    ['running some-namespace, in progress: 2 max concurrency: 4'],
    ['running some-namespace, in progress: 3 max concurrency: 4'],
    ['finished some-namespace, in progress: 2 max concurrency: 4'],
    ['finished some-namespace, in progress: 1 max concurrency: 4'],
    ['finished some-namespace, in progress: 0 max concurrency: 4'],
  ])
})

test('createLimiter with concurrency 0 no delay callbacks', async () => {
  const run1 = jest.fn()
  const run2 = jest.fn()
  const run3 = jest.fn()
  const debug = jest.fn()
  const limiter = createLimiter({ name: 'some-namespace', concurrency: 0, logger: { debug } })
  await Promise.all([limiter(run1), limiter(run2), limiter(run3)])
  expect(run1).toHaveBeenCalledTimes(1)
  expect(run2).toHaveBeenCalledTimes(1)
  expect(run3).toHaveBeenCalledTimes(1)

  expect(run1).toHaveBeenCalledBefore(run2)
  expect(run2).toHaveBeenCalledBefore(run3)

  expect(debug.mock.calls).toEqual([
    ['running some-namespace, in progress: 1 unlimited concurrency'],
    ['running some-namespace, in progress: 2 unlimited concurrency'],
    ['running some-namespace, in progress: 3 unlimited concurrency'],
    ['finished some-namespace, in progress: 2 unlimited concurrency'],
    ['finished some-namespace, in progress: 1 unlimited concurrency'],
    ['finished some-namespace, in progress: 0 unlimited concurrency'],
  ])
})

test('createLimiter with concurrency 2 with delay callbacks', async () => {
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const delayCall = (fn, ms) => {
    return async () => {
      await delay(ms)
      await fn()
    }
  }

  const run1 = jest.fn()
  const run2 = jest.fn()
  const run3 = jest.fn()
  const debug = jest.fn()
  const limiter = createLimiter({ name: 'some-namespace', concurrency: 2, logger: { debug } })
  const promise1 = limiter(delayCall(run1, 20))
  const promise2 = limiter(delayCall(run2, 5))
  const promise3 = limiter(delayCall(run3, 10))
  await Promise.all([promise1, promise2, promise3])
  expect(run1).toHaveBeenCalledTimes(1)
  expect(run2).toHaveBeenCalledTimes(1)
  expect(run3).toHaveBeenCalledTimes(1)

  expect(run2).toHaveBeenCalledBefore(run3)
  expect(run2).toHaveBeenCalledBefore(run1)

  expect(debug.mock.calls).toEqual([
    ['running some-namespace, in progress: 1 max concurrency: 2'],
    ['running some-namespace, in progress: 2 max concurrency: 2'],
    ['finished some-namespace, in progress: 1 max concurrency: 2'],
    ['running some-namespace, in progress: 2 max concurrency: 2'],
    ['finished some-namespace, in progress: 1 max concurrency: 2'],
    ['finished some-namespace, in progress: 0 max concurrency: 2'],
  ])
})
