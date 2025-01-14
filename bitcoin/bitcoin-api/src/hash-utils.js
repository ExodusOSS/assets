import { hashSync } from '@exodus/crypto/hash'

export function hash160(buffer) {
  return hashSync('hash160', buffer)
}

export function sha256(buffer) {
  return hashSync('sha256', buffer)
}
