import assetPlugin from '../index.js'

const asset = assetPlugin.createAsset({ assetClientInterface: {} })

describe('getBalanceForAddress', () => {
  it('should return correct balance', async () => {
    const balance = await asset.api.getBalanceForAddress(
      '0xaadf409fbefbb7071bab1084083a7ffa5c799622'
    )
    expect(balance.toBaseString({ unit: true })).toBe('1337000000000 wei')
  })
})
