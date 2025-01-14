import { signDetached } from '@exodus/crypto/curve25519'
import assert from 'assert'

import { signMessageNew as signMessage } from '../msg/sign-message.js'
import signMessageWithSigner from '../msg/sign-message-with-signer.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627' // seed

const fixtures = [
  {
    descr: 'should sign unsigned raw message',
    input: { rawMessage: Buffer.from('hello world', 'utf8') },
    expected: Buffer.from(
      '74a166159b7a71a07c5abdb8394df42b26e7ccbd6d9fd52fac9b14afb5c2ea85d90bb74b1cec86a5fcf7d3b4a92936c3acfa2690abc64877fa69e7269e20a708',
      'hex'
    ),
  },
]

const privateKey = Buffer.from(PRIVATE_KEY, 'hex')

describe('signMessage()', () => {
  it.each(fixtures)('$descr', async ({ input, expected }) => {
    const result = await signMessage({
      privateKey,
      message: input,
    })

    expect(result).toEqual(expected)
  })
})

describe('signMessageWithSigner()', () => {
  const signer = {
    sign: ({ data, signatureType }) => {
      assert(signatureType === 'ed25519', `can only sign ed25519 for nacl keys`)
      return signDetached({ message: data, privateKey, format: 'buffer' })
    },
  }

  it.each(fixtures)('$descr', async ({ input, expected }) => {
    const result = await signMessageWithSigner({
      signer,
      message: input,
    })
    expect(result).toEqual(expected)
  })
})
