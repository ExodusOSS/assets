import { bufferToHex, toBuffer } from '@exodus/ethereumjs/util'

import { cachedParseAbi, parseAbi } from './abi-parser.js'
import erc20Abi from './fixtures/erc20-abi.js'
import simpleErc20Abi from './fixtures/erc20-simple-abi.js'
import simpleErc721Abi from './fixtures/erc721-simple-abi.js'
import simpleErc1155Abi from './fixtures/erc1155-simple-abi.js'
import { ABISpec, HexOrBuffer } from './types.js'
import * as util from './util.js'

/* SolidityContract instances can call their respective
   ABI's functions, and get ABI encoded
   Buffers back as a return value. This data
   can be used in ETH calls or transactions.

   Functions rebound as Contract.<funcname>.parse allows automatic
   parsing of return data using the ABI specified return types. All
   operations are synchronous and do not interact over the network.


   Processing ABISpec[] could be expensive if you are creating multiple instances.
   SolidityContract is able to cache the processing of ABI specs on demand.

   reuseAbi:true when:

   - You are creating multiple instances of SolidityContract for different addresses but same spec
   - You use the same unparsedAbi instances when creating the SolidityContract objects

   */

export default class SolidityContract {
  readonly abi: ABISpec[]
  readonly address: string
  readonly methodIds: object
  readonly eventIds: object

  constructor(unparsedAbi: ABISpec[] | string, address: string, reuseAbi = false) {
    const { abi, methodIds, eventIds, contractFields } = reuseAbi
      ? cachedParseAbi(unparsedAbi)
      : parseAbi(unparsedAbi)

    this.address = address
    this.abi = abi
    this.methodIds = methodIds
    this.eventIds = eventIds

    Object.entries(contractFields).forEach(([field, value]) => {
      if (this[field]) throw new Error(`Field ${field} is already defined in the contract!!!`)
      this[field] = value
    })
  }

  // return a contract implementing the full ERC20 token standard
  static erc20(address: string): SolidityContract {
    return new SolidityContract(erc20Abi, address, true)
  }

  // returns a contract implementing only the following ERC20 methods and event:
  // transfer(address,uint256), balanceOf(address), Transfer(address,address,uint256)
  static simpleErc20(address: string): SolidityContract {
    return new SolidityContract(simpleErc20Abi, address, true)
  }

  // return a contract implementing the simple ERC721 token standard
  static simpleErc721(address: string): SolidityContract {
    return new SolidityContract(simpleErc721Abi, address, true)
  }

  // return a contract implementing the simple ERC1155 token standard
  static simpleErc1155(address: string): SolidityContract {
    return new SolidityContract(simpleErc1155Abi, address, true)
  }

  decodeInput(inputData: HexOrBuffer): { method: string; values: Array<any> } {
    /* decode the input data normally passed to one of this contract's functions */
    const inputBuffer = Buffer.isBuffer(inputData) ? inputData : toBuffer(inputData)
    const inputMethodId = bufferToHex(inputBuffer.slice(0, 4))
    const funcABI = this.methodIds[inputMethodId]

    if (!funcABI) throw new Error('Not a valid method ID for this contract')

    const values = util.parseAndFormat(funcABI.inputs, inputBuffer.slice(4))
    return { method: funcABI.name, values }
  }

  decodeOutput({ data, method }: { data: HexOrBuffer; method: string }): Array<any> {
    const _method = this[method]
    if (!_method) throw new Error('Not a valid method for this contract')

    return util.parseAndFormat(_method.abi.outputs, data)
  }
}
