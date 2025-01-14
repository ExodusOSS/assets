import { signMessage } from '../sign-message.js'

const PRIVATE_KEY = 'f337ed3d9ff8a861d9b83e444c0bfb51a24388e39f23ca96e33565265a58f2e5'

const fixtures = [
  {
    descr: 'should sign bip322 message (segwit)',
    input: {
      bip322Message: {
        address: 'bc1q6asq5dfr9vuup8tvt89kdnwr3vfl3dn68ql030',
        message: Buffer.from('hello world!', 'utf8'),
      },
    },
    expected: Buffer.from(
      '024830450221008365eb74e378ad1d457e27574ea183dc827ecbcc2b7cf82c7979d2eef560160502205a23fb2da9fc8807b41b1916f1446b028b832c02ce4c4a1d3d8b94f6765667cb012102fcb043bce1f76fccc4309f1d599562202ab5b8d091a838351f5fe55fe2b90a92',
      'hex'
    ),
  },
  {
    descr: 'should sign bip322 message (legacy address)',
    input: {
      bip322Message: {
        address: '1LdoLDEYbNavR8EhJUi6F3ueiVmiaTJXvk',
        message: Buffer.from('hello world!', 'utf8'),
      },
    },
    expected: Buffer.from(
      '20be7d841d9b22b4231518ed12acfd2022c8e57ee7603d881c34aa8c3e784bdeac4d216ac6a61478f0a7015f9bc7b3a456cae279b205039ddcbd2fb2d329f9767d',
      'hex'
    ),
  },
]

describe('.signMessage()', () => {
  const privateKey = Buffer.from(PRIVATE_KEY, 'hex')
  it.each(fixtures)('$descr', async ({ input, expected }) => {
    const result = await signMessage({
      privateKey,
      message: input,
    })
    expect(result.toString('hex')).toEqual(expected.toString('hex'))
  })
})
