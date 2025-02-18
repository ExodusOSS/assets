// eslint-disable-next-line @exodus/import/no-unresolved
import test from '@exodus/test/tape'

import { resolveType } from '../lib/util.js'

test('"resolveType" returns the passed primitive type type if no components', (t) => {
  const input = { name: 'testName', internalType: 'bytes', type: 'bytes' }
  const resolvedType = resolveType(input)

  t.is(resolvedType, input.type)

  t.end()
})

test('"resolveType" resolves a nested method ID ', (t) => {
  const input = {
    components: [
      { internalType: 'address', name: 'callTo', type: 'address' },
      { internalType: 'address', name: 'approveTo', type: 'address' },
      { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
    ],
    internalType: 'struct LibSwap.SwapData[]',
    name: '_swapData',
    type: 'tuple[]',
  }
  const resolvedType = resolveType(input)

  t.is(resolvedType, '(address,address,bool)[]')

  t.end()
})

test('"resolveType" resolves a nested method (depth = 1) ID', (t) => {
  const input = {
    components: [
      { internalType: 'address', name: 'callTo', type: 'address' },
      { internalType: 'address', name: 'approveTo', type: 'address' },
      { internalType: 'bool', name: 'requiresDeposit', type: 'bool' },
    ],
    internalType: 'struct LibSwap.SwapData[]',
    name: '_swapData',
    type: 'tuple[]',
  }
  const resolvedType = resolveType(input)

  t.is(resolvedType, '(address,address,bool)[]')

  t.end()
})

test('"resolveType" resolves a nested method (depth = 2) ID', (t) => {
  const input = {
    components: [
      { internalType: 'address', name: 'callTo', type: 'address' },
      { internalType: 'address', name: 'approveTo', type: 'address' },
      {
        components: [
          { internalType: 'address', name: 'addr', type: 'address' },
          { internalType: 'uint256', name: 'uint', type: 'uint256' },
        ],
        internalType: 'struct LibSwap.SwapData',
        name: '_swapData2',
        type: 'struct',
      },
    ],
    internalType: 'struct LibSwap.SwapData[]',
    name: '_swapData',
    type: 'tuple[]',
  }
  const resolvedType = resolveType(input)

  t.is(resolvedType, '(address,address,(address,uint256))[]')

  t.end()
})
