import debugLogger from 'debug'
import delay from 'delay'
import ms from 'ms'

// import api from '../index'
import { Connection } from '../connection.js'

const debug = debugLogger('exodus:solana-api')

const ADDRESS = 'EPpRmq7oNByckkC1nWjmQ48URQR8FEw8igNjMzfWZg6k'

let connection

async function initializeConnection() {
  if (connection) return connection
  const conn = new Connection({
    address: ADDRESS,
    callback: (items) => {
      debug('items:', items)
    },
  })
  await conn.start()
  return conn
}

describe('Test ws connection', () => {
  afterAll(async () => {
    if (connection) await connection.stop()
  })

  test(
    'test ws Connection',
    async () => {
      connection = await initializeConnection()
      await delay(ms('5s'))
      connection.ws.userAgent = 'exodus-test-sol-ws'
      const tx = await connection.sendMessage('getTransaction', [
        'toEFZFB4vRdomCnCFy7R99UUVpHzCw1XujjhBXNgm2Y7giELpd7rxhEJGcxjgoTA6VqSsfHp4wynwAyakRKVFdg',
        { encoding: 'jsonParsed' },
      ])
      debug('fetched tx', tx)
      await connection.stop()
    },
    ms('60s')
  )

  // This runs for a very long time
  // Used for testing. Set 'address' to your address and send some SOL from/to that address.
  test.skip(
    'test running websocket to listen for transactions',
    async () => {
      const connection = new Connection({
        address: ADDRESS,
        callback: async (items) => {
          // accountNotification or logsNotification
          debug('items:', items)
          expect(items.length).toEqual(1)
          // get incoming tx info
          if (items[0].method === 'logsNotification') {
            const txId = items[0].value.signature
            const tx = await connection.sendMessage('getTransaction', [
              txId,
              { encoding: 'jsonParsed' },
            ])
            debug('got tx:', tx)
          }
        },
      })
      connection.start()

      await delay(ms('5m')) // runs for a long time
      // manually send some SOL
      await connection.stop()
    },
    ms('5m')
  )
})
