const mockValidateRequest = jest.fn()

jest.doMock('../validator.js', () => ({
  __esModule: true,
  validateRequest: mockValidateRequest,
}))

const { validateRequestWithEVMPrefix } = await import('../validateRequestWithEVMPrefix.js')

describe('parseAndValidateRequestWithEVMPrefix', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Assumes all values are valid for simplicity.
    mockValidateRequest.mockImplementation((objToValidate) => objToValidate)
  })

  it('validates requests if no "method" provided', () => {
    const requestWithNoMethod = {}
    const result = validateRequestWithEVMPrefix(requestWithNoMethod)

    expect(result).toEqual(requestWithNoMethod)
    expect(mockValidateRequest).toHaveBeenCalledWith(requestWithNoMethod)
    expect(mockValidateRequest).toBeCalledTimes(1)
  })

  it('validates requests if a method name does not have a prefix', () => {
    const requestWithNotPrefixedMethod = { method: 'methodName' }
    const result = validateRequestWithEVMPrefix(requestWithNotPrefixedMethod)

    expect(result).toEqual(requestWithNotPrefixedMethod)
    expect(mockValidateRequest).toHaveBeenCalledWith(
      requestWithNotPrefixedMethod,
    )
    expect(mockValidateRequest).toBeCalledTimes(1)
  })

  it('validates requests if a method name prefix is unexpected', () => {
    const unexpectedPrefix = 'sol'
    const methodName = 'accounts'
    const requestMethodWithUnknownPrefix = {
      method: `${unexpectedPrefix}_${methodName}`,
    }
    const result = validateRequestWithEVMPrefix(requestMethodWithUnknownPrefix)

    expect(result).toEqual(requestMethodWithUnknownPrefix)
    expect(mockValidateRequest).toHaveBeenCalledWith({ method: methodName })
    expect(mockValidateRequest).toBeCalledTimes(1)
  })

  it('removes a chain ID prefix from a method name before validation', () => {
    const requestMethodWithKnownPrefix = { method: '0x1_eth_chainId' }
    const result = validateRequestWithEVMPrefix(requestMethodWithKnownPrefix)

    expect(result).toEqual(requestMethodWithKnownPrefix)
    expect(mockValidateRequest).toHaveBeenCalledWith({ method: 'eth_chainId' })
    expect(mockValidateRequest).toBeCalledTimes(1)
  })

  it('returns a possibly mutated by "validateRequest" function object', () => {
    mockValidateRequest
      .mockReset()
      .mockImplementation(({ method }) => ({ method }))
    const requestMethodWithKnownPrefix = {
      method: 'eth_eth_chainId',
      propertyToBeRemoved: 'test',
    }
    const result = validateRequestWithEVMPrefix(requestMethodWithKnownPrefix)

    expect(result).toEqual({ method: requestMethodWithKnownPrefix.method })
    expect(mockValidateRequest).toBeCalledTimes(1)
  })

  it('throws if a value is not validated', () => {
    const errorMessage = 'JSON validation failed.'
    mockValidateRequest.mockReset().mockImplementationOnce(() => {
      throw new Error(errorMessage)
    })

    try {
      validateRequestWithEVMPrefix({})
      throw new Error('Call should have thrown')
    } catch (err) {
      expect(err.message).toEqual(errorMessage)
    }
  })
})
