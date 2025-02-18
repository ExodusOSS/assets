import { ABIImplementation, ABISpec, HexOrBuffer } from './types.js'
import * as util from './util.js'

export default class ABIEvent implements ABIImplementation {
  abi: ABISpec
  eventId: string
  parse: (HexOrBuffer) => Array<any>

  constructor(eventABI) {
    this.eventId = util.getId(eventABI)
    this.abi = { ...eventABI, eventId: this.eventId }

    // indexed parameters included in log topics, not in log data
    const unindexedInputs = eventABI.inputs.filter((input) => input.indexed === false)

    this.parse = (data: HexOrBuffer): Array<any> => {
      return util.parseAndFormat(unindexedInputs, data)
    }
  }

  build(): Buffer {
    throw new Error('build is unimplemented for events')
  }

  testInput(): boolean {
    throw new Error('testInput is unimplemented for events')
  }
}
