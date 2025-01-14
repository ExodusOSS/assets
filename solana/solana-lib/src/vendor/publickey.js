import { edwardsToMontgomeryPublicSync } from '@exodus/crypto/curve25519'
import { hashSync } from '@exodus/crypto/hash'
import BN from 'bn.js'
import bs58 from 'bs58'

/**
 * Maximum length of derived pubkey seed
 */
export const MAX_SEED_LENGTH = 32

/**
 * A public key
 */
export class PublicKey {
  _bn

  /**
   * Create a new PublicKey object
   */
  constructor(value) {
    if (typeof value === 'string') {
      // assume base 58 encoding by default
      const decoded = bs58.decode(value)
      if (decoded.length !== 32) {
        throw new Error(`Invalid public key input`)
      }

      this._bn = new BN(decoded)
    } else {
      this._bn = new BN(value)
    }

    if (this._bn.byteLength() > 32) {
      throw new Error(`Invalid public key input`)
    }
  }

  /**
   * Checks if two publicKeys are equal
   */
  equals(publicKey) {
    return this._bn.eq(publicKey._bn)
  }

  /**
   * Return the base-58 representation of the public key
   */
  toBase58() {
    return bs58.encode(this.toBuffer())
  }

  /**
   * Return the byte array representation of the public key in big endian
   */
  toBytes() {
    const buf = this.toBuffer()
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  }

  /**
   * Return the Buffer representation of the public key
   */
  toBuffer() {
    const b = this._bn.toArrayLike(Buffer)
    if (b.length === 32) {
      return b
    }

    const zeroPad = Buffer.alloc(32)
    b.copy(zeroPad, 32 - b.length)
    return zeroPad
  }

  /**
   * Returns a string representation of the public key
   */
  toString() {
    return this.toBase58()
  }

  /**
   * Returns a JSON representation of the public key
   */
  toJSON() {
    return this.toBase58()
  }

  /**
   * Find a valid program address
   *
   * Valid program addresses must fall off the ed25519 curve.  This function
   * iterates a nonce until it finds one that when combined with the seeds
   * results in a valid program address.
   * HACK: transformed in sync function
   */
  static findProgramAddress(seeds, programId) {
    let nonce = 255
    let address
    while (nonce !== 0) {
      try {
        const seedsWithNonce = [...seeds, Buffer.from([nonce])]
        address = this.createProgramAddress(seedsWithNonce, programId)
      } catch {
        nonce--
        continue
      }

      return [address, nonce]
    }

    throw new Error('Unable to find a viable program address nonce')
  }

  /**
   * Derive a public key from another key, a seed, and a program ID.
   * HACK: transformed in sync function
   */
  static createWithSeed(fromPublicKey, seed, programId) {
    const buffer = Buffer.concat([
      fromPublicKey.toBuffer(),
      Buffer.from(seed),
      programId.toBuffer(),
    ])
    const hash = hashSync('sha256', buffer)
    return new PublicKey(hash)
  }

  /**
   * Derive a program address from seeds and a program ID.
   */
  static createProgramAddress(seeds, programId) {
    let buffer = Buffer.alloc(0)
    seeds.forEach(function (seed) {
      if (seed.length > MAX_SEED_LENGTH) {
        throw new Error('Max seed length exceeded')
      }

      buffer = Buffer.concat([buffer, Buffer.from(seed)])
    })
    buffer = Buffer.concat([buffer, programId.toBuffer(), Buffer.from('ProgramDerivedAddress')])
    const hash = hashSync('sha256', buffer, 'hex')
    const publicKeyBytes = new BN(hash, 16).toArray(null, 32)
    if (isOnCurve(publicKeyBytes)) {
      throw new Error('Invalid seeds, address must fall off the curve')
    }

    return new PublicKey(publicKeyBytes)
  }
}

// Check that a pubkey is on the curve.
function isOnCurve(p) {
  try {
    // This tries to parse edwards public key and validates it
    edwardsToMontgomeryPublicSync({ publicKey: Uint8Array.from(p) })
    return true
  } catch {}

  return false
}
