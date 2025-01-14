import { asset } from '@exodus/bitcoin-meta'

import { indexOutputs } from '../ordinals-indexer-utils.js'

describe('indexOutputs', () => {
  const currency = asset.currency

  it('handles empty vin and vout arrays', () => {
    const tx = { vin: [], vout: [] }
    const result = indexOutputs({ tx, currency })
    expect(result.vin).toEqual([])
    expect(result.vout).toEqual([])
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('handles non-empty vin and empty vout', () => {
    const tx = {
      vin: [{ value: '0.00000100', inscriptions: [{ inscriptionId: '1', offset: 0 }] }],
      vout: [],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('handles non-empty vin and non-empty vout', () => {
    const tx = {
      vin: [{ value: '0.00000100' }],
      vout: [{ value: '0.00000090' }],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([
      {
        inscriptions: [],
        value: '0.00000090',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('correctly processes inscriptions from vin to vout', () => {
    const tx = {
      vin: [
        { value: '0.00000100', inscriptions: [{ inscriptionId: 'a', offset: 50 }] },
        { value: '0.00000200', inscriptions: [{ inscriptionId: 'b', offset: 150 }] },
      ],
      vout: [{ value: '0.00000100' }, { value: '0.00000180' }],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([
      {
        inscriptions: [
          {
            inscriptionId: 'a',
            offset: 50,
          },
        ],
        value: '0.00000100',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'b',
            offset: 150,
          },
        ],
        value: '0.00000180',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('correctly processes inscriptions from vin to vout with 0 offsets', () => {
    const tx = {
      vin: [
        { value: '0.00000100', inscriptions: [{ inscriptionId: 'a', offset: 0 }] },
        { value: '0.00000200', inscriptions: [{ inscriptionId: 'b', offset: 0 }] },
        { value: '0.00000300', inscriptions: [{ inscriptionId: 'c', offset: 0 }] },
      ],
      vout: [{ value: '0.00000100' }, { value: '0.00000200' }, { value: '0.00000180' }],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([
      {
        inscriptions: [
          {
            inscriptionId: 'a',
            offset: 0,
          },
        ],
        value: '0.00000100',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'b',
            offset: 0,
          },
        ],
        value: '0.00000200',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'c',
            offset: 0,
          },
        ],
        value: '0.00000180',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('correctly processes inscriptions from vin to vout max safe int', () => {
    const tx = {
      vin: [
        { value: '9007199000', inscriptions: [{ inscriptionId: 'a', offset: 50 }] },
        { value: '9007199100', inscriptions: [{ inscriptionId: 'b', offset: 0 }] },
      ],
      vout: [{ value: '9007199000' }, { value: '9007199100' }, { value: '0.00000180' }],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([
      {
        inscriptions: [
          {
            inscriptionId: 'a',
            offset: 50,
          },
        ],
        value: '9007199000',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'b',
            offset: 0,
          },
        ],
        value: '9007199100',
      },
      {
        inscriptions: [],
        value: '0.00000180',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('correctly adjusts offsets in vout inscriptions', () => {
    const tx = {
      vin: [
        {
          value: '0.00000300',
          inscriptions: [
            { inscriptionId: 'a', offset: 50 },
            { inscriptionId: 'b', offset: 170 },
          ],
        },
        { value: '0.00000200' },
      ],
      vout: [{ value: '0.00000100' }, { value: '0.00000200' }],
    }
    const result = indexOutputs({ tx, currency })
    expect(result.vout).toEqual([
      {
        inscriptions: [
          {
            inscriptionId: 'a',
            offset: 50,
          },
        ],
        value: '0.00000100',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'b',
            offset: 70,
          },
        ],
        value: '0.00000200',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })

  it('handles multiple vin and vout entries correctly', () => {
    const tx = {
      vin: [
        {
          value: '0.00000100',
          inscriptions: [
            { inscriptionId: 'a', offset: 10 },
            { inscriptionId: 'b', offset: 20 },
          ],
        },
        {
          value: '0.00000200',
          inscriptions: [
            { inscriptionId: 'c', offset: 110 },
            { inscriptionId: 'd', offset: 120 },
          ],
        },
        {
          value: '0.00000300',
          inscriptions: [
            { inscriptionId: 'e', offset: 210 },
            { inscriptionId: 'f', offset: 220 },
          ],
        },
        {
          value: '0.00000200',
          inscriptions: [
            { inscriptionId: 'g', offset: 310 },
            { inscriptionId: 'h', offset: 450 },
          ],
        },
      ],
      vout: [
        { value: '0.00000300' },
        { value: '0.00000300' },
        { value: '0.00000400' },
        { value: '0.00000500' },
      ],
    }
    const result = indexOutputs({ tx, currency })

    expect(result.vout).toEqual([
      {
        inscriptions: [
          {
            inscriptionId: 'a',
            offset: 10,
          },
          {
            inscriptionId: 'b',
            offset: 20,
          },
          {
            inscriptionId: 'c',
            offset: 210,
          },
          {
            inscriptionId: 'd',
            offset: 220,
          },
        ],
        value: '0.00000300',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'e',
            offset: 210,
          },
          {
            inscriptionId: 'f',
            offset: 220,
          },
        ],
        value: '0.00000300',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'g',
            offset: 310,
          },
        ],
        value: '0.00000400',
      },
      {
        inscriptions: [
          {
            inscriptionId: 'h',
            offset: 50,
          },
        ],
        value: '0.00000500',
      },
    ])
    expect(result.vin).toEqual(tx.vin)
    expect(result.inscriptionsMemoryIndexed).toBe(true)
  })
})
