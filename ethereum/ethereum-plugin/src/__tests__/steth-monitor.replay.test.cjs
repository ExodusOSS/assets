globalThis.MONITOR_NO_WEBSOCKET = true // TODO: refactor
globalThis.MONITOR_TEST_OFFLINE = true // TODO: refactor
jest.exodus.mock.fetchReplay()

import('./steth-monitor.integration.test.js')
