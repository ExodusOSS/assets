import {
  findAddressesFixtures,
  findURLsFixtures,
  siweFixtures,
} from './parsingSIWE.fixtures.js'
import {
  findAddresses,
  findURLs,
  tryParsingSIWE,
} from '../simulation/tryParsingSIWE.js'

describe('tryParsingSIWE', () => {
  const asset = {
    baseAssetName: 'ethereum',
  }
  let simulationResult = {}

  const cleanUpSimulationResult = () => {
    simulationResult = {
      baseAssetName: asset.baseAssetName,
      action: 'NONE',
    }
  }

  // Just a random address.
  const ZERO_ETHEREUM_ADDRESS = '0x0000000000000000000000000000000000000000'

  beforeEach(() => {
    cleanUpSimulationResult()
  })

  test.each(siweFixtures.valid)(
    '$testName',
    async ({ address, message, url }) => {
      tryParsingSIWE({
        address,
        message,
        simulationResult,
        url: url ?? new URL('https://test.com'),
      })

      expect(simulationResult.kind.kind).toEqual('SIWE')

      // If an url is present, we should ensure that providing a different url
      // 'invalidates' SIWE parsing for security purposes.
      if (url) {
        cleanUpSimulationResult()

        tryParsingSIWE({
          address,
          message,
          simulationResult,
          url: new URL('https://some-website.com'),
        })

        expect(simulationResult.kind).toBeUndefined()
      }

      // If an address is present, we should ensure that providing a different address
      // 'invalidates' SIWE parsing for security purposes.
      if (address) {
        cleanUpSimulationResult()

        tryParsingSIWE({
          address: ZERO_ETHEREUM_ADDRESS,
          message,
          simulationResult,
          url,
        })

        expect(simulationResult.kind).toBeUndefined()
      }
    },
  )

  test.each(siweFixtures.invalid)(
    '$testName',
    async ({ address, message, url }) => {
      tryParsingSIWE({
        address,
        message,
        simulationResult,
        url: url ?? new URL('https://test.com'),
      })

      expect(simulationResult.kind).toBeUndefined()
    },
  )
})

describe('findAddresses', () => {
  test.each(findAddressesFixtures)(
    '$testName',
    async ({ addresses, message }) => {
      const foundAddresses = findAddresses(message)

      expect(foundAddresses).toEqual(addresses)
    },
  )
})

describe('findURLs', () => {
  test.each(findURLsFixtures)('$testName', async ({ urls, message }) => {
    const foundURLs = findURLs(message)

    expect(foundURLs.length).toEqual(urls.length)

    foundURLs.forEach((foundURL, index) =>
      expect(foundURL.hostname).toEqual(urls[index].hostname),
    )
  })
})
