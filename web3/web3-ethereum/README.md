# @exodus/web3-ethereum

Apps connectivity library for Ethereum and EVM-compatible chains.

## Usage

```js
const EventEmitter = require('events')

// Separate entry points are supported
const { EthereumProvider } = require('@exodus/web3-ethereum/provider')
const { registerRPCHandlers } = require('@exodus/web3-ethereum/rpc')

// Create transport.
const transport = new EventEmitter()
transport.write = (data) => {
  setTimeout(() => {
    transport.emit('data', data)
  })
}

// Create Exodus global API.
const accountsObservable = new Observable()
const storage = new Storage()
const supportedChainIDs = ['0x1']
const exodus = {
  ethereum: new EthereumProvider({
    accountsObservable,
    storage,
    supportedChainIDs,
    transport,
  }),
}

// Inject the Exodus object into the app.
window.exodus = exodus

// Register RPC handlers for requests the Provider can call.
registerRPCHandlers({
  transport,
  deps: {}, // required deps
})
```
