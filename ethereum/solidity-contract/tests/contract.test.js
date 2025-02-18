import { toBuffer } from '@exodus/ethereumjs/util'
import test from '@exodus/test/tape' // eslint-disable-line @exodus/import/no-unresolved -- eslint doesn't understand "exports" in package.json

import baseFillOrderABI from '../lib/fixtures/base-fill-order.js'
import erc20Abi from '../lib/fixtures/erc20-abi.js'
import Contract from '../lib/index.js'
import { LiFiAbi } from './fixtures/LiFi.js'

export function isCorrectErc20Contract(t, contract) {
  const expectedFunctions = [
    'address',
    'abi',
    'methodIds',
    'eventIds',
    'Transfer',
    'Approval',
    'approve',
    'totalSupply',
    'name',
    'symbol',
    'transferFrom',
    'balanceOf',
    'transfer',
    'allowance',
  ]
  t.same(Object.keys(contract), expectedFunctions)
  const abi = contract.abi
  abi
    .filter((f) => f.type === 'function')
    .forEach((e) => {
      t.true(contract[e.name].build instanceof Function, `Contract has function ${e.name}`)
    })
  abi
    .filter((e) => e.type === 'event')
    .forEach((e) => {
      t.true(contract[e.name] && contract[e.name].eventId, `Contract has event ${e.name}`)
    })

  const transferData = contract.transfer.build('0x0000000000000000000000000000000000abc123', 128)
  const [methodId, sector1, sector2] = [
    transferData.slice(0, 4),
    transferData.slice(4, 36),
    transferData.slice(36, 68),
  ]
  t.same(methodId, toBuffer('0xa9059cbb'))
  t.same(sector1, toBuffer('0x0000000000000000000000000000000000000000000000000000000000abc123'))
  t.same(sector2, toBuffer('0x0000000000000000000000000000000000000000000000000000000000000080'))

  const [value0, value1] = contract.decodeInput(transferData).values
  t.is(value0, '0x0000000000000000000000000000000000abc123', 'param 0 matches')
  t.is(value1, '128', 'param 1 matchess')
}

test('Contract constructs correctly', (t) => {
  const token1 = new Contract(erc20Abi, '0xf00')
  const token2 = new Contract(JSON.stringify(erc20Abi))

  t.same(token1.abi, token2.abi)
  t.is(token1.address, '0xf00')

  isCorrectErc20Contract(t, token1)
  isCorrectErc20Contract(t, token2)

  t.end()
})

test('Contract methods can be looked up by ID', (t) => {
  const token = new Contract(erc20Abi)
  const transferMethodId = '0xa9059cbb'
  t.same(token.methodIds[transferMethodId], token.transfer.abi)

  t.end()
})

test('Contract functions build and parse correct data', (t) => {
  const token = new Contract(erc20Abi)

  const transferData = token.transfer.build('0x0000000000000000000000000000000000abc123', 128)
  const [methodId, sector1, sector2] = [
    transferData.slice(0, 4),
    transferData.slice(4, 36),
    transferData.slice(36, 68),
  ]
  t.same(methodId, toBuffer('0xa9059cbb'))
  t.same(sector1, toBuffer('0x0000000000000000000000000000000000000000000000000000000000abc123'))
  t.same(sector2, toBuffer('0x0000000000000000000000000000000000000000000000000000000000000080'))

  const [value0, value1] = token.decodeInput(transferData).values
  t.is(value0, '0x0000000000000000000000000000000000abc123', 'param 0 matches')
  t.is(value1, '128', 'param 1 matchess')

  t.end()
})

test('Contract handles byte arrays', (t) => {
  const byteProcessor = new Contract([
    {
      name: 'runbytes',
      payable: false,
      type: 'function',
      stateMutability: 'nonpayable',
      constant: false,
      inputs: [
        {
          name: 'input',
          type: 'bytes',
        },
      ],
      outputs: [
        {
          type: 'bool',
          name: 'success',
        },
      ],
    },
  ])
  const data = byteProcessor.runbytes.build(Buffer.from('I am a byte array'))

  t.same(
    data.toString('hex'),
    '49b4d2c3000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000114920616d20612062797465206172726179000000000000000000000000000000',
    'data matches'
  )

  t.true(
    byteProcessor.runbytes.testInput(data),
    'can check if input data came from a specific method'
  )

  const { method, values } = byteProcessor.decodeInput(data)
  t.is(method, 'runbytes')
  t.same(values, [Buffer.from('I am a byte array')])

  t.end()
})

test('Contract functions throw if given invalid args', (t) => {
  const token = new Contract(erc20Abi)
  t.throws(() => token.transfer.build(100_000), 'too few args') // transfer expects: transfer(address,uint256)
  t.throws(() => token.approve.build('0x123', '0xabc', '0x987'), 'too many args')

  const data = '0x000000000000000000000000000000000000000000000000000000000000000001' // data is 33 bytes long instead of 32
  t.throws(() => token.balanceOf.parse(data), 'invalid data given to parse')

  t.end()
})

test('Contract events can be looked up by id', (t) => {
  const token = new Contract(erc20Abi)
  const transferEventId = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  t.is(token.Transfer.eventId, transferEventId, 'event ID is computed correctly')
  t.deepLooseEqual(token.eventIds[transferEventId], token.Transfer, 'lookup event by ID')

  t.end()
})

test('Contract events data can be parsed using ABI', (t) => {
  const contract = new Contract(baseFillOrderABI)
  const [newFilledAmount, orderHash, fillHash, order, orderAmounts] = contract.OrderFill.parse(
    '0x000000000000000000000000000000000000000000000000260121c27a0b659de667bf3411fde3752c2850252e0afca08262084e30575de571e2cfbc9945cbb1ce604880fac0ff0ac1a913641d73b85fa1386aeb37bea48b4ee1d6adfbcd37e5fff225b818871e0c3f57cfec021d570025f0fdef6c975d678237b7899dfac1d30000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000821ab0d4414980000000000000000000000000000000000000000000000000000a72307ab4f450b21000000000000000000000000000000000000000000000000000000005f213a9067ec1f36cdb4fb0debc9daeddcd43923ff5a21625b50a4451a7fb426681d086d000000000000000000000000f59e93290383ed15f73ee923ebbf29f79e37b6d800000000000000000000000052adf738aad93c31f798a30b2c74d658e1e9a5620000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000260121c27a0b659d000000000000000000000000000000000000000000000001158e460913cffffc0000000000000000000000000000000000000000000000013b8f67cb8ddb6599'
  )

  t.same(newFilledAmount, '2738507167572911517', 'newFilledAmount parsed correctly')
  t.same(
    orderHash,
    '0xe667bf3411fde3752c2850252e0afca08262084e30575de571e2cfbc9945cbb1',
    'orderHash parsed correctly'
  )
  t.same(
    fillHash,
    '0xce604880fac0ff0ac1a913641d73b85fa1386aeb37bea48b4ee1d6adfbcd37e5',
    'fill hash parsed correctly'
  )
  t.same(
    order,
    [
      '0xfff225b818871e0c3f57cfec021d570025f0fdef6c975d678237b7899dfac1d3',
      '0x6b175474e89094c44da98b954eedeac495271d0f',
      '150000000000000000000',
      '12043478260869565217',
      '1596013200',
      '47005414743001478163812632330779174484518921029762466346848937926162655283309',
      '0xf59e93290383ed15f73ee923ebbf29f79e37b6d8',
      '0x52adf738aad93c31f798a30b2c74d658e1e9a562',
      false,
    ],
    'order tuple parsed correctly'
  )
  t.same(
    orderAmounts,
    ['2738507167572911517', '19999999999999999996', '22738507167572911513'],
    'order amounts tuple parsed correctly'
  )

  t.end()
})

test('ABIEvent parses ERC20 transfer event', (t) => {
  const contract = new Contract(erc20Abi)
  const [amount] = contract.Transfer.parse(
    '0x0000000000000000000000000000000000000000000004ded51e9cc700600000'
  )
  t.same(amount, '23000000000000000000000', 'transfer amount parsed correctly')

  t.end()
})

test('Contract constructs correctly for inputs with struct types', (t) => {
  const lifiContract = new Contract(LiFiAbi, '0x')

  t.ok(lifiContract.methodIds['0x4630a0d8'])

  t.end()
})
