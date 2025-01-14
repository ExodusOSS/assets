# @exodus/web3-management

Apps connectivity library for Exodus management.

## Usage

```js
const EventEmitter = require('events')

// Separate entry points are supported
const { ManagementProvider } = require('@exodus/web3-management/provider')
const { registerRPCHandlers } = require('@exodus/web3-management/rpc')

// Create transport.
const transport = new EventEmitter()
transport.write = (data) => {
  setTimeout(() => {
    transport.emit('data', data)
  })
}

// Create Exodus global API.
const accountsObservable = new Observable()

const exodus = {
  management: new ManegementProvider({
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

## Use cases

### Wallet selector feature

![img.png](docs/wallet-selector.png)

To improve code reusability the feature works by utilizing the separate
`ManagementProvider` class and its own RPC, which are both asset-agnostic.

Here's a high-level data flow chart (Ethereum Provider is used as an example):

```mermaid
flowchart TB
    A[Dapp] --> |"window.ethereum.request({ method: 'eth_requestAccounts', ... })"| B(Ethereum Provider Proxy)
    B --> |"intercepts and redirects the request"| C("ManagementProvider.askUserToChooseWallet()")
    C --> |"rpc.callMethod('exodus_selectWallet', ...)"| D("RPC (Service Worker)")
    D --> |"await depencies.chooseWallet(...)"| E("Approve Connection UI")
```
