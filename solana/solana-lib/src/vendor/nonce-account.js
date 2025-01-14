import * as BufferLayout from '@exodus/buffer-layout'

import { PublicKey } from './publickey.js'
import { FeeCalculatorLayout } from './utils/fee-calculator.js'
import * as Layout from './utils/layout.js'
import { toBuffer } from './utils/to-buffer.js'

/**
 * See https://github.com/solana-labs/solana/blob/0ea2843ec9cdc517572b8e62c959f41b55cf4453/sdk/src/nonce_state.rs#L29-L32
 *
 * @private
 */
const NonceAccountLayout = BufferLayout.struct([
  BufferLayout.u32('version'),
  BufferLayout.u32('state'),
  Layout.publicKey('authorizedPubkey'),
  Layout.publicKey('nonce'),
  BufferLayout.struct([FeeCalculatorLayout], 'feeCalculator'),
])

export const NONCE_ACCOUNT_LENGTH = NonceAccountLayout.span

/**
 * NonceAccount class
 */
export class NonceAccount {
  authorizedPubkey
  nonce
  feeCalculator

  /**
   * Deserialize NonceAccount from the account data.
   *
   * @param buffer account data
   * @returns NonceAccount
   */
  static fromAccountData(buffer) {
    const nonceAccount = NonceAccountLayout.decode(toBuffer(buffer), 0)
    nonceAccount.authorizedPubkey = new PublicKey(nonceAccount.authorizedPubkey)
    nonceAccount.nonce = new PublicKey(nonceAccount.nonce).toString()
    return nonceAccount
  }
}
