import { create } from '@exodus/keychain/module/crypto/ed25519.js'

import { verifySignature } from '../keypair.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627' // seed
const PUBLIC_KEY = '2694741f79e105feac100ae2dbfc7d3ef0fc7fdeced1c9b1c2f7f927d8460e10'
// const SECRET_KEY =
//   '2k9iKimvUZ2dqVCq7j8sJrwnLaT4AxUXKZQUU3C1Dbex5dbxQ2kNrNQjkn3xsc6YC6sbdGZTNRxRqVKUc3AVKE5d'

const MESSAGE = Buffer.from('hello world', 'utf8')
const VALID_SIGNATURE = Buffer.from(
  '74a166159b7a71a07c5abdb8394df42b26e7ccbd6d9fd52fac9b14afb5c2ea85d90bb74b1cec86a5fcf7d3b4a92936c3acfa2690abc64877fa69e7269e20a708',
  'hex'
)

test('signBuffer from ed25519 signer', async () => {
  const getPrivateHDKey = () => ({ privateKey: Buffer.from(PRIVATE_KEY, 'hex') })
  const { signBuffer } = create({ getPrivateHDKey })
  const result = await signBuffer({ data: MESSAGE, keyId: { keyType: 'nacl' } })

  expect(result.toString('hex')).toEqual(VALID_SIGNATURE.toString('hex'))
  expect(verifySignature(MESSAGE, result, PUBLIC_KEY)).toBeTruthy()
})
