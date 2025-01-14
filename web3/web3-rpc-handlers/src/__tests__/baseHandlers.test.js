import { approve, connect } from '../baseHandlers.js'

const mockApprovalFn = jest.fn()
const mockIsAutoApproved = jest.fn()
const mockIsTrusted = jest.fn()
const mockApproveConnection = jest.fn()
const mockEnsureTrusted = jest.fn()
const mockEnsureUnlocked = jest.fn()
const mockGetOrigin = jest.fn()
const mockScanDomains = jest.fn()

const network = 'network'

describe('approve', () => {

  beforeEach(()=>{
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  it('does not call the approval function if auto approved', async () => {
    mockIsAutoApproved.mockReset().mockResolvedValueOnce(true)

    await approve(mockApprovalFn, mockIsAutoApproved)

    expect(mockIsAutoApproved).toBeCalled()
    expect(mockApprovalFn).not.toBeCalled()
  })

  it('calls the approval function if not auto approved', async () => {
    mockIsAutoApproved.mockReset().mockResolvedValueOnce(false)
    mockApprovalFn.mockReset().mockResolvedValueOnce(true)

    const dataToApprove = { test: true }
    await approve(mockApprovalFn, mockIsAutoApproved, dataToApprove)

    expect(mockIsAutoApproved).toBeCalled()
    expect(mockApprovalFn).toHaveBeenCalledWith(dataToApprove)
  })

  it('throws if user does not approve', async () => {
    mockApprovalFn.mockReset().mockResolvedValueOnce(false)
    mockIsAutoApproved.mockReset().mockResolvedValue(false)

    try {
      await approve(mockApprovalFn, mockIsAutoApproved)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.name).toEqual('UserDeclinedError')
      expect(err.code).toBe(3)
    }

    expect(mockIsAutoApproved).toBeCalled()
    expect(mockApprovalFn).toHaveBeenCalled()
  })
})

describe('connect', () => {

  beforeEach(()=>{
    jest.clearAllMocks()
    jest.restoreAllMocks()
  })

  const deps = {
    approveConnection: mockApproveConnection,
    ensureTrusted: mockEnsureTrusted,
    ensureUnlocked: mockEnsureUnlocked,
    isTrusted: mockIsTrusted,
    getOrigin: mockGetOrigin,
    scanDomains: mockScanDomains,
  }

  beforeEach(() => {
    mockApproveConnection.mockResolvedValue(true)
    mockEnsureTrusted.mockResolvedValue(true)
    mockEnsureUnlocked.mockResolvedValue(true)
    mockIsTrusted.mockResolvedValue(true)
    mockGetOrigin.mockResolvedValue('origin')
    mockScanDomains.mockResolvedValue(null)
  })

  it('does not establish a connection if wallet is locked', async () => {
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(false)

    try {
      await connect(deps, network)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.code).toBe(4001)
    }

    expect(mockEnsureUnlocked).toHaveBeenCalled()
  })

  it("does not request to unlock wallet for untrusted app if 'onlyIfTrusted' is passed", async () => {
    mockIsTrusted.mockReset().mockResolvedValueOnce(false)

    try {
      await connect(deps, network, true)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.code).toBe(4001)
    }

    expect(mockEnsureUnlocked).not.toHaveBeenCalled()
  })

  it("does request to unlock wallet for trusted app if 'onlyIfTrusted' is passed", async () => {
    mockIsTrusted.mockReset().mockResolvedValueOnce(true)
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(true)

    await connect(deps, network, true)

    expect(mockEnsureUnlocked).toHaveBeenCalled()
  })

  it("does not request approval if not trusted and 'onlyIfTrusted' is passed", async () => {
    mockIsTrusted.mockReset().mockResolvedValueOnce(false)

    try {
      await connect(deps, network, true)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.code).toBe(4001)
    }

    expect(mockApproveConnection).not.toHaveBeenCalled()
  })

  it('requests approval if not trusted', async () => {
    mockIsTrusted.mockReset().mockResolvedValueOnce(false)
    mockApproveConnection.mockReset().mockResolvedValueOnce(true)
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(true)

    await connect(deps, network)

    expect(mockEnsureUnlocked).toHaveBeenCalled()
    expect(mockApproveConnection).toHaveBeenCalledWith(network, undefined)
  })

  it('trusts the app upon approval', async () => {
    mockIsTrusted.mockReset().mockResolvedValueOnce(false)
    mockApproveConnection.mockReset().mockResolvedValueOnce(true)

    await connect(deps, network)

    expect(mockEnsureTrusted).toHaveBeenCalled()
  })

  it('requests approval if trusted but returns a suspicious `scanDomains` result', async () => {
    const scanResult = [{ warnings: [{ severity: 'WARNING' }] }]

    mockIsTrusted.mockReset().mockResolvedValueOnce(true)
    mockApproveConnection.mockReset().mockResolvedValueOnce(true)
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(true)
    mockScanDomains.mockResolvedValueOnce(scanResult)

    await connect(deps, network)

    expect(mockEnsureUnlocked).toHaveBeenCalled()
    expect(mockApproveConnection).toHaveBeenCalledWith(network, {
      severity: 'WARNING',
    })
  })

  it('throws an error if trusted but returns a suspicious `scanDomains` result and `onlyIfTrusted: true`', async () => {
    const scanResult = [{ warnings: [{ severity: 'WARNING' }] }]

    mockIsTrusted.mockReset().mockResolvedValueOnce(true)
    mockApproveConnection.mockReset().mockResolvedValueOnce(true)
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(true)
    mockScanDomains.mockResolvedValueOnce(scanResult)

    try {
      await connect(deps, network, true)
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.code).toEqual(4001)
    }

    expect(mockEnsureUnlocked).not.toHaveBeenCalled()
    expect(mockApproveConnection).not.toHaveBeenCalledWith(network, scanResult)
  })

  it('properly gets a message from a warning with the highest severity', async () => {
    const message = 'Critical Severity Message'
    const scanResults = [{ warnings: [{ severity: 'WARNING' }, { severity: 'CRITICAL', message }] }]

    mockIsTrusted.mockReset().mockResolvedValueOnce(true)
    mockApproveConnection.mockReset().mockResolvedValueOnce(true)
    mockEnsureUnlocked.mockReset().mockResolvedValueOnce(true)
    mockScanDomains.mockResolvedValueOnce(scanResults)

    await connect(deps, network)

    expect(mockEnsureUnlocked).toHaveBeenCalled()
    expect(mockApproveConnection).toHaveBeenCalledWith(network, {
      severity: 'CRITICAL',
      message
    })
  })
})
