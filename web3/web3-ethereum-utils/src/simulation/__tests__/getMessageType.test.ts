import { getMessageType, MessageTypeEnum } from '../getMessageType.js'

describe('getMessageType', () => {
  it('returns "PersonalSign" type for a plain text', () => {
    const type = getMessageType('hello world')
    expect(type).toEqual(MessageTypeEnum.RawMessage)
  })

  it('returns "Unknown" type for a non-string input', () => {
    const type = getMessageType({ test: true })
    expect(type).toEqual(MessageTypeEnum.Unknown)
  })

  it('returns "TypedData" type for a stringified object', () => {
    const type = getMessageType(JSON.stringify({ domain: 'Domain' }))
    expect(type).toEqual(MessageTypeEnum.TypedData)
  })
})
