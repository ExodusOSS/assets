import { keccak256 } from '@exodus/crypto/keccak'
import { bufferToHex, toBuffer } from '@exodus/ethereumjs/util'
import { defaultAbiCoder } from '@exodus/ethersproject-abi'

import { HexOrBuffer } from './types.js'

export function sha3(data: HexOrBuffer): string {
  return bufferToHex(keccak256(data))
}

interface Input {
  internalType: string
  name: string
  type: string
  components?: Input[]
}

// When a type refers to a struct you need to resolve the exact primitive types
// to calculate a proper function signature.
// For example,
// {
//         components: [
//           { internalType: 'address', name: 'callTo', type: 'address' },
//           { internalType: 'address', name: 'approveTo', type: 'address' },
//           { internalType: 'address', name: 'sendingAssetId', type: 'address' },
//           { internalType: 'address', name: 'receivingAssetId', type: 'address' },
//           { internalType: 'uint256', name: 'fromAmount', type: 'uint256' },
//           { internalType: 'bytes', name: 'callData', type: 'bytes' },
//           { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
//         ],
//         internalType: 'struct LibSwap.SwapData[]',
//         name: '_swapData',
//         type: 'tuple[]',
//       },
// should become "(address,address,address,address,uint256,bytes,bool)[]" not just "tuple[]"
export function resolveType(input: Input): string {
  if (!input.components || input.components.length === 0) return input.type

  const listSymbol = input.type.endsWith('[]') ? '[]' : ''

  return `(${input.components.map(resolveType)})${listSymbol}`
}

function getFuncSig({ name, inputs = [] }): string {
  const inputTypes = inputs.map(resolveType)
  return name + `(${inputTypes.join(',')})`
}

export function getId({ name, type, inputs = [] }): string {
  // Compute the methodId or eventId
  const signature = getFuncSig({ name, inputs })
  const longId = sha3(signature)
  if (type === 'event') return longId
  return longId.slice(0, 10)
}

function addHexPrefix(str: string) {
  return str.startsWith('0x') ? str : '0x' + str
}

// ethers/abi returns BN's and buffers and improperly formatted addresses. We want to
// format them correctly before passing them up the stack.
export function formatDecoded(value: any, type: string): any {
  if (type === 'address') {
    if (Buffer.isBuffer(value)) return bufferToHex(value)
    return addHexPrefix(value).toLowerCase()
  }

  if (type.includes('[]')) {
    return value.map((val) => formatDecoded(val, type.replace('[]', ''))) // stringify arrays
  }

  if (type.startsWith('uint') || type.startsWith('int')) {
    return value.toString() // calls bn.js#toString(10)
  }

  if (type === 'string') {
    return value.toString()
  }

  if (type === 'bytes') {
    return toBuffer(value)
  }

  return value
}

export function parseAndFormat(paramsABI, data: HexOrBuffer): any[] {
  return defaultAbiCoder.decode(paramsABI, data).map((decoded, i) => {
    if (paramsABI[i].type === 'tuple') {
      return decoded.map((decodedTupleElement, j) =>
        formatDecoded(decodedTupleElement, paramsABI[i].components[j].type)
      )
    }

    return formatDecoded(decoded, paramsABI[i].type)
  })
}
