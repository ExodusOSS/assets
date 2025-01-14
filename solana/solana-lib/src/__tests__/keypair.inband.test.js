import { getEncodedSecretKey, getPrivateKeyFromSecretKey } from '../encode.js'
import {
  generateKeyPair,
  getKeyPairFromPrivateKey,
  getPublicKey,
  sign,
  verifySignature,
} from '../keypair.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627' // seed
const PUBLIC_KEY = '2694741f79e105feac100ae2dbfc7d3ef0fc7fdeced1c9b1c2f7f927d8460e10'
const SECRET_KEY =
  '2k9iKimvUZ2dqVCq7j8sJrwnLaT4AxUXKZQUU3C1Dbex5dbxQ2kNrNQjkn3xsc6YC6sbdGZTNRxRqVKUc3AVKE5d'

const MESSAGE = Buffer.from('hello world', 'utf8')
const VALID_SIGNATURE = Buffer.from(
  '74a166159b7a71a07c5abdb8394df42b26e7ccbd6d9fd52fac9b14afb5c2ea85d90bb74b1cec86a5fcf7d3b4a92936c3acfa2690abc64877fa69e7269e20a708',
  'hex'
)

test('getEncodedSecretKey', () => {
  // Used by other Solana wallets (e.g Phantom etc.)
  const secretKey = getEncodedSecretKey(PRIVATE_KEY)
  expect(secretKey).toEqual(SECRET_KEY)
})

test('getPrivateKeyFromSecretKey', () => {
  const privateKey = getPrivateKeyFromSecretKey(SECRET_KEY)
  expect(privateKey).toEqual(Buffer.from(PRIVATE_KEY, 'hex'))
})

test('getKeyPairFromPrivateKey', () => {
  const keyPair = getKeyPairFromPrivateKey(PRIVATE_KEY)
  expect(keyPair.privateKey).toEqual(Buffer.from(PRIVATE_KEY, 'hex'))
  expect(keyPair.publicKey).toEqual(Buffer.from(PUBLIC_KEY, 'hex'))
})

test('generateKeyPair', () => {
  const keyPair = generateKeyPair()
  expect(keyPair.privateKey.toString('hex').length === 64).toBeTruthy()
  // Base-58 encoded string from PublicKey class, does not support toString('hex')
  const addressLength = keyPair.publicKey.toString().length
  expect(addressLength >= 32 && addressLength <= 44).toBeTruthy()
})

test('getPublicKey', () => {
  expect(getPublicKey(PRIVATE_KEY)).toEqual(Buffer.from(PUBLIC_KEY, 'hex')) // as string
  expect(getPublicKey(Buffer.from(PRIVATE_KEY, 'hex'))).toEqual(Buffer.from(PUBLIC_KEY, 'hex')) // as Buffer
})

test('sign', () => {
  const result = sign(MESSAGE, PRIVATE_KEY)
  expect(result.toString('hex')).toEqual(VALID_SIGNATURE.toString('hex'))
  expect(verifySignature(MESSAGE, result, PUBLIC_KEY)).toBeTruthy()
})
