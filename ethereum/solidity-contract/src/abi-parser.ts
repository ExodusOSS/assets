import lodash from 'lodash'

import ABIEvent from './abi-event.js'
import ABIMethod from './abi-method.js'
import { ABISpec } from './types.js'

/* SolidityContract instances can call their respective
   ABI's functions, and get ABI encoded
   Buffers back as a return value. This data
   can be used in ETH calls or transactions.

   Functions rebound as Contract.<funcname>.parse allows automatic
   parsing of return data using the ABI specified return types. All
   operations are synchronous and do not interact over the network. */

const resolveAbi = (abi) => {
  if (Array.isArray(abi)) {
    return abi
  }

  if (typeof abi === 'string') {
    return JSON.parse(abi)
  }

  throw new Error('no valid ABI given')
}

export type ParsedAbi = {
  abi: ABISpec[]
  methodIds: object
  eventIds: object
  contractFields: Record<string, ABIMethod | ABIEvent>
}
export const parseAbi = (inputAbi: ABISpec[] | string): ParsedAbi => {
  const abi = resolveAbi(inputAbi)
  const methodIds = {}
  const eventIds = {}
  const contractFields = {}

  for (const eventABI of abi.filter((element) => element.type === 'event')) {
    const abiEvent = new ABIEvent(eventABI)
    contractFields[eventABI.name] = abiEvent
    eventIds[abiEvent.eventId] = { ...abiEvent, eventId: abiEvent.eventId }
  }

  for (const functionABI of abi.filter((element) => element.type === 'function')) {
    // funcName is an independent var which adjusts its name if more than one version exists.
    // Functions in Solidity can be named the same if they have different parameters.
    let funcName = functionABI.name
    let nameRepeats = 2
    while (contractFields[funcName]) {
      // TODO consider rethinking this
      funcName = functionABI.name + nameRepeats++
    }

    const abiMethod = new ABIMethod(functionABI)
    contractFields[funcName] = abiMethod
    methodIds[abiMethod.methodId] = {
      ...functionABI,
      methodId: abiMethod.methodId,
    }
  }

  return { abi, methodIds, eventIds, contractFields }
}

export const cachedParseAbi = lodash.memoize(parseAbi)
