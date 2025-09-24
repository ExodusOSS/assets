import assert from 'minimalistic-assert'

import { NonEmptyArray } from '../types.js'

export const areFulfilled = <T>(
  results: PromiseSettledResult<T>[],
): results is PromiseFulfilledResult<T>[] =>
  results.every((result) => result.status === 'fulfilled')

export function assertNonEmpty<T>(
  value: T[],
): asserts value is NonEmptyArray<T> {
  assert(value.length > 0, 'Expected a non-empty array')
}
