import { UnitType } from '@exodus/currency'
import BN from 'bn.js'

import type { CreateCurrencyParams } from './types.js'
import type NumberUnit from '@exodus/currency'

export const hexToBN = (hexValue: string) => {
  const isHexPrefixed = hexValue.startsWith('0x')

  return new BN(isHexPrefixed ? hexValue.slice(2) : hexValue, 'hex')
}

export function createCurrency({
  amount,
  base = 'base',
  symbol,
  denominator,
}: CreateCurrencyParams): NumberUnit {
  return UnitType.create({
    [base]: 0,
    [symbol]: denominator,
  }).baseUnit(amount)
}

export function formatAmount(amount: number, denominator: number) {
  return UnitType.create({
    base: 0,
    main: denominator,
  })
    .units.base(amount)
    .toDefaultString()
}
