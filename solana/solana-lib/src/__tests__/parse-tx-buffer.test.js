import { VersionedTransaction } from '@exodus/solana-web3.js'
import BN from 'bn.js'
import lodash from 'lodash'

import { deserializeTransaction } from '../tx/common.js'
import { isSolanaTransfer, isTokenTransfer, parseTxBuffer } from '../tx/parse-tx-buffer.js'
import {
  SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64,
  VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64,
} from './fixtures.js'

const mockOwners = {
  '2P65sSYFdSTwHgx5TSksGYjgwXLnLtDnY7WcK9YwsEhV': 'HkLu3Prb7ejuSVZAuz9et9ULZU3vvkCfVj88dRJJ9WDb',
  '4mTdcaFGuTPtWrcA4jGUxntiMKkdGM1ixhywWiBQRRKX': 'DchYNBFo5xDMctg95U2gt6cDr9bEK7dJVx7NNkcX7y1V',
}

const mockApi = {
  getTokenAddressOwner: (address) => {
    return mockOwners[address]
  },
}

const SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER = deserializeTransaction(
  Buffer.from(SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64, 'base64')
)
const VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER = deserializeTransaction(
  Buffer.from(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64, 'base64')
)

describe('.isTokenTransfer()', () => {
  it('should detect token transfer', async () => {
    expect(isTokenTransfer(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)).toBe(true)
  })

  it('should not detect other transactions', async () => {
    let tx1 = lodash.cloneDeep(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1 = { ...tx1, message: { ...tx1.message, instructions: [] } }
    tx1 = new VersionedTransaction(tx1.message, tx1.signatures)

    expect(isTokenTransfer(tx1)).toBe(false)

    expect(isTokenTransfer(SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)).toBe(false)
  })
})

describe('.isSolanaTransfer()', () => {
  it('should detect solana transfer', async () => {
    expect(isSolanaTransfer(SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)).toBe(true)
  })

  it('should not detect other transactions', async () => {
    let tx1 = lodash.cloneDeep(SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)
    tx1 = { ...tx1, message: { ...tx1.message, instructions: [] } }
    tx1 = new VersionedTransaction(tx1.message, tx1.signatures)

    expect(isSolanaTransfer(tx1)).toBe(false)

    expect(isSolanaTransfer(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER)).toBe(false)
  })
})

describe('.parseTxBuffer()', () => {
  it('should parse token transfer', async () => {
    expect(
      JSON.stringify(
        await parseTxBuffer(
          Buffer.from(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64, 'base64'),
          mockApi
        )
      )
    ).toEqual(
      JSON.stringify({
        method: 'transfer',
        from: 'DchYNBFo5xDMctg95U2gt6cDr9bEK7dJVx7NNkcX7y1V',
        to: 'HkLu3Prb7ejuSVZAuz9et9ULZU3vvkCfVj88dRJJ9WDb',
        amount: new BN('100000'), // 0.1 USDC
      })
    )
  })

  it('should parse solana transfer', async () => {
    expect(
      JSON.stringify(
        await parseTxBuffer(
          Buffer.from(SOL_VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64, 'base64'),
          mockApi
        )
      )
    ).toEqual(
      JSON.stringify({
        method: 'systemTransfer',
        from: 'DchYNBFo5xDMctg95U2gt6cDr9bEK7dJVx7NNkcX7y1V',
        to: 'HkLu3Prb7ejuSVZAuz9et9ULZU3vvkCfVj88dRJJ9WDb',
        amount: new BN('100000000'), // 0.1 SOL
      })
    )
  })

  it('should throw on other transactions', async () => {
    const tx1 = deserializeTransaction(
      Buffer.from(VERSIONED_TRANSACTION_LEGACY_NEW_FEE_PAYER_BASE64, 'base64')
    )
    tx1.message.instructions = []

    const tx1Buffer = tx1.serialize()

    await expect(parseTxBuffer(tx1Buffer)).rejects.toThrow(
      'Transaction not supported for buffer parsing'
    )
  })
})
