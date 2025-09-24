/* global Observable */
const { Storage } = await import('../../../../web3.test.global.js')
const mockCallMethod = jest.fn()
jest.doMock('@exodus/json-rpc', () => {
  return function () {
    return { __esModule: true, callMethod: mockCallMethod }
  }
})
const handleConnect = jest.fn()
const handleChainChanged = jest.fn()
const handleAccountsChanged = jest.fn()

const { createEthereumProviderProxy } = await import(
  '../../provider-proxy/index.js'
)
const { EthereumProvider } = await import('../provider.js')
const { createStorageWrapper } = await import('../storage.js')

const RunTest = (createProvider) => {
  const address = '0x3d80b31a78c30fc628f20b2c89d7ddbf6e53cedc'
  const storageKeyPrefix = 'exodus'

  const supportedChainIds = ['0x1', '0x89', '0xa4b1']
  const chainId = supportedChainIds[0]

  let ethereum

  let accountsObservable
  let storage

  beforeEach(async () => {
    jest.resetAllMocks()
    // Needed for initialization.
    mockCallMethod.mockImplementation((method) => {
      if (method.endsWith('_eth_accounts')) {
        return [address]
      }

      return null
    })

    accountsObservable = new Observable()
    storage = new Storage()

    // Omit `transport` dependency as the `RPC` class is mocked above.
    ethereum = createProvider({
      accountsObservable,
      storage,
      storageKeyPrefix,
      supportedChainIds,
    })

    // Await initialization.
    await ethereum.request({ method: 'foo' })

    // Register event handlers.
    ethereum.on('connect', handleConnect)
    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)

    // Silence `console.warn`.
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('constructor', () => {
    it("calls 'eth_accounts' method", () => {
      expect(mockCallMethod).toHaveBeenCalledWith(`${chainId}_eth_accounts`, [])
    })

    it("sets 'selectedAddress' field", () => {
      expect(ethereum.selectedAddress).toBe(address)
    })

    it("does not call 'eth_chainId' method", () => {
      expect(mockCallMethod).not.toHaveBeenCalledWith('eth_chainId', [])
    })

    it("sets 'chainId' field to stored value", async () => {
      const providerStorage = createStorageWrapper(storage, storageKeyPrefix)

      await providerStorage.setChainId(supportedChainIds[1])

      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        supportedChainIds,
      })
      await ethereum.request({ method: 'foo' })

      expect(ethereum.chainId).toBe(supportedChainIds[1])

      await providerStorage.clearChainId()
    })

    it("sets 'chainId' field to the first supported chain if no stored value", () => {
      expect(ethereum.chainId).toBe(supportedChainIds[0])
    })

    it("sets 'chainId' field to 'getDefaultChainId' return value if available", async () => {
      const chainId = '0x38'
      const getDefaultChainId = async () => chainId

      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        getDefaultChainId,
      })

      await ethereum.request({ method: 'eth_requestAccounts' })

      expect(ethereum.chainId).toBe(chainId)
    })

    it("converts 'chainId' returned by 'getDefaultChainId' to lower case", async () => {
      const chainId = '0xA4B1'
      const getDefaultChainId = async () => chainId

      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        getDefaultChainId,
      })

      await ethereum.request({ method: 'eth_requestAccounts' })
      expect(ethereum.chainId).toBe(chainId.toLowerCase())
    })

    it("do not set 'chainId' field to `getDefaultChainId` result if `chainId` is already stored", async () => {
      const getDefaultChainId = async () => '0x38'
      const providerStorage = createStorageWrapper(storage, storageKeyPrefix)

      await providerStorage.setChainId('0x89')

      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        getDefaultChainId,
      })

      await ethereum.request({ method: 'foo' })
      expect(ethereum.chainId).toBe('0x89')

      await ethereum.request({ method: 'eth_requestAccounts' })
      expect(ethereum.chainId).toBe('0x89')

      await providerStorage.clearChainId()
    })

    it("handles missing 'supportedChainIds' dependency gracefully", async () => {
      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        getDefaultChainId: async () => '0x89',
      })

      // Shouldn't throw.
      await ethereum.request({ method: 'eth_requestAccounts' })
    })

    it("handles missing 'getDefaultChainId' dependency gracefully", async () => {
      // Simulate reload and await initialization.
      const ethereum = createProvider({
        accountsObservable,
        storage,
        storageKeyPrefix,
        supportedChainIds: ['0x1'],
      })

      // Shouldn't throw.
      await ethereum.request({ method: 'eth_requestAccounts' })
    })

    it("sets '_isConnected' flag", () => {
      expect(ethereum.isConnected()).toBe(true)
    })

    it("does not emit a 'chainChanged' event", async () => {
      expect(handleChainChanged).not.toHaveBeenCalled()
    })

    it("does not emit an 'accountsChanged' event", async () => {
      expect(handleAccountsChanged).not.toHaveBeenCalled()
    })
  })

  describe('request', () => {
    it('calls the given method with the given params', async () => {
      mockCallMethod.mockResolvedValueOnce('resp')

      const resp = await ethereum.request({ method: 'foo', params: [42] })

      expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
      expect(resp).toBe('resp')
    })

    it('allows named params', async () => {
      await ethereum.request({ method: 'foo', params: { bar: 42 } })

      expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', {
        bar: 42,
      })
    })

    it('allows not supplying params', async () => {
      await ethereum.request({ method: 'foo' })
      expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [])
    })

    it.skip('throws if not connected', async () => {
      // TODO: Re-add me.

      try {
        await ethereum.request({ method: 'foo' })
        throw new Error('Call should have thrown')
      } catch (err) {
        expect(err.code).toBe(4900)
      }
    })

    it.each([42, ''])("throws if 'method' is not valid", async (method) => {
      try {
        await ethereum.request({ method })
        throw new Error('Call should have thrown')
      } catch (err) {
        expect(err.code).toBe(-32600)
      }
    })

    it.each(['bar', 42, null])(
      "throws if 'params' is not valid",
      async (params) => {
        try {
          await ethereum.request({ method: 'foo', params })
          throw new Error('Call should have thrown')
        } catch (err) {
          expect(err.code).toBe(-32600)
        }
      },
    )

    it("intercepts 'eth_requestAccounts' request", async () => {
      mockCallMethod.mockResolvedValueOnce().mockResolvedValueOnce('resp')

      const resp = await ethereum.request({ method: 'eth_requestAccounts' })

      expect(mockCallMethod).toHaveBeenCalledWith(
        '0x1_wallet_requestPermissions',
        [{ eth_accounts: {} }],
      )
      expect(mockCallMethod).toHaveBeenCalledWith('0x1_eth_accounts', [])
      expect(resp).toBe('resp')
    })

    it("intercepts 'wallet_addEthereumChain' request", async () => {
      const newChainId = supportedChainIds[1]

      const resp = await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{ chainId: newChainId }],
      })

      expect(mockCallMethod).not.toHaveBeenCalledWith(
        `${chainId}_wallet_addEthereumChain`,
        [{ chainId: newChainId }],
      )
      expect(ethereum.chainId).toBe(newChainId)
      expect(handleChainChanged).toHaveBeenCalledWith(newChainId)
      expect(resp).toBe(null)
    })

    it("intercepts 'wallet_switchEthereumChain' request if chain known to the provider", async () => {
      const newChainId = supportedChainIds[1]

      const resp = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: newChainId }],
      })

      expect(mockCallMethod).not.toHaveBeenCalledWith(
        `${chainId}_wallet_switchEthereumChain`,
        [{ chainId: newChainId }],
      )
      expect(ethereum.chainId).toBe(newChainId)
      expect(handleChainChanged).toHaveBeenCalledWith(newChainId)
      expect(resp).toBe(null)
    })

    it("short-circuits 'wallet_switchEthereumChain' request if chain is already active", async () => {
      const resp = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })

      expect(mockCallMethod).not.toHaveBeenCalledWith(
        `${chainId}_wallet_switchEthereumChain`,
        [{ chainId }],
      )
      expect(ethereum.chainId).toBe(chainId)
      expect(handleChainChanged).not.toHaveBeenCalled()
      expect(resp).toBe(null)
    })

    it("forwards 'wallet_switchEthereumChain' request if chain is not known to the provider", async () => {
      mockCallMethod.mockResolvedValueOnce(true)

      const newChainId = '0x38'

      const resp = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: newChainId }],
      })

      expect(mockCallMethod).toHaveBeenCalledWith(
        `${chainId}_wallet_switchEthereumChain`,
        [{ chainId: newChainId }],
      )
      expect(ethereum.chainId).toBe(newChainId)
      expect(handleChainChanged).toHaveBeenCalledWith(newChainId)
      expect(resp).toBe(null)
    })

    it("allows 'wallet_switchEthereumChain' request with uppercase chainId", async () => {
      const upperCaseChainId = '0xA4B1'
      const lowerCaseChainId = upperCaseChainId.toLowerCase()

      const resp = await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: upperCaseChainId }],
      })

      expect(mockCallMethod).not.toHaveBeenCalledWith(
        `${chainId}_wallet_switchEthereumChain`,
        [upperCaseChainId],
      )
      expect(ethereum.chainId).toBe(lowerCaseChainId)
      expect(handleChainChanged).toHaveBeenCalledWith(lowerCaseChainId)
      expect(resp).toBe(null)
    })
  })

  describe('when accounts change', () => {
    const accounts = [address]
    const newAccounts = ['0xd46e8dd67c5d32be8058bb8eb970870f07244567']

    describe('when connected', () => {
      it('updates the public key', () => {
        accountsObservable.notify(newAccounts)

        expect(ethereum.selectedAddress).toBe(newAccounts[0])
      })

      it("emits an 'accountsChanged' event", () => {
        const handleAccountsChanged = jest.fn()
        ethereum.on('accountsChanged', handleAccountsChanged)

        accountsObservable.notify(newAccounts)

        expect(handleAccountsChanged).toHaveBeenCalledWith(newAccounts)
      })

      it('ignores the change if public key is the same', () => {
        const handleAccountsChanged = jest.fn()
        ethereum.on('accountsChanged', handleAccountsChanged)

        accountsObservable.notify(accounts)

        expect(ethereum.selectedAddress).toBe(accounts[0])
        expect(handleAccountsChanged).not.toHaveBeenCalled()
      })
    })

    describe('when disconnected', () => {
      beforeEach(async () => {
        await ethereum.emit('disconnect')
      })

      it('does nothing', () => {
        const handleAccountsChanged = jest.fn()
        ethereum.on('accountsChanged', handleAccountsChanged)

        accountsObservable.notify(newAccounts)

        expect(handleAccountsChanged).not.toHaveBeenCalled()
      })
    })
  })

  /*
   * Legacy API.
   */

  describe('enable', () => {
    it("calls 'eth_requestAccounts' and returns the response", async () => {
      const expectedResponse = ['0xb60e8dd61c5d32be8058bb8eb970870f07233155']
      mockCallMethod
        .mockResolvedValueOnce()
        .mockResolvedValueOnce(expectedResponse)

      const resp = await ethereum.enable()

      expect(mockCallMethod).toHaveBeenCalledWith(
        `${chainId}_wallet_requestPermissions`,
        [{ eth_accounts: {} }],
      )
      expect(mockCallMethod).toHaveBeenCalledWith(`${chainId}_eth_accounts`, [])
      expect(resp).toEqual(expectedResponse)
    })

    it.skip('throws if not connected', async () => {
      // TODO: re-add me

      try {
        await ethereum.enable()
        throw new Error('Call should have thrown')
      } catch (err) {
        expect(err.code).toBe(4900)
      }
    })
  })

  describe('send', () => {
    beforeEach(() => {
      mockCallMethod.mockResolvedValueOnce('result')
    })

    describe('method and params signature', () => {
      it('calls request and returns the response', async () => {
        const resp = await ethereum.send('foo', [42])

        expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
        expect(resp).toEqual({ id: '1', jsonrpc: '2.0', result: 'result' })
      })

      it('throws on failure', async () => {
        const error = new Error('Failed!')
        mockCallMethod.mockReset().mockRejectedValueOnce(error)

        await expect(ethereum.send('foo', [42])).rejects.toEqual({
          id: '1',
          jsonrpc: '2.0',
          error,
        })
      })
    })

    describe('callback signature', () => {
      it('passes response on success', (done) => {
        ethereum.send(
          { id: '1', jsonrpc: '2.0', method: 'foo', params: [42] },
          (err, resp) => {
            if (err) {
              done(err)
              return
            }

            try {
              expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
              expect(err).toBeNull()
              expect(resp).toEqual({
                id: '1',
                jsonrpc: '2.0',
                result: 'result',
              })
              done()
            } catch (err) {
              done(err)
            }
          },
        )
      })

      it('passes error on failure', (done) => {
        const error = new Error('Failed!')
        mockCallMethod.mockReset().mockRejectedValueOnce(error)

        ethereum.send(
          { id: '1', jsonrpc: '2.0', method: 'foo', params: [42] },
          (err, resp) => {
            try {
              expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
              expect(err).toEqual(error)
              expect(resp).toEqual({ id: '1', jsonrpc: '2.0', error })
              done()
            } catch (err) {
              done(err)
            }
          },
        )
      })
    })
  })

  describe('sendAsync', () => {
    beforeEach(() => {
      mockCallMethod.mockResolvedValueOnce('result')
    })

    describe('without callback', () => {
      it('calls request with the provided payload', async () => {
        const resp = await ethereum.sendAsync({
          id: '1',
          jsonrpc: '2.0',
          method: 'foo',
          params: [42],
        })

        expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
        expect(resp).toBeUndefined()
      })
    })

    describe('with callback', () => {
      it('calls request and returns the response on success', (done) => {
        ethereum.sendAsync(
          {
            id: '1',
            jsonrpc: '2.0',
            method: 'foo',
            params: [42],
          },
          (err, resp) => {
            expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
            expect(err).toBeNull()
            expect(resp).toEqual({
              id: '1',
              jsonrpc: '2.0',
              result: 'result',
            })
            done()
          },
        )
      })

      it('calls request and returns the error on failure', (done) => {
        const error = new Error('Failed!')
        mockCallMethod.mockReset().mockRejectedValueOnce(error)

        ethereum.sendAsync(
          {
            id: '1',
            jsonrpc: '2.0',
            method: 'foo',
            params: [42],
          },
          (err, resp) => {
            expect(mockCallMethod).toHaveBeenCalledWith('0x1_foo', [42])
            expect(err).toEqual(error)
            expect(resp).toEqual({ id: '1', jsonrpc: '2.0', error })
            done()
          },
        )
      })
    })
  })

  /**
   * Experimental API.
   */

  describe('_metamask', () => {
    describe('isUnlocked', () => {
      it('should return false if locked', async () => {
        // Simulate real provider not being loaded.
        ethereum = createProvider({
          accountsObservable,
          storage,
          storageKeyPrefix,
          supportedChainIds,
        })

        expect(await ethereum._metamask.isUnlocked()).toBe(false)
      })

      it('should return true if unlocked', async () => {
        await ethereum.request({ method: 'eth_accounts' })
        expect(await ethereum._metamask.isUnlocked()).toBe(true)
      })
    })

    describe('requestBatch', () => {
      it('should send batch requests', async () => {
        mockCallMethod.mockImplementation((method) => {
          return 'resp_' + method
        })
        const resp = await ethereum._metamask.requestBatch([
          { method: 'foo1', params: [42] },
          { method: 'foo2', params: [42] },
          { method: 'foo3', params: [42] },
        ])

        expect(mockCallMethod).toHaveBeenCalledWith(`${chainId}_foo1`, [42])
        expect(mockCallMethod).toHaveBeenCalledWith(`${chainId}_foo2`, [42])
        expect(mockCallMethod).toHaveBeenCalledWith(`${chainId}_foo3`, [42])
        expect(Array.isArray(resp)).toBeTruthy()
        expect(resp).toStrictEqual([
          `resp_${chainId}_foo1`,
          `resp_${chainId}_foo2`,
          `resp_${chainId}_foo3`,
        ])
      })
    })
  })
}

describe('EthereumProvider', () => {
  RunTest((args) => {
    return new EthereumProvider(args)
  })
})

describe('EthereumProviderProxy', () => {
  RunTest((args) => {
    const proxy = createEthereumProviderProxy({
      isWalletNameFlag: 'isExodus',
      getDefaultChainId: args.getDefaultChainId,
      walletProviderManager: {
        getDefaultWalletProvider: () => null,
      },
      getManagementProvider: () => ({
        askUserToChooseWallet: () => null,
      }),
      getEthereumProvider: () => new EthereumProvider(args),
    })

    return proxy
  })
})
