import assetList, { asset as solana, tokens } from '@exodus/solana-meta'

import { createAccountState } from '../index.js'
import { fixture3, fixture4, fixtureLegacy1, fixtureLegacy2 } from './fixtures-balances.js'

const SolanaAccountState = createAccountState({ assetList })

it('serializes balance and tokenBalances V0', () => {
  const usdcoin = tokens.find(({ name }) => name === 'usdcoin_solana')
  const accountState = new SolanaAccountState({
    balance: solana.currency.baseUnit(100),
    rentExemptAmount: solana.currency.defaultUnit(0),
    tokenBalances: { usdcoin_solana: usdcoin.currency.defaultUnit(10) },
  })
  const serialized = accountState.toJSON()
  expect(serialized).toEqual(fixture3)
})

it('parses balance and tokenBalances V0', () => {
  const accountState = SolanaAccountState.fromJSON(fixtureLegacy1)
  const serialized = accountState.toJSON()
  expect(serialized).toEqual(fixture3)
})

it('clear unknown token balances from account state V0 when parsing if any', () => {
  const accountState = SolanaAccountState.fromJSON(fixtureLegacy2)
  const serialized = accountState.toJSON()
  expect(serialized).toEqual(fixture3)
})

it('do not clear unknown token balances from account state V1 when parsing', () => {
  const accountState = SolanaAccountState.fromJSON(fixture4)
  const serialized = accountState.toJSON()
  expect(serialized).toEqual(fixture4)
})
