import { toBuffer } from '@exodus/ethereumjs/util'
import test from '@exodus/test/tape' // eslint-disable-line @exodus/import/no-unresolved -- eslint doesn't understand "exports" in package.json

import erc20Abi from '../lib/fixtures/erc20-abi.js'
import Contract from '../lib/index.js'

const contract = new Contract(erc20Abi)

test('Decode output from string', (t) => {
  t.same(
    contract.decodeOutput({
      data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000084d6f6e676f6f7365000000000000000000000000000000000000000000000000',
      method: 'name',
    })[0],
    'Mongoose',
    'ERC20 name'
  )

  t.same(
    contract.decodeOutput({
      data: '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000084d4f4e474f4f5345000000000000000000000000000000000000000000000000',
      method: 'symbol',
    })[0],
    'MONGOOSE',
    'ERC20 symbol'
  )
  t.end()
})

test('Decode output from Buffer', (t) => {
  t.same(
    contract.decodeOutput({
      data: toBuffer(
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000084d6f6e676f6f7365000000000000000000000000000000000000000000000000'
      ),
      method: 'name',
    })[0],
    'Mongoose',
    'ERC20 name'
  )
  t.end()
})
