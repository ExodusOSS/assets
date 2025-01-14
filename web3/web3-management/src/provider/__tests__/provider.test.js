// Set up mocks.
const mockCallMethod = jest.fn()
jest.mock('@exodus/json-rpc', () => {
  return function () {
    return { callMethod: mockCallMethod }
  }
})

const walletProviderManager = {
  getWalletProviders: jest.fn(),
  setDefaultWalletProvider: jest.fn(),
  getDefaultWalletProvider: jest.fn(),
}

const { ManagementProvider } = await import('../provider.js')

describe('ManagementProvider', () => {
  let management = null
  const walletProviders = [{ name: 'metamask' }]

  beforeEach(async () => {
    // Omit `transport` dependency as the `RPC` class is mocked above.
    management = new ManagementProvider({
      walletProviderManager,
    })
    walletProviderManager.getWalletProviders.mockImplementation(
      () => walletProviders,
    )

    // Silence `console.warn`.
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('.askUserToChooseWallet()', () => {
    const network = 'evm:0x1'

    it('calls the given method', async () => {
      mockCallMethod.mockResolvedValueOnce('exodus')

      const resp = await management.askUserToChooseWallet(network)

      expect(mockCallMethod).toHaveBeenCalledWith(`exodus_selectWallet`, [
        network,
        walletProviders.map(({ name }) => name),
      ])
      expect(resp).toBe('exodus')
    })

    it('throws on failure', async () => {
      const error = new Error('Rejected')
      mockCallMethod.mockRejectedValueOnce(error)

      expect(() => management.askUserToChooseWallet(network)).rejects.toThrow(
        error,
      )
      expect(mockCallMethod).toHaveBeenCalledWith(`exodus_selectWallet`, [
        network,
        walletProviders.map(({ name }) => name),
      ])
    })
  })
})
