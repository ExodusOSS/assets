/* global Observable */

import {
  DisconnectedError,
  MethodNotFoundError,
  UnsupportedMethodError,
} from '@exodus/web3-errors'

import type { Deps } from '../types.js'

await import('../../../../web3.test.global.js')

const deserializeMessageSignature = jest.fn()
const deserializePublicKey = jest.fn()
const deserializeTransaction = jest.fn()
const serializeEncodedMessage = jest.fn()
const serializeTransaction = jest.fn()
const isLegacyTransaction = jest.fn()
const applySignatures = jest.fn()

// Set up mocks.
jest.doMock('@exodus/solana-web3.js', () => ({
  __esModule: true,
  ...jest.requireActual('@exodus/solana-web3.js'),
  PublicKey: function (value) {
    return { toBase58: () => value }
  },
}))

jest.doMock('../utils/signatures.js', () => ({
  __esModule: true,
  ...jest.requireActual('../utils/signatures.js'),
  deserializeMessageSignature,
}))

jest.doMock('../utils/keys.js', () => ({
  __esModule: true,
  ...jest.requireActual('../utils/keys.js'),
  deserializePublicKey,
}))

jest.doMock('../utils/messages.js', () => ({
  __esModule: true,
  ...jest.requireActual('../utils/messages.js'),
  serializeEncodedMessage,
}))

jest.doMock('../utils/transactions.js', () => ({
  __esModule: true,
  ...jest.requireActual('../utils/transactions.js'),
  serializeTransaction,
  deserializeTransaction,
  isLegacyTransaction,
  applySignatures,
  SUPPORTED_TRANSACTION_VERSIONS: new Set(['legacy', 0]),
}))

const mockCallMethod = jest.fn()
jest.doMock('@exodus/json-rpc', () => {
  return function () {
    return { callMethod: mockCallMethod }
  }
})

const { SolanaProvider } = await import('../provider.js')

describe('SolanaProvider', () => {
  const publicKeyBase58 = 'pubkey'
  const publicKey = {
    equals: (publicKey) => publicKey.toBase58() === publicKeyBase58,
    toBase58: () => publicKeyBase58,
  }

  let accountsObservable

  let solana

  beforeEach(() => {
    jest.resetAllMocks()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    accountsObservable = new Observable()

    // Omit `transport` dependency as the `RPC` class is mocked above.
    solana = new SolanaProvider({ accountsObservable } as Deps)
  })

  it('exposes list of supported transaction versions', () => {
    expect(solana.supportedTransactionVersions).toEqual(new Set(['legacy', 0]))
  })

  it('starts with a null public key', () => {
    expect(solana.publicKey).toBeNull()
  })

  describe('isConnected', () => {
    it('is false if public key is null', () => {
      solana.disconnect()

      expect(solana.isConnected).toBe(false)
    })

    it('is true if public key is not null', () => {
      solana._handleAccountsChanged([publicKey])

      expect(solana.isConnected).toBe(true)
    })
  })

  describe('connect', () => {
    const wirePublicKey = 'wirePubkey'

    beforeEach(() => {
      mockCallMethod.mockResolvedValueOnce(wirePublicKey)
      deserializePublicKey.mockReturnValueOnce(publicKey)
    })

    it('calls the corresponding RPC method', async () => {
      await solana.connect()

      expect(mockCallMethod).toHaveBeenCalledWith('sol_connect', [false])
    })

    it('deserializes the wire public key', async () => {
      await solana.connect()

      expect(deserializePublicKey).toHaveBeenCalledWith(wirePublicKey)
    })

    it('sets the public key', async () => {
      await solana.connect()

      expect(solana.publicKey).toEqual(publicKey)
    })

    it('returns a response including the public key', async () => {
      const resp = await solana.connect()

      expect(resp.publicKey).toBe(publicKey)
    })

    it("emits a 'connect' event", async () => {
      const handleConnect = jest.fn()
      solana.on('connect', handleConnect)

      await solana.connect()

      expect(handleConnect).toHaveBeenCalledWith(publicKey)
    })

    it("does not emit an 'accountChanged' event", async () => {
      const handleAccountChanged = jest.fn()
      solana.on('accountChanged', handleAccountChanged)

      await solana.connect()

      expect(handleAccountChanged).not.toHaveBeenCalled()
    })

    it("accepts an 'onlyIfTrusted' option", async () => {
      await solana.connect({ onlyIfTrusted: true })

      expect(mockCallMethod).toHaveBeenCalledWith('sol_connect', [true])
    })
  })

  describe('disconnect', () => {
    beforeEach(async () => {
      deserializePublicKey.mockReturnValueOnce(publicKey)
      await solana.connect()
    })

    it('unsets the public key', async () => {
      await solana.disconnect()

      expect(solana.publicKey).toBeNull()
    })

    it("emits a 'disconnect' event", async () => {
      const handleDisconnect = jest.fn()
      solana.on('disconnect', handleDisconnect)

      await solana.disconnect()

      expect(handleDisconnect).toHaveBeenCalled()
    })

    it("does not emit an 'accountChanged' event", async () => {
      const handleAccountChanged = jest.fn()
      solana.on('accountChanged', handleAccountChanged)

      await solana.disconnect()

      expect(handleAccountChanged).not.toHaveBeenCalled()
    })
  })

  describe('signTransaction', () => {
    const transaction = { signatures: [] }
    const wireTransaction = 'wireTx'
    const signedTransaction = { signatures: [Buffer.from('signature')] }
    const wireSignedTransaction = 'wireSignedTx'

    beforeEach(() => {
      solana._handleAccountsChanged([publicKey])
      serializeTransaction.mockReturnValueOnce(wireTransaction)
      mockCallMethod.mockResolvedValueOnce(wireSignedTransaction)
      deserializeTransaction.mockReturnValueOnce(signedTransaction)
      isLegacyTransaction.mockReturnValue(true)
    })

    it('serializes the given transaction', async () => {
      await solana.signTransaction(transaction)

      expect(serializeTransaction).toHaveBeenCalledWith(transaction)
    })

    it('calls the corresponding RPC method', async () => {
      await solana.signTransaction(transaction)

      expect(mockCallMethod).toHaveBeenCalledWith('sol_signTransaction', [
        wireTransaction,
      ])
    })

    it('deserializes the wire signed transaction', async () => {
      await solana.signTransaction(transaction)

      expect(deserializeTransaction).toHaveBeenCalledWith(wireSignedTransaction)
    })

    it('adds the signature to the given transaction and returns it', async () => {
      const resp = await solana.signTransaction(transaction)

      expect(applySignatures).toHaveBeenCalledWith(
        transaction,
        signedTransaction,
      )
      expect(resp).toBe(transaction)
    })

    it('throws if not connected', async () => {
      solana.disconnect()

      await expect(async () => {
        await solana.signTransaction(transaction)
      }).rejects.toThrow(DisconnectedError)
    })
  })

  describe('signAllTransactions', () => {
    const transaction0 = {
      recentBlockhash: 'blockhash',
      signatures: [],
    }
    const transaction1 = {
      recentBlockhash: 'blockhash',
      signatures: [],
    }
    const transactions = [transaction0, transaction1]
    const wireTransactions = ['wireTx0', 'wireTx1']
    const wireSignedTransactions = ['wireSignedTx0', 'wireSignedTx1']
    const signedTransaction0 = { signatures: [Buffer.from('signature0')] }
    const signedTransaction1 = { signatures: [Buffer.from('signature1')] }
    const signedTransactions = [signedTransaction0, signedTransaction1]

    beforeEach(() => {
      solana._handleAccountsChanged([publicKey])
      serializeTransaction
        .mockReturnValueOnce(wireTransactions[0])
        .mockReturnValueOnce(wireTransactions[1])
      mockCallMethod.mockResolvedValueOnce(wireSignedTransactions)
      deserializeTransaction
        .mockReturnValueOnce(signedTransactions[0])
        .mockReturnValueOnce(signedTransactions[1])
      isLegacyTransaction.mockReturnValue(true)
    })

    it('serializes the given transactions', async () => {
      await solana.signAllTransactions(transactions)

      expect(serializeTransaction).toHaveBeenNthCalledWith(1, transactions[0])
      expect(serializeTransaction).toHaveBeenNthCalledWith(2, transactions[1])
    })

    it('calls the corresponding RPC method', async () => {
      await solana.signAllTransactions(transactions)

      expect(mockCallMethod).toHaveBeenCalledWith('sol_signAllTransactions', [
        wireTransactions,
      ])
    })

    it('deserializes the transactions', async () => {
      await solana.signAllTransactions(transactions)

      expect(deserializeTransaction).toHaveBeenNthCalledWith(
        1,
        wireSignedTransactions[0],
      )
      expect(deserializeTransaction).toHaveBeenNthCalledWith(
        2,
        wireSignedTransactions[1],
      )
    })

    it('adds the signatures to the given transactions and returns them', async () => {
      const resp = await solana.signAllTransactions(transactions)

      expect(applySignatures).toHaveBeenCalledWith(
        transaction0,
        signedTransaction0,
      )
      expect(applySignatures).toHaveBeenCalledWith(
        transaction1,
        signedTransaction1,
      )
      expect(resp).toBe(transactions)
    })

    it('throws if not connected', async () => {
      solana.disconnect()

      await expect(async () => {
        await solana.signAllTransactions(transactions)
      }).rejects.toThrow(DisconnectedError)
    })
  })

  describe('signAndSendTransaction', () => {
    const transaction = {
      recentBlockhash: 'blockhash',
      signatures: [],
    }
    const wireTransaction = 'wireTx'
    const encodedSignature = 'encodedSignature'
    const newBlockhash = 'newBlockhash'

    beforeEach(() => {
      solana._handleAccountsChanged([publicKey])
      serializeTransaction.mockReturnValueOnce(wireTransaction)
      mockCallMethod
        .mockResolvedValueOnce(newBlockhash)
        .mockResolvedValueOnce(encodedSignature)
      isLegacyTransaction.mockReturnValue(true)
    })

    it('serializes the given transaction', async () => {
      await solana.signAndSendTransaction(transaction)

      expect(serializeTransaction).toHaveBeenCalledWith(transaction)
    })

    it('calls the corresponding RPC method', async () => {
      await solana.signAndSendTransaction(transaction)

      expect(mockCallMethod).toHaveBeenCalledWith(
        'sol_signAndSendTransaction',
        [wireTransaction, {}],
      )
    })

    it('returns a response including the signature', async () => {
      const resp = await solana.signAndSendTransaction(transaction)

      expect(resp.signature).toBe(encodedSignature)
    })

    it('accepts send options', async () => {
      const options = { maxRetries: 3, preflightCommitment: 'processed' }

      await solana.signAndSendTransaction(transaction, options)

      expect(mockCallMethod).toHaveBeenCalledWith(
        'sol_signAndSendTransaction',
        [wireTransaction, options],
      )
    })

    it('throws if not connected', async () => {
      solana.disconnect()

      await expect(async () => {
        await solana.signAndSendTransaction(transaction)
      }).rejects.toThrow(DisconnectedError)
    })
  })

  describe('signMessage', () => {
    const message = 'sign below'
    const encodedMessage = new Uint8Array(Buffer.from(message)).toString()
    const wireEncodedMessage = new Uint8Array(Buffer.from(message))
    const display = 'utf8'
    const signature = 'signature'
    const wireSignature = 'wireSignature'

    beforeEach(() => {
      solana._handleAccountsChanged([publicKey])
      serializeEncodedMessage.mockReturnValueOnce(wireEncodedMessage)
      mockCallMethod.mockResolvedValueOnce(wireSignature)
      deserializeMessageSignature.mockReturnValueOnce(signature)
    })

    it('serializes the given message', async () => {
      await solana.signMessage(encodedMessage, display)

      expect(serializeEncodedMessage).toHaveBeenCalledWith(encodedMessage)
    })

    it('calls the corresponding RPC method', async () => {
      await solana.signMessage(encodedMessage, display)

      expect(mockCallMethod).toHaveBeenCalledWith('sol_signMessage', [
        wireEncodedMessage,
        display,
      ])
    })

    it('returns a response including the signature and the public key', async () => {
      const resp = await solana.signMessage(encodedMessage, display)

      expect(resp.signature).toBe(signature)
      expect(resp.publicKey.toBase58()).toBe(publicKey)
    })

    it('throws if not connected', async () => {
      solana.disconnect()

      await expect(async () => {
        await solana.signMessage(encodedMessage, display)
      }).rejects.toThrow(DisconnectedError)
    })
  })

  describe('postMessage', () => {
    it('throws an error', async () => {
      await expect(async () => {
        await solana.postMessage()
      }).rejects.toThrow(UnsupportedMethodError)
    })
  })

  describe('request', () => {
    it('calls the given RPC method with the given parameters', async () => {
      solana.signTransaction = jest.fn()
      const transaction = 'tx'

      await solana.request({
        method: 'signTransaction',
        params: [transaction],
      })

      expect(solana.signTransaction).toHaveBeenCalledWith(transaction)
    })

    it('throws if the given RPC method does not exist', async () => {
      await expect(async () => {
        await solana.request({
          method: 'unknownMethod',
          params: [],
        })
      }).rejects.toThrow(MethodNotFoundError)
    })
  })

  describe('when accounts change', () => {
    const newPublicKeyBase58 = 'newPubkey'

    beforeEach(async () => {
      deserializePublicKey.mockReturnValueOnce(publicKey)
      await solana.connect()
    })

    describe('when connected', () => {
      it('updates the public key', () => {
        accountsObservable.notify([newPublicKeyBase58])

        expect(solana.publicKey.toBase58()).toBe(newPublicKeyBase58)
      })

      it("emits an 'accountChanged' event", () => {
        const handleAccountChanged = jest.fn()
        solana.on('accountChanged', handleAccountChanged)

        accountsObservable.notify([newPublicKeyBase58])

        expect(handleAccountChanged).toHaveBeenCalledWith(solana.publicKey)
      })

      it('ignores the change if public key is the same', () => {
        const handleAccountChanged = jest.fn()
        solana.on('accountChanged', handleAccountChanged)

        accountsObservable.notify([publicKeyBase58])

        expect(solana.publicKey.toBase58()).toBe(publicKeyBase58)
        expect(handleAccountChanged).not.toHaveBeenCalled()
      })
    })

    describe('when disconnected', () => {
      beforeEach(async () => {
        await solana.disconnect()
      })

      it('does nothing', () => {
        const handleAccountChanged = jest.fn()
        solana.on('accountChanged', handleAccountChanged)

        accountsObservable.notify([newPublicKeyBase58])

        expect(solana.publicKey).toBeNull()
        expect(handleAccountChanged).not.toHaveBeenCalled()
      })
    })
  })
})
