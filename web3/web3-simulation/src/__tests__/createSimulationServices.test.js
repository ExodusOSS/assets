import { createSimulationServices } from '../createSimulationServices'

describe('createSimulationServices', () => {
  const apiBaseURL = 'https://example.com'
  const assetClientInterface = { getFeeConfig: () => undefined }

  it('should throw an error if apiBaseURL is not provided', () => {
    expect(() => createSimulationServices({ assetClientInterface })).toThrow(
      'apiBaseURL is required',
    )
  })

  it('should throw an error if assetClientInterface is not provided', () => {
    expect(() => createSimulationServices({ apiBaseURL })).toThrow(
      'assetClientInterface is required',
    )
  })

  it('should return an object with scanDomains, simulateEthereumTransactions and simulateSolanaTransactions functions', () => {
    const simulationServices = createSimulationServices({
      apiBaseURL,
      assetClientInterface,
    })

    expect(simulationServices).toHaveProperty('scanDomains')
    expect(simulationServices).toHaveProperty('simulateEthereumTransactions')
    expect(simulationServices).toHaveProperty('simulateSolanaTransactions')

    expect(typeof simulationServices.scanDomains).toBe('function')
    expect(typeof simulationServices.simulateEthereumTransactions).toBe(
      'function',
    )
    expect(typeof simulationServices.simulateSolanaTransactions).toBe(
      'function',
    )
  })
})
