import { isTransactionMessage } from '../msg/validation.js'

const messageLegacy =
  '0100010277e8c8c9d0683da133ceeb6a7229f741c276498409f035d7a40e3e51ec4f50ef000000000000000000000000000000000000000000000000000000000000000086cf1e68ae324d22f3acbd3fed09846122e67774e1631c6d922784d1a67f008c01010200000c02000000e803000000000000'
const messageV0 =
  '800100010277e8c8c9d0683da133ceeb6a7229f741c276498409f035d7a40e3e51ec4f50ef000000000000000000000000000000000000000000000000000000000000000086cf1e68ae324d22f3acbd3fed09846122e67774e1631c6d922784d1a67f008c01010200000c02000000e80300000000000000'

describe('Solana: isTransactionMessage', () => {
  it('should detect legacy messages', () => {
    expect(isTransactionMessage(Buffer.from(messageLegacy, 'hex'))).toBeTruthy()
  })
  it('should detect legacy messages', () => {
    expect(isTransactionMessage(Buffer.from(messageV0, 'hex'))).toBeTruthy()
  })
})
