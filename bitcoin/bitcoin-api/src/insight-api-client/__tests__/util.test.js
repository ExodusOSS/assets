import { normalizeInsightConfig, toWSUrl } from '../util.js'

describe('normalizeInsightConfig', () => {
  test('when missing insightServersWS should fallback to insightServers', () => {
    expect(
      normalizeInsightConfig({ insightServers: ['https://somebtc.a.exodus.io/insight/'] })
    ).toEqual({
      apiUrl: 'https://somebtc.a.exodus.io/insight/',
      wsUrl: 'https://somebtc.a.exodus.io',
    })
  })
  test('when including insightServersWS', () => {
    expect(
      normalizeInsightConfig({
        insightServers: [
          'https://somebtc.a.exodus.io/insight/',
          'https://somebtc2.a.exodus.io/insight/',
        ],
        insightServersWS: ['https://somebtc.a.exodus.io/ws'],
      })
    ).toEqual({
      apiUrl: 'https://somebtc.a.exodus.io/insight/',
      wsUrl: 'https://somebtc.a.exodus.io/ws',
    })
  })

  test('when missing both', () => {
    expect(
      normalizeInsightConfig({
        insightServers: [],
        insightServersWS: [],
      })
    ).toEqual({
      apiUrl: undefined,
      wsUrl: undefined,
    })

    expect(normalizeInsightConfig({ insightServers: undefined })).toEqual({
      apiUrl: undefined,
      wsUrl: undefined,
    })
  })
})

describe('toWSUrl', () => {
  test('it converts an apiURL to ws', () => {
    expect(toWSUrl('https://somebtc.a.exodus.io/insight/')).toEqual('https://somebtc.a.exodus.io')
    expect(toWSUrl('https://somebtc.a.exodus.io/not/part/')).toEqual('https://somebtc.a.exodus.io')
    expect(toWSUrl('https://somebtc.a.exodus.io/insight')).toEqual('https://somebtc.a.exodus.io')
    expect(toWSUrl('https://somebtc.a.exodus.io/not/part?someParam=true')).toEqual(
      'https://somebtc.a.exodus.io'
    )
    expect(toWSUrl('https://somebtc.a.exodus.io')).toEqual('https://somebtc.a.exodus.io')
    expect(toWSUrl('zzz://broken/insight/')).toEqual('zzz://broken')
    expect(toWSUrl('broken2/still')).toEqual('broken2/still')
  })
})
