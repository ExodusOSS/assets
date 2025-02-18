import { bufferToHex, toBuffer } from '@exodus/ethereumjs/util'
import { defaultAbiCoder } from '@exodus/ethersproject-abi'

import { ABISpec, HexOrBuffer } from './types.js'
import * as util from './util.js'

export default class ABIMethod {
  build: (...any) => Buffer
  parse: (HexOrBuffer) => Array<any>
  testInput: (HexOrBuffer) => boolean
  methodId: string
  abi: ABISpec

  constructor(functionABI) {
    this.methodId = util.getId(functionABI)
    this.abi = { ...functionABI, methodId: this.methodId }

    const { name, inputs, outputs } = functionABI

    // build the calldata for a contract method
    this.build = function (...args): Buffer {
      if (args.length !== inputs.length) {
        throw new Error(
          `Wrong number of args in call to ${name}.build; ${inputs.length} expected, got ${args.length}`
        )
      }

      const data: Buffer = toBuffer(defaultAbiCoder.encode(inputs, args))
      return Buffer.concat([toBuffer(this.methodId), data])
    }

    // parse the return data from a called function
    this.parse = function (returnData: HexOrBuffer): Array<any> {
      if (typeof returnData === 'string') returnData = toBuffer(returnData)
      if (returnData.length % 32 !== 0) {
        throw new Error(
          `Contract.${name}.parse(): invalid data length to parse: ${returnData.length} bytes`
        )
      } else if (!outputs) {
        throw new Error(`Contract.${name}.parse(): this function does not have any outputs`)
      }

      // return array of the decoded results
      return util.parseAndFormat(outputs, returnData)
    }

    this.testInput = function (inputData: HexOrBuffer): boolean {
      if (Buffer.isBuffer(inputData)) inputData = bufferToHex(inputData)
      return (inputData as string).startsWith(this.methodId)
    }
  }
}
