# solidity-contract

Object-oriented ABI data building and parsing for Ethereum Smart Contracts.

## API

### `new SolidityContract(abi, address)`

- `abi`: `Array | String` The contract's ABI, as a parsed JSON array, or JSON string.
- `address`: `String` (optional)

Creates a new `SolidityContract` instance, and populates the methods and events of the contract with the methods and events in the ABI.

### `SolidityContract` instance properties

- `contract.abi`: `Array<Object>`

The parsed ABI Array as passed to the constructor.

---

- `contract.address`: `String`

The contract address string as passed to the constructor. This address isn't used for anything at present.

---

- `contract.methodIds`: `Object<String:Object>`

An object mapping method ID strings to the ABI method object specifying the details of that method. All method ID string keys are lower case hex strings prefixed with `'0x'`.

```js
const { methodId, name, stateMutability, payable, constant, type, inputs, outputs } =
  contract.methodIds['0x01234567']
```

---

- `contract[eventName]`

For every event in the contract's ABI, the contract instance has the event added as a property. For example, an ERC20 token contract would have `contract.Transfer` and `contract.Approval`.

Each of these properties is an object which has the following properties and methods:

- `build`: `(...any) => Buffer` UNIMPLEMENTED
- `parse`: `(callData: String | Buffer) => Array<any>` Parse ABI event log data calling and return the parsed values. The values' types depend on the types of the input parameters in the ABI specification. For example, a `string` type would return a string, a `uint` would return a stringified number in base 10, a `bytes` value would return a `Buffer`, etc. Must the event's raw unindexed log data.
- `testInput`: `(String | Buffer) => boolean` UNIMPLEMENTED
- `eventId`: `String` The event ID hex string.
- `abi`: `Object` The ABI specification for this event as passed to the constructor.

---

- `contract.eventIds`: `Object<String:Object>`

Same as `contract.methodIds`, except for contract events instead. Event IDs in solidity are represented in long-form, as full 32 byte Keccak hash, rather than the short 4-byte form used for method IDs.

```js
const { eventId, name, type, inputs, anonymous } =
  contract.eventIds['0xb5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c']
```

---

- `contract[methodName]`: `Object`

For every function on the contract's ABI, the contract instance has the method added as a property. For example, a contract instantiated with an ERC20 token ABI would have `contract.transfer`, `contract.approve`, etc.

Each of these properties is an object which has the following properties and methods:

- `build`: `(...any) => Buffer` Build ABI transaction data calling `methodName` with the supplied parameters. For example, you could call `token.transfer('0x' + '0'.repeat(40), 100000)` to build the data for a transfer of 100000 wei for any ERC20 token.
- `parse`: `(callData: String | Buffer) => Array<any>` Parse ABI transaction data calling this function and return the parsed values. The values' types depend on the types of the input parameters in the ABI specification. For example, a `string` type would return a string, a `uint` would return a stringified number in base 10, a `bytes` value would return a `Buffer`, etc. Must supply call data without the 4 method ID prefix bytes.
- `testInput`: `(String | Buffer) => boolean` Check if the input data is valid for this method.
- `methodId`: `String` The method ID hex string.
- `abi`: `Object` The ABI specification for this method as passed to the constructor.

```js
const callData = tokenContract.balanceOf.build(address)
console.log(Buffer.isBuffer(callData)) // true
console.log(tokenContract.balanceOf.testInput(callData)) // true
```

---

- `contract[eventName]`: `Object`

For every event in the contract's ABI, the contract instance has the event added as a property. For example, an ERC20 SolidityContract instance has `contract.Transfer`, `contract.Approval`, etc.

Each of these properties is equal to the ABI specification object for this event, plus an `eventId` hex string property. See `contract.eventIds[eventId]`.

### `SolidityContract` instance methods

---

- `decodeInput(callData: String | Buffer): { method: string, values: Array<any> }`

Decode the given call data and attempt to identify which method on the contract was being called. If successful, decode the input parameters and return them in the `values` array. If unsuccessful, an error is thrown.

### `SolidityContract` static methods

---

- `SolidityContract.erc20(address: String)`: `SolidityContract`

Return a contract implementing the full ERC20 token standard. `address` parameter is optional.

---

- `SolidityContract.simpleErc20(address: String)`: `SolidityContract`

Returns a contract implementing only the following ERC20 methods and event:

```
transfer(address,uint256)
balanceOf(address)
Transfer(address,address,uint256)
```

`address` parameter is optional.

---

- `SolidityContract.simpleErc721(address: String)`: `SolidityContract`

Returns a contract implementing only the following ERC721 methods:

```
ownerOf(uint256)
tokenURI(uint256)
uri(uint256)
symbol()
totalSupply()
safeTransferFrom(address,address,uint256)
```

`address` parameter is optional.

---
