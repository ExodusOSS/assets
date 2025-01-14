import assert from 'minimalistic-assert'

export const assertPrivateKeyOrSigner = (privateKey, signer) => {
  assert(!!privateKey ^ !!signer, 'either supply `privateKey` or `signer`')
  assert(
    !privateKey || typeof privateKey === 'string' || privateKey instanceof Buffer,
    'invalid `privateKey` type'
  )
  assert(
    !signer ||
      (typeof signer === 'object' &&
        typeof signer.getPublicKey === 'function' &&
        typeof signer.sign === 'function'),
    'invalid `signer` type'
  )
}
