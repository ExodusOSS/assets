import createAppDepsFactory from '../createAppDeps'

/*
 * Set up mocks.
 */
const mockGetAsset = jest.fn()
const mockIsTrusted = jest.fn()
const mockUpdateConnection = jest.fn()
const mockAddConnection = jest.fn()
const mockIsAutoApprove = jest.fn()
const mockUpsertNotes = jest.fn()
const mockApproveConnection = jest.fn()
const mockApproveTransaction = jest.fn()
const mockApproveMessage = jest.fn()
const mockScanDomains = jest.fn()
const mockUntrust = jest.fn()

const assetName = 'ethereum'
const network = 'evm:0x1'

const supportedChains = [
  {
    assetName,
    network,
  },
]

const dependencyTree = {
  assetsModule: {
    getAsset: mockGetAsset,
  },
  connectedOrigins: {
    isTrusted: mockIsTrusted,
    updateConnection: mockUpdateConnection,
    add: mockAddConnection,
    isAutoApprove: mockIsAutoApprove,
    untrust: mockUntrust,
  },
  personalNotes: {
    upsert: mockUpsertNotes,
  },
  supportedChains,
}

const approvalHandlers = {
  approveConnection: mockApproveConnection,
  approveTransaction: mockApproveTransaction,
  approveMessage: mockApproveMessage,
}

const connectionInformation = {
  origin: 'exodus.com',
  name: 'test',
  icon: {
    data: '',
    height: 100,
    width: 100,
  },
}

describe('createAppDepsFactory', () => {
  let createAppDeps
  let appDeps

  beforeAll(async () => {
    createAppDeps = createAppDepsFactory(dependencyTree)
  })

  beforeEach(()=>{
    jest.restoreAllMocks()
  })

  it('should return createAppDeps function', () => {
    expect(createAppDeps).toBeInstanceOf(Function)
  })

  it('should create AppDeps', () => {
    appDeps = createAppDeps({
      approvalHandlers,
      connectionInfo: connectionInformation,
      scanDomains: mockScanDomains,
      supportedChains,
    })
    expect(appDeps).toBeInstanceOf(Object)
  })

  describe('.isTrusted()', () => {
    it('should call connectedOrigins.isTrusted()', async () => {
      mockIsTrusted.mockResolvedValueOnce(true)
      const trusted = await appDeps.isTrusted(network)

      expect(trusted).toBe(true)
      expect(mockIsTrusted).toHaveBeenCalledWith({
        origin: connectionInformation.origin,
      })
      expect(mockUpdateConnection).toHaveBeenCalledWith({
        origin: connectionInformation.origin,
        icon: connectionInformation.icon,
      })
    })
  })

  describe('.ensureTrusted()', () => {
    it('should call connectedOrigins.add()', async () => {
      mockGetAsset.mockResolvedValueOnce({
        baseAssetName: 'ethereum',
      })
      mockAddConnection.mockResolvedValueOnce(true)
      await appDeps.ensureTrusted('ethereum')

      expect(mockAddConnection).toHaveBeenCalledWith({
        ...connectionInformation,
        connectedAssetName: 'ethereum',
        assetNames: ['ethereum'],
        trusted: true,
      })
    })
  })

  describe('.ensureUntrusted()', () => {
    it('should call connectedOrigins.untrust()', async () => {
      mockGetAsset.mockResolvedValueOnce({
        baseAssetName: 'ethereum',
      })
      await appDeps.ensureUntrusted()

      expect(mockUntrust).toHaveBeenCalledWith({
        origin: connectionInformation.origin,
      })
    })
  })

  describe('.isAutoApproved()', () => {
    it('should call connectedOrigins.isAutoApprove', async () => {
      mockIsAutoApprove.mockResolvedValueOnce(true)
      await appDeps.isAutoApproved()

      expect(mockIsAutoApprove).toHaveBeenCalledWith({
        origin: connectionInformation.origin,
      })
    })
  })

  describe('.getAsset()', () => {
    it('should call assetsModule with assets name', async () => {
      mockGetAsset.mockResolvedValueOnce({
        baseAssetName: 'ethereum',
      })

      await appDeps.getAsset(network)

      expect(mockGetAsset).toHaveBeenCalledWith(assetName)
    })

    it('should throw if network is not supported', async () => {
      await expect(() => appDeps.getAsset('evm:0x1337')).rejects.toThrow()
    })

    it('should throw if asset is not supported', async () => {
      await expect(() => appDeps.getAsset('notasset')).rejects.toThrow()
    })
  })

  describe('.onTransactionsSigned()', () => {
    it('should have upserted personal notes', async () => {
      await appDeps.onTransactionsSigned(network, [
        'transactionId1',
        'transactionId2',
      ])
      expect(mockUpsertNotes).toHaveBeenCalledWith({
        txId: 'transactionId1',
        providerData: {
          network,
          origin: connectionInformation.origin,
        },
      })
      expect(mockUpsertNotes).toHaveBeenCalledWith({
        txId: 'transactionId2',
        providerData: {
          network,
          origin: connectionInformation.origin,
        },
      })
    })
  })
})
