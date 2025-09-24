import EventEmitter from 'events/events.js'
import io from 'socket.io-client'

export default class InsightWSClient extends EventEmitter {
  constructor(url, assetName) {
    super()
    this.url = url
    this.assetName = assetName
    this.io = null
  }

  connect(addresses, opts) {
    const options = Object.assign(
      {
        transports: ['websocket'],
        reconnectionDelayMax: 30_000,
        reconnectionDelay: 10_000,
        extraHeaders: { 'User-Agent': 'exodus' },
      },
      opts
    )

    this.io = io(this.url, options)

    this.io.on('connect', () => {
      this.emit('connect')

      addresses.forEach((address) => {
        this.io.emit('subscribe', address)
      })

      if (['bitcoin', 'bitcoinregtest', 'bitcointestnet'].includes(this.assetName)) {
        this.io.emit('subscribe', 'inv_blocks')
      }
    })

    addresses.forEach((address) => {
      this.io.on(address, (data) => {
        this.emit('message', { address, data })
      })
    })

    this.io.on('block', (data) => {
      this.emit('block', data)
    })

    this.io.on('disconnect', () => {
      this.emit('disconnect')
    })

    this.io.on('reconnect', () => {
      this.emit('reconnect')
    })
  }

  close() {
    if (this.io) this.io.disconnect()
  }
}
