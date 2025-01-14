import { createConsoleLogger } from '../console-logger.js'
import { consoleMock } from './console-mock.js'

afterEach(() => {
  Object.values(consoleMock).forEach((fn) => fn.mockReset())
})

test('createConsoleLogger can log', () => {
  const logger = createConsoleLogger('my-namespace')
  logger.trace('some trace')
  logger.debug('some debug')
  logger.log('some log')
  logger.info('some info')
  logger.warn('some warn')
  logger.error('some error')

  expect(consoleMock.trace).toHaveBeenNthCalledWith(1, '[my-namespace:trace]', 'some trace')
  expect(consoleMock.debug).toHaveBeenNthCalledWith(1, '[my-namespace:debug]', 'some debug')
  expect(consoleMock.log).toHaveBeenNthCalledWith(1, '[my-namespace]', 'some log')
  expect(consoleMock.info).toHaveBeenNthCalledWith(1, '[my-namespace:info]', 'some info')
  expect(consoleMock.warn).toHaveBeenNthCalledWith(1, '[my-namespace:warn]', 'some warn')
  expect(consoleMock.error).toHaveBeenNthCalledWith(1, '[my-namespace:error]', 'some error')
})
