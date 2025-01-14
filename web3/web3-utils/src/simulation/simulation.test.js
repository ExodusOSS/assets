import { fetchival as mockFetchival } from '@exodus/fetch'

jest.mock('@exodus/fetch', () => ({
  fetchival: jest.fn(),
}))

import { makeSimulationAPICall } from './index.js'

describe('makeSimulationAPICall', () => {
  const simulationResult = {
    simulated: true,
  }
  const simulationAPICallParams = {
    url: 'preview-api.xyz',
    network: 'ethereum',
    payload: {
      txObject: {
        from: 'address',
        to: 'address2',
        value: '0x0',
        data: '0x',
      },
      metadata: {
        origin: 'some-dapp.xyz',
      },
      userAccount: 'address',
    },
    chain: 'main',
  }

  let mockFetchivalPost

  beforeEach(() => {
    mockFetchivalPost = jest.fn().mockResolvedValue(simulationResult)

    mockFetchival.mockImplementation(() => ({
      post: mockFetchivalPost,
    }))
  })

  it('should call the simulation API with the provided parameters', async () => {
    const result = await makeSimulationAPICall(simulationAPICallParams)

    expect(result).toEqual(simulationResult)
    expect(mockFetchival).toHaveBeenCalledWith(simulationAPICallParams.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    expect(mockFetchivalPost).toHaveBeenCalledWith({
      network: simulationAPICallParams.network,
      chain: simulationAPICallParams.chain,
      serviceProvider: 'blowfish',
      ...simulationAPICallParams.payload,
    })
  })

  it('should gracefully handle API call error', async () => {
    mockFetchivalPost.mockRejectedValue(new Error('some error'))

    expect(await makeSimulationAPICall(simulationAPICallParams)).toEqual(null)
  })
})
