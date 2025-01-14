import { getKeyPairFromPrivateKey } from '../keypair.js'
import { PublicKey } from './publickey.js'

/**
 * An account key pair (public and secret keys).
 */
export class Account {
  _keypair

  /**
   * Create a new Account object
   *
   * @param secretKey Secret key for the account
   */
  constructor(secretKey) {
    if (secretKey) {
      this._keypair = getKeyPairFromPrivateKey(secretKey)
    } else {
      throw new Error('Please provide a secretKey')
    }
  }

  /**
   * The public key for this account
   */
  get publicKey() {
    return new PublicKey(this._keypair.publicKey)
  }

  /**
   * The **unencrypted** secret key for this account, 32 bytes
   */
  get privateKey() {
    return this._keypair.privateKey
  }
}
