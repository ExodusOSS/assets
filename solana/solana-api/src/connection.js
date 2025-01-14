import { WebSocket } from '@exodus/fetch'
import debugLogger from 'debug'
import delay from 'delay'
import lodash from 'lodash'
import makeConcurrent from 'make-concurrent'
import ms from 'ms'

// WS subscriptions: https://docs.solana.com/developing/clients/jsonrpc-api#subscription-websocket

const SOLANA_DEFAULT_ENDPOINT = 'wss://solana.a.exodus.io/ws'
const DEFAULT_RECONNECT_DELAY = ms('15s')
const PING_INTERVAL = ms('60s')
const TIMEOUT = ms('50s')

const debug = debugLogger('exodus:solana-api')

export class Connection {
  constructor({
    endpoint = SOLANA_DEFAULT_ENDPOINT,
    address,
    tokensAddresses = [],
    callback,
    onMsg,
    reconnectCallback = () => {},
    reconnectDelay = DEFAULT_RECONNECT_DELAY,
  }) {
    this.address = address
    this.tokensAddresses = tokensAddresses
    this.endpoint = endpoint
    this.callback = callback
    this.onMsg = onMsg
    this.reconnectCallback = reconnectCallback
    this.reconnectDelay = reconnectDelay

    this.shutdown = false
    this.ws = null
    this.rpcQueue = {}
    this.messageQueue = []
    this.inProcessMessages = false
    this.pingTimeout = null
    this.reconnectTimeout = null
    this.txCache = {}
    this.seq = 0

    this.sendMessage = makeConcurrent(
      async (method, params = []) => {
        return new Promise((resolve, reject) => {
          if (this.isClosed || this.shutdown) return reject(new Error('connection not started'))
          const id = ++this.seq

          this.rpcQueue[id] = { resolve, reject }
          this.rpcQueue[id].timeout = setTimeout(() => {
            delete this.rpcQueue[id]
            console.log(`solana ws: reply timeout (${method}) - ${JSON.stringify(params)} - ${id}`)
            resolve(null)
          }, TIMEOUT)
          if (typeof this.rpcQueue[id].timeout.unref === 'function')
            this.rpcQueue[id].timeout.unref()
          this.ws.send(JSON.stringify({ jsonrpc: '2.0', method, params, id }))
        })
      },
      { concurrency: 15 }
    )
  }

  newSocket(reqUrl) {
    const obj = new URL(reqUrl)
    obj.protocol = 'wss:'
    reqUrl = `${obj}`
    debug('Opening WS to:', reqUrl)
    const ws = new WebSocket(`${reqUrl}`)
    ws.addEventListener('message', this.onMessage.bind(this))
    ws.addEventListener('open', this.onOpen.bind(this))
    ws.addEventListener('close', this.onClose.bind(this))
    ws.addEventListener('error', this.onError.bind(this))
    return ws
  }

  get isConnecting() {
    return !!(this.ws && this.ws.readyState === WebSocket.CONNECTING)
  }

  get isOpen() {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN)
  }

  get isClosing() {
    return !!(this.ws && this.ws.readyState === WebSocket.CLOSING)
  }

  get isClosed() {
    return !!(!this.ws || this.ws.readyState === WebSocket.CLOSED)
  }

  get running() {
    return !!(!this.isClosed || this.inProcessMessages || this.messageQueue.length > 0)
  }

  get connectionState() {
    if (this.isConnecting) return 'CONNECTING'
    if (this.isOpen) return 'OPEN'
    if (this.isClosing) return 'CLOSING'
    if (this.isClosed) return 'CLOSED'
    return 'NONE'
  }

  doPing() {
    if (this.ws) {
      this.ws.ping()
      this.pingTimeout = setTimeout(this.doPing.bind(this), PING_INTERVAL)
    }
  }

  doRestart() {
    // debug('Restarting WS:')
    this.reconnectTimeout = setTimeout(async () => {
      try {
        debug('reconnecting ws...')
        this.start()
        await this.reconnectCallback()
      } catch (e) {
        console.log(`Error in reconnect callback: ${e.message}`)
      }
    }, this.reconnectDelay)
  }

  onMessage(evt) {
    try {
      const json = JSON.parse(evt.data)
      debug('new ws msg:', json)
      if (json.error) {
        if (lodash.get(this.rpcQueue, json.id)) {
          this.rpcQueue[json.id].reject(new Error(json.error.message))
          clearTimeout(this.rpcQueue[json.id].timeout)
          delete this.rpcQueue[json.id]
        } else debug('Unsupported WS message:', json.error.message)
      } else {
        if (lodash.get(this.rpcQueue, json.id)) {
          // json-rpc reply
          clearTimeout(this.rpcQueue[json.id].timeout)
          this.rpcQueue[json.id].resolve(json.result)
          delete this.rpcQueue[json.id]
        } else if (json.method) {
          const msg = { method: json.method, ...lodash.get(json, 'params.result', json.result) }
          debug('pushing msg to queue', msg)
          this.messageQueue.push(msg) // sub results
        }

        this.processMessages(json)
      }
    } catch (e) {
      debug(e)
      debug('Cannot parse msg:', evt.data)
    }
  }

  onOpen(evt) {
    debug('Opened WS')
    // subscribe to each addresses (SOL and ASA addr)
    const addresses = [...this.tokensAddresses, this.address]
    addresses.forEach((address) => {
      // sub for account state changes
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'accountSubscribe',
          params: [
            address,
            {
              encoding: 'jsonParsed',
            },
          ],
          id: ++this.seq,
        })
      )
      // sub for incoming/outcoming txs
      this.ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'logsSubscribe',
          params: [{ mentions: [address] }, { commitment: 'finalized' }],
          id: ++this.seq,
        })
      )
    })
    // this.doPing()
  }

  onError(evt) {
    debug('Error on WS:', evt.data)
  }

  onClose(evt) {
    debug('Closing WS')
    clearTimeout(this.pingTimeout)
    clearTimeout(this.reconnectTimeout)
    if (!this.shutdown) {
      this.doRestart()
    }
  }

  async processMessages(json) {
    if (this.onMsg) await this.onMsg(json)
    if (this.inProcessMessages) return null
    this.inProcessMessages = true
    try {
      while (this.messageQueue.length > 0) {
        const items = this.messageQueue.splice(0, this.messageQueue.length)
        await this.callback(items)
      }
    } catch (e) {
      console.log(`Solana: error processing streams: ${e.message}`)
    } finally {
      this.inProcessMessages = false
    }
  }

  async close() {
    clearTimeout(this.reconnectTimeout)
    clearTimeout(this.pingTimeout)
    if (this.ws && (this.isConnecting || this.isOpen)) {
      // this.ws.send(JSON.stringify({ method: 'close' }))
      // Not sending the method above so just no need to wait below
      // await delay(ms('1s')) // allow for the 'close' round-trip
      await this.ws.close()
      if (this.ws.terminate) await this.ws.terminate()
    }
  }

  async start() {
    try {
      if (!this.isClosed || this.shutdown) return
      this.ws = this.newSocket(this.endpoint)
    } catch (e) {
      console.log('Solana: error starting WS:', e)
      this.doRestart()
    }
  }

  async stop() {
    if (this.shutdown) return
    this.shutdown = true
    await this.close()
    while (this.running) await delay(ms('50ms'))
  }
} // Connection
