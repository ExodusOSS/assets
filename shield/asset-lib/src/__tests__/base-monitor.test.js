import { BaseMonitor } from '../base-monitor.js'
import { consoleMock } from './console-mock.js'

const tick = jest.fn()

const hooks = {
  beforeStart: jest.fn(),
  afterStart: jest.fn(),
  beforeTick: jest.fn(),
  afterTick: jest.fn(),
  beforeStop: jest.fn(),
  afterStop: jest.fn(),
  beforeUpdate: jest.fn(),
  afterUpdate: jest.fn(),
  beforeTickMultipleWalletAccounts: jest.fn(),
  afterTickMultipleWalletAccounts: jest.fn(),
}

const listeners = {
  beforeStart: jest.fn(),
  afterStart: jest.fn(),
  beforeTick: jest.fn(),
  afterTick: jest.fn(),
  beforeStop: jest.fn(),
  afterStop: jest.fn(),
  beforeUpdate: jest.fn(),
  afterUpdate: jest.fn(),
  beforeTickMultipleWalletAccounts: jest.fn(),
  afterTickMultipleWalletAccounts: jest.fn(),
}

const tickWalletAccountsCallback = jest.fn()

class HelloMonitor extends BaseMonitor {
  setServer(servers) {
    this.servers = servers
  }

  tick(arg) {
    return tick(arg)
  }

  tickWalletAccounts(arg) {
    tickWalletAccountsCallback()
    return super.tickWalletAccounts(arg)
  }
}

expect(HelloMonitor.name).toEqual('HelloMonitor')
Object.defineProperty(HelloMonitor, 'name', { value: 'HelloMonitorStaticName' })
expect(HelloMonitor.name).toEqual('HelloMonitorStaticName')

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

afterEach(() => {
  jest.clearAllMocks()
})

function createMonitor() {
  // Given
  const asset = { name: 'myCoin' }
  const interval = 15
  const walletAccount1 = 'wallet_1'
  const walletAccount2 = 'wallet 2'
  const walletAccounts = [walletAccount1, walletAccount2]
  const walletAccountsMap = { [asset.name]: walletAccounts }
  const assetClientInterface = {
    getWalletAccounts: ({ assetName }) => {
      return Promise.resolve(walletAccountsMap[assetName])
    },
  }

  const options = { o1: '1', o2: 2 }
  const params = { p1: '11', p2: 22 }

  // create and start
  const monitor = new HelloMonitor({ asset, interval, assetClientInterface })
  monitor.setParams(params)
  monitor.addHook('before-start', hooks.beforeStart)
  monitor.addHook('after-start', hooks.afterStart)
  monitor.addHook('before-tick', hooks.beforeTick)
  monitor.addHook('after-tick', hooks.afterTick)
  monitor.addHook('before-stop', hooks.beforeStop)
  monitor.addHook('after-stop', hooks.afterStop)
  monitor.addHook('before-update', hooks.beforeUpdate)
  monitor.addHook('after-update', hooks.afterUpdate)
  monitor.addHook('before-tick-multiple-wallet-accounts', hooks.beforeTickMultipleWalletAccounts)
  monitor.addHook('after-tick-multiple-wallet-accounts', hooks.afterTickMultipleWalletAccounts)

  monitor.addListener('before-start', listeners.beforeStart)
  monitor.addListener('after-start', listeners.afterStart)
  monitor.addListener('before-tick', listeners.beforeTick)
  monitor.addListener('after-tick', listeners.afterTick)
  monitor.addListener('before-stop', listeners.beforeStop)
  monitor.addListener('after-stop', listeners.afterStop)
  monitor.addListener('before-update', listeners.beforeUpdate)
  monitor.addListener('after-update', listeners.afterUpdate)
  monitor.addListener(
    'before-tick-multiple-wallet-accounts',
    listeners.beforeTickMultipleWalletAccounts
  )
  monitor.addListener(
    'after-tick-multiple-wallet-accounts',
    listeners.afterTickMultipleWalletAccounts
  )

  return { walletAccounts, walletAccount1, walletAccount2, options, monitor, params }
}

test('can create and start monitor', async () => {
  // create and start
  const { walletAccounts, walletAccount1, walletAccount2, options, monitor } = createMonitor()
  expect(tickWalletAccountsCallback).toHaveBeenCalledTimes(0)
  await monitor.start(options)
  // then
  expect(hooks.afterStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(hooks.beforeStart).toHaveBeenNthCalledWith(1, { ...options, monitor })

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.beforeTick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(2, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })

  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStop).not.toHaveBeenCalled()
  expect(hooks.beforeUpdate).not.toHaveBeenCalled()
  expect(hooks.afterUpdate).not.toHaveBeenCalled()

  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(1)
  expect(monitor.tickCount[walletAccount2]).toEqual(1)

  expect(tickWalletAccountsCallback).toHaveBeenCalledTimes(1)

  expect(hooks.beforeTickMultipleWalletAccounts).toHaveBeenCalledTimes(1)
  expect(hooks.beforeTickMultipleWalletAccounts).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    monitor,
    walletAccounts,
  })

  expect(hooks.afterTickMultipleWalletAccounts).toHaveBeenCalledTimes(1)
  expect(hooks.afterTickMultipleWalletAccounts).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    monitor,
    walletAccounts,
  })

  await monitor.stop()
})

test('can create, start monitor and delay', async () => {
  // create and start
  const { walletAccount1, walletAccount2, options, monitor } = createMonitor()
  await monitor.start(options)
  // then
  expect(hooks.beforeStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(hooks.afterStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(listeners.beforeStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(listeners.afterStart).toHaveBeenNthCalledWith(1, { ...options, monitor })

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.beforeTick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(2, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })

  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStop).not.toHaveBeenCalled()
  expect(hooks.beforeUpdate).not.toHaveBeenCalled()
  expect(hooks.afterUpdate).not.toHaveBeenCalled()

  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(1)
  expect(monitor.tickCount[walletAccount2]).toEqual(1)
  expect(tick).not.toHaveBeenNthCalledWith(3)
  expect(tick).not.toHaveBeenNthCalledWith(4)

  await delay(15)

  // Second call.
  expect(tick).toHaveBeenNthCalledWith(3, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(4, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(2)
  expect(monitor.tickCount[walletAccount2]).toEqual(2)

  await monitor.stop()
})

test('can create, start monitor and delay', async () => {
  // create and start
  const { walletAccount1, walletAccount2, options, monitor } = createMonitor()
  await monitor.start(options)
  // then
  expect(hooks.beforeStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(hooks.afterStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(listeners.beforeStart).toHaveBeenNthCalledWith(1, { ...options, monitor })
  expect(listeners.afterStart).toHaveBeenNthCalledWith(1, { ...options, monitor })

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.beforeTick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(2, {
    error: null,
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
    monitor,
  })

  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStop).not.toHaveBeenCalled()
  expect(hooks.beforeUpdate).not.toHaveBeenCalled()
  expect(hooks.afterUpdate).not.toHaveBeenCalled()

  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(1)
  expect(monitor.tickCount[walletAccount2]).toEqual(1)
  expect(tickWalletAccountsCallback).toHaveBeenCalledTimes(1)
  expect(tick).not.toHaveBeenNthCalledWith(3)
  expect(tick).not.toHaveBeenNthCalledWith(4)

  await delay(20)

  // Second call.
  expect(tick).toHaveBeenNthCalledWith(3, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(4, {
    highPriority: undefined,
    refresh: undefined,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(2)
  expect(monitor.tickCount[walletAccount2]).toEqual(2)
  expect(tickWalletAccountsCallback).toHaveBeenCalledTimes(2)
  expect(hooks.beforeTickMultipleWalletAccounts).toHaveBeenCalledTimes(2)
  expect(hooks.afterTickMultipleWalletAccounts).toHaveBeenCalledTimes(2)
  expect(listeners.beforeTickMultipleWalletAccounts).toHaveBeenCalledTimes(2)
  expect(listeners.afterTickMultipleWalletAccounts).toHaveBeenCalledTimes(2)

  await monitor.stop()
})

test('can create, start monitor and delay using refresh on start', async () => {
  // create and start
  const { walletAccount1, walletAccount2, options, monitor } = createMonitor()
  await monitor.start({ ...options, refresh: true })
  // then
  expect(hooks.beforeStart).toHaveBeenNthCalledWith(1, { ...options, refresh: true, monitor })
  expect(hooks.afterStart).toHaveBeenNthCalledWith(1, { ...options, refresh: true, monitor })
  expect(listeners.beforeStart).toHaveBeenNthCalledWith(1, { ...options, refresh: true, monitor })
  expect(listeners.afterStart).toHaveBeenNthCalledWith(1, { ...options, refresh: true, monitor })

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.beforeTick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount2,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(2, {
    error: null,
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount2,
    monitor,
  })

  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStop).not.toHaveBeenCalled()
  expect(hooks.beforeUpdate).not.toHaveBeenCalled()
  expect(hooks.afterUpdate).not.toHaveBeenCalled()

  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(2, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount2,
  })
  expect(monitor.tickCount[walletAccount1]).toEqual(1)
  expect(monitor.tickCount[walletAccount2]).toEqual(1)
  expect(tick).not.toHaveBeenNthCalledWith(3)
  expect(tick).not.toHaveBeenNthCalledWith(4)

  await delay(20)

  // Second call.
  expect(tick).toHaveBeenNthCalledWith(3, {
    highPriority: undefined,
    refresh: undefined, // after first call, no more refresh
    walletAccount: walletAccount1,
  })
  expect(tick).toHaveBeenNthCalledWith(4, {
    highPriority: undefined,
    refresh: undefined, // after first call, no more refresh
    walletAccount: walletAccount2,
  })
  // Time sensitive. Fix me!
  expect([2, 3]).toContain(monitor.tickCount[walletAccount1])
  expect([2, 3]).toContain(monitor.tickCount[walletAccount2])

  await monitor.stop()
})

test('can create and update with highPriority true', async () => {
  const { walletAccount1, monitor } = createMonitor()
  await monitor.update({ highPriority: true })

  expect(hooks.beforeUpdate).toHaveBeenNthCalledWith(1, { monitor, highPriority: true })
  expect(hooks.afterUpdate).toHaveBeenNthCalledWith(1, { error: null, monitor, highPriority: true })
  expect(hooks.beforeStart).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()
  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: true,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: true,
    refresh: undefined,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: true,
    refresh: undefined,
    walletAccount: walletAccount1,
  })

  await monitor.stop()
})

test('can create and update with one wallet', async () => {
  const { walletAccount1, monitor } = createMonitor()
  await monitor.update({ walletAccount: walletAccount1, refresh: true })

  expect(hooks.beforeUpdate).toHaveBeenNthCalledWith(1, {
    monitor,
    walletAccount: walletAccount1,
    refresh: true,
  })
  expect(hooks.afterUpdate).toHaveBeenNthCalledWith(1, {
    monitor,
    error: null,
    walletAccount: walletAccount1,
    refresh: true,
  })
  expect(hooks.beforeStart).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()
  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    refresh: true,
    walletAccount: walletAccount1,
  })
  expect(hooks.beforeTick).toHaveBeenCalledTimes(1)
  expect(hooks.afterTick).toHaveBeenCalledTimes(1)
  expect(tick).toHaveBeenCalledTimes(1)

  await monitor.stop()
})

test('can create and refresh one wallet', async () => {
  const { walletAccount1, monitor } = createMonitor()
  await monitor.refreshOneWallet(walletAccount1, 'mytoken')

  expect(hooks.beforeUpdate).toHaveBeenNthCalledWith(1, {
    monitor,
    refresh: true,
    highPriority: undefined,
    walletAccount: walletAccount1,
    assetName: 'mytoken',
  })
  expect(hooks.afterUpdate).toHaveBeenNthCalledWith(1, {
    monitor,
    refresh: true,
    highPriority: undefined,
    walletAccount: walletAccount1,
    assetName: 'mytoken',
    error: null,
  })
  expect(hooks.beforeStart).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()
  expect(hooks.beforeStop).not.toHaveBeenCalled()
  expect(hooks.afterStart).not.toHaveBeenCalled()

  expect(hooks.beforeTick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    assetName: 'mytoken',
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(hooks.afterTick).toHaveBeenNthCalledWith(1, {
    error: null,
    highPriority: undefined,
    assetName: 'mytoken',
    refresh: true,
    walletAccount: walletAccount1,
    monitor,
  })
  expect(tick).toHaveBeenNthCalledWith(1, {
    highPriority: undefined,
    assetName: 'mytoken',
    refresh: true,
    walletAccount: walletAccount1,
  })

  await monitor.stop()

  expect(consoleMock.log).toBeCalledWith(
    '[@exodus/HelloMonitorStaticName]',
    'monitor.refreshOneWallet() is deprecated. Please use monitor.update(). Asset name myCoin',
    expect.stringMatching(/Error/)
  )
})

test('params are set', async () => {
  const { params, monitor } = createMonitor()
  expect(monitor.params).toEqual(params)
})

test('logger default name', async () => {
  const { monitor } = createMonitor()
  monitor.logger.info('test my name')
  expect(consoleMock.info).toBeCalledWith('[@exodus/HelloMonitorStaticName:info]', 'test my name')
})

let now
let dateNowSpy
beforeEach(() => {
  now = 1_487_076_708_000
  dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => now)
})

afterEach(() => {
  dateNowSpy.mockRestore()
})

test('should filter by unconfirmed and stale', async () => {
  const { monitor } = createMonitor()
  const t1 = { txId: '1', confirmed: true, date: new Date(now - 20) }
  const t2 = { txId: '2', dropped: true, date: new Date(now) }
  const t3 = { txId: '3', date: new Date(now) }
  const t4 = { txId: '4', date: new Date(now - 5) }
  const t5 = { txId: '5', date: new Date(now - 10) }
  const t6 = { txId: '6', date: new Date(now - 15) }
  const t7 = { txId: '7', date: new Date(now - 20) }
  const { unconfirmed, stale } = monitor.getUnconfirmed({
    txSet: new Set([t1, t2, t3, t4, t5, t6, t7]),
    staleTxAge: 10,
  })
  expect(unconfirmed).toEqual([t3.txId, t4.txId])
  expect(stale).toEqual([t5, t6, t7].map((tx) => ({ ...tx, dropped: true })))
})
