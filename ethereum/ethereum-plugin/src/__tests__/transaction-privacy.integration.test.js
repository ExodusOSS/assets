import ethereumPlugin from '../index.js'

const createConnectedAsset = ({ privacyRpcUrl } = Object.create(null)) => {
  const baseAsset = ethereumPlugin.createAsset({
    assetClientInterface: {},
    config: { privacyRpcUrl },
  })
  return Object.assign(baseAsset, { baseAsset })
}

describe('transaction privacy', () => {
  it('evm-based asset should export a broadcastPrivateTx function if a privacyRpcUrl is defined in asset config', async () => {
    const [ethereumWithoutPrivacy, ethereumWithPrivacy] = [
      createConnectedAsset(),
      createConnectedAsset({ privacyRpcUrl: 'https://exodus.rpc.servo.auction' }),
    ]

    expect(ethereumWithoutPrivacy.broadcastPrivateTx).toBe(undefined)
    expect(ethereumWithoutPrivacy.privacyServer).toBe(undefined)
    expect(ethereumWithoutPrivacy.broadcastPrivateBundle).toBe(undefined)

    expect(typeof ethereumWithPrivacy.broadcastPrivateTx).toBe('function')
    expect(typeof ethereumWithPrivacy.privacyServer).toBeTruthy()
    expect(typeof ethereumWithPrivacy.broadcastPrivateBundle).toBe('function')

    await Promise.all([
      expect(() => ethereumWithPrivacy.broadcastPrivateBundle({ txs: null })).rejects.toThrow(
        'txs must be an array'
      ),
      ethereumWithPrivacy.broadcastPrivateBundle({ txs: [] }),
    ])
  })
})
