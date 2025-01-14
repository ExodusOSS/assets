import assetPlugin from '../index.js'
import { dummyAssetClientInterface as assetClientInterface } from './utils/assetClientInterface.js'

const baseAsset = assetPlugin.createAsset({ assetClientInterface })

describe(`${baseAsset.name} index.js integration test`, () => {
  it('Test asset.api.addressHasHistory', async () => {
    const fundedAddress = 'bc1p2kusywwyktpqh346zw305g0mtt285zmjh58dctezrs33pl0c4w5q8zfutg'
    const newAddress = '1PdCrxwW7Z6FpNm7JoekkxhU9uzg6nAWuN'
    const addressHasHistory = baseAsset.api.addressHasHistory
    expect(addressHasHistory).toBeDefined()
    const res1 = await addressHasHistory(fundedAddress)
    expect(res1).toBeTruthy()

    const res2 = await addressHasHistory(newAddress)
    expect(res2).toBeFalsy()
  })

  it('Test asset.api.getBalanceForAddress', async () => {
    const fundedAddress = 'bc1p2kusywwyktpqh346zw305g0mtt285zmjh58dctezrs33pl0c4w5q8zfutg'
    const newAddress = '1PdCrxwW7Z6FpNm7JoekkxhU9uzg6nAWuN'
    const getBalanceForAddress = baseAsset.api.getBalanceForAddress
    expect(getBalanceForAddress).toBeDefined()
    const balance1 = await getBalanceForAddress(fundedAddress)
    expect(balance1.toDefaultString({ unit: true })).toEqual('0.00032802 BTC')

    const balance2 = await getBalanceForAddress(newAddress)
    expect(balance2.toDefaultString({ unit: true })).toEqual('0 BTC')
  })
})
