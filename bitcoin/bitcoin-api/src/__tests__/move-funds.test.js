import { Address } from '@exodus/models'

import { renderAddresses } from '../move-funds.js'

describe('move-funds', () => {
  test('renderAddresses', () => {
    expect(renderAddresses([])).toEqual('')
    expect(renderAddresses(['s1'])).toEqual('s1')
    expect(renderAddresses(['s1', 's2', 's3'])).toEqual('s1, s2, or s3')
    expect(renderAddresses([new Address('a1')])).toEqual('a1')
    expect(renderAddresses([new Address('a1'), new Address('a2'), new Address('a3')])).toEqual(
      'a1, a2, or a3'
    )
  })
})
