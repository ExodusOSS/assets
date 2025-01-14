import assert from 'minimalistic-assert'

import { orderTxs } from '../util.js'
import loadFixture from './load-fixture.cjs'

const noTimeTxs = loadFixture('no-time-txs')

test('should not set a time for txs without time', () => {
  const actualOrderedTxs = orderTxs(noTimeTxs)
  assert(!actualOrderedTxs.some((tx) => tx.time), `txs don't have a time`)
})
