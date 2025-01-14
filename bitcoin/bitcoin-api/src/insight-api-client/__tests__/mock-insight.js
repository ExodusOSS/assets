import InsightAPIClient from '../index.js'

// mocking all network just in case
jest.exodus.mock.fetchNoop()
jest.exodus.mock.websocketNoop()

// Replace all class methods with empty mocks
const descriptors = Object.getOwnPropertyDescriptors(InsightAPIClient.prototype)
for (const [name, { value }] of Object.entries(descriptors)) {
  if (typeof value === 'function') InsightAPIClient.prototype[name] = jest.fn()
}
