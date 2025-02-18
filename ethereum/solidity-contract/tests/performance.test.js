// eslint-disable-next-line @exodus/import/no-unresolved
import test from '@exodus/test/tape'

import erc20Abi from '../lib/fixtures/erc20-abi.js'
import Contract from '../lib/index.js'
import { isCorrectErc20Contract } from './contract.test.js'

function runTest(t, instances, reuseAbi) {
  const abiString = JSON.stringify(erc20Abi)
  const address = '0xf00'
  const start = Date.now()
  const fromObject = new Contract(erc20Abi, address, reuseAbi)
  const fromString = new Contract(abiString, address, reuseAbi)

  const contracts = []
  for (let i = 0; i < instances; i++) {
    contracts.push(new Contract(erc20Abi, address, reuseAbi))
  }

  for (let i = 0; i < instances; i++) {
    contracts.push(new Contract(abiString, address, reuseAbi))
  }

  const end = Date.now()

  console.log(end - start)

  const randomContract = contracts[Math.floor(Math.random() * contracts.length)]
  t.same(fromObject.abi, randomContract.abi)
  t.same(fromString.abi, randomContract.abi)

  isCorrectErc20Contract(t, randomContract)
  isCorrectErc20Contract(t, fromString)
  isCorrectErc20Contract(t, fromObject)
  t.end()
}

const instances = 100
test('contract created without cache/reuseAbi=false', (t) => {
  // 1000000 in fernando's machine (out of memory)
  // 100000 in fernando's machine = 9481 ms
  // 10000 in fernando's machine = 960 ms
  runTest(t, instances, false)
})
test('contract created with cache/reuseAbi=true', (t) => {
  // 1000000 in fernando's machine = 1790 ms
  // 100000 in fernando's machine = 208 ms
  // 10000 in fernando's machine = 30 ms
  // THIS IS A 30x improvement on CPU. Memory would even be a gather improvement
  runTest(t, instances, true)
})
