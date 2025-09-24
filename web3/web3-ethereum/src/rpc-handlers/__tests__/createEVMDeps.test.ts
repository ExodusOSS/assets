import { connectAssets } from '@exodus/assets'
import assetsList from '@exodus/ethereum-meta'
import lodash from 'lodash'

const { keyBy } = lodash

const assets = connectAssets(keyBy(assetsList, (asset) => asset.name))
/*
 * Set up mocks.
 */
const mockTrack = jest.fn()
const mockGetActiveWalletAccount = jest.fn()
const mockGetAsset = jest.fn()
const mockGetTxLog = jest.fn()
const mockGetFeeData = jest.fn()
const mockGetCustomFeeRate = jest.fn()
const mockGetAddress = jest.fn()
const mockGetNonce = jest.fn()
const mockServer = {
  proxyToCoinNode: undefined,
  buildRequest: jest.fn(),
  sendRequest: jest.fn(),
  sendRawTransaction: jest.fn(),
}
jest.doMock('@exodus/ethereum-api', () => ({
  __esModule: true,
  fetchGasLimit: jest.fn(),
  getNonce: mockGetNonce,
}))

const dependencyTree = {
  analytics: {
    track: mockTrack,
  },
  blockchainMetadata: {
    getTxLog: mockGetTxLog,
  },
}

const createEVMDeps = await import('../createEVMDeps.js')

const createEVMDepsFactory = createEVMDeps.default

describe('createEvmDepsFactory', () => {
  let createEVMDeps
  let evmDeps

  beforeAll(async () => {
    assets.ethereum.server = mockServer
    createEVMDeps = createEVMDepsFactory(dependencyTree)
  })

  it('should return createEvmDeps function', () => {
    expect(createEVMDeps).toBeInstanceOf(Function)
  })

  it('should create EvmDeps for ethereum', () => {
    const assetName = 'ethereum'
    mockGetAsset.mockReturnValue(assets.ethereum)
    evmDeps = createEVMDeps({
      assetName,
      origin: 'google.com',
      getActiveWalletAccount: mockGetActiveWalletAccount,
      getAsset: mockGetAsset,
      getAddress: mockGetAddress,
      getFeeData: mockGetFeeData,
      getCustomFeeRate: mockGetCustomFeeRate,
    })
    expect(evmDeps).toBeInstanceOf(Object)
  })

  describe('.forwardRequest()', () => {
    it('should build & forward request', async () => {
      const request = {
        method: 'eth_sendRawTransaction',
        params: [
          '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        ],
      }
      mockServer.buildRequest.mockReturnValue(request)
      await evmDeps.forwardRequest(request)
      expect(mockServer.buildRequest).toHaveBeenCalledWith(request)
      expect(mockServer.sendRequest).toHaveBeenCalledWith(request)
    })

    it('should proxy to coin node if set', async () => {
      const request = {
        method: 'eth_sendRawTransaction',
        params: [
          '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
        ],
      }
      mockServer.proxyToCoinNode = jest.fn()
      mockServer.proxyToCoinNode.mockReturnValue(request)
      await evmDeps.forwardRequest(request)
      expect(mockServer.proxyToCoinNode).toHaveBeenCalledWith(request)
      mockServer.proxyToCoinNode = undefined
    })
  })

  describe('.sendRawTransaction()', () => {
    it('should send the transaction', async () => {
      const rawTransaction =
        '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675'
      await evmDeps.sendRawTransaction(rawTransaction)
      expect(mockServer.sendRawTransaction).toHaveBeenCalledWith(rawTransaction)
    })
  })

  describe('.getAddress()', () => {
    it('should retrieve address from wallet', async () => {
      const expectedAddress = '0xa746A2CF6A8Ce1572DCaB1dE7A6F89b28A53B8c6'

      mockGetAddress.mockResolvedValueOnce(expectedAddress)
      const address = await evmDeps.getAddress()

      expect(address).toBe(expectedAddress)
    })
  })

  describe('.getNonce()', () => {
    const address = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
    const activeWalletAccount = 'exodus_0'

    beforeEach(() => {
      mockGetActiveWalletAccount.mockResolvedValue(activeWalletAccount)
      mockGetAddress.mockResolvedValueOnce(address)
      mockGetNonce.mockResolvedValue(1337)
      mockGetTxLog.mockResolvedValue([
        {
          sent: true,
          data: {
            nonce: 1000,
          },
        },
        {
          sent: true,
          data: {},
        },
        {
          sent: true,
          dropped: true,
        },
      ])
    })

    it('should get nonce', async () => {
      const nonce = await evmDeps.getNonce(address)
      expect(nonce).toBe('0x539')
      expect(mockGetActiveWalletAccount).toHaveBeenCalled()
      expect(mockGetTxLog).toHaveBeenCalledWith({
        assetName: 'ethereum',
        walletAccount: activeWalletAccount,
      })
      expect(mockGetNonce).toHaveBeenCalledWith({
        asset: assets.ethereum,
        address,
      })
    })

    it('should get always return max nonce', async () => {
      mockGetTxLog.mockReset().mockResolvedValueOnce([
        {
          sent: true,
          data: {
            nonce: 2000,
          },
        },
        {
          sent: true,
          data: {
            nonce: 1000,
          },
        },
      ])

      const nonce = await evmDeps.getNonce(address)
      expect(nonce).toBe('0x7d1')
    })
  })

  describe('.getFeeData()', () => {
    it('should return gas price', async () => {
      mockGetFeeData.mockResolvedValueOnce({
        gasPrice: assets.ethereum.currency.baseUnit(1000),
      })

      const feeData = await evmDeps.getFeeData()
      expect(mockGetFeeData).toHaveBeenCalledWith({ assetName: 'ethereum' })
      expect(feeData).toEqual({
        gasPrice: '0x3e8',
      })
    })

    it('should respect eip1559 and return maxFeePerGas & maxPriorityFeePerGas', async () => {
      mockGetFeeData.mockResolvedValueOnce({
        gasPrice: assets.ethereum.currency.baseUnit(1000),
        eip1559Enabled: true,
        tipGasPrice: assets.ethereum.currency.baseUnit(500),
      })

      const feeData = await evmDeps.getFeeData()
      expect(mockGetFeeData).toHaveBeenCalledWith({ assetName: 'ethereum' })
      expect(feeData).toEqual({
        gasPrice: '0x3e8',
        maxFeePerGas: '0x3e8',
        maxPriorityFeePerGas: '0x1f4',
      })
    })
  })

  describe('.getCustomFeeData()', () => {
    it('should return nothing if no custom fee rate', async () => {
      mockGetCustomFeeRate.mockResolvedValueOnce(undefined)

      const feeData = await evmDeps.getCustomFeeData()
      expect(feeData).toEqual(undefined)
    })

    it('should return gas price', async () => {
      const customFeeRate = assets.ethereum.currency.Gwei(13)
      mockGetFeeData.mockResolvedValueOnce({
        eip1559Enabled: false,
      })
      mockGetCustomFeeRate.mockResolvedValueOnce(customFeeRate)

      const feeData = await evmDeps.getCustomFeeData()
      expect(mockGetFeeData).toHaveBeenCalledWith({ assetName: 'ethereum' })
      expect(feeData).toEqual({
        gasPrice: '0x' + customFeeRate.toBaseNumber().toString(16),
      })
    })

    it('should respect eip1559 and return maxFeePerGas & maxPriorityFeePerGas', async () => {
      const baseFeePerGas = assets.ethereum.currency.Gwei(8)
      const tipGasPrice = assets.ethereum.currency.Gwei(5)
      const gasPrice = baseFeePerGas.add(tipGasPrice)
      mockGetFeeData.mockResolvedValueOnce({
        eip1559Enabled: true,
        tipGasPrice,
        baseFeePerGas,
        gasPrice, // is actually maxFeePerGas
      })

      // User selected gasPrice / maxFeePerGas
      const customFeeRate = assets.ethereum.currency.Gwei(10)
      const tipGasPriceRecalculated = customFeeRate.sub(baseFeePerGas)
      mockGetCustomFeeRate.mockResolvedValueOnce(customFeeRate)

      const feeData = await evmDeps.getCustomFeeData()
      expect(mockGetFeeData).toHaveBeenCalledWith({ assetName: 'ethereum' })
      expect(feeData).toEqual({
        gasPrice: '0x' + customFeeRate.toBaseNumber().toString(16),
        maxFeePerGas: '0x' + customFeeRate.toBaseNumber().toString(16),
        maxPriorityFeePerGas:
          '0x' + tipGasPriceRecalculated.toBaseNumber().toString(16),
      })
    })
  })

  describe('.getEstimatedGas()', () => {
    it('should proxy requests to the coin node', async () => {
      const mockProxyToCoinNode = jest.fn()
      mockServer.proxyToCoinNode = mockProxyToCoinNode
      const transaction = {
        data: 'txInput',
        from: 'fromAddress',
        to: 'toAddress',
        value: '000001',
      }
      await evmDeps.getEstimatedGas(transaction)

      expect(mockProxyToCoinNode).toHaveBeenCalledWith({
        method: 'eth_estimateGas',
        params: [transaction],
      })
    })
  })

  describe('.onEthWalletWatchAssetRequest()', () => {
    it('should return true', async () => {
      const assetAdded = await evmDeps.onEthWalletWatchAssetRequest({})
      expect(assetAdded).toBe(true)
      expect(mockTrack).toHaveBeenCalled()
    })
  })
})
