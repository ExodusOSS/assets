const getAssetIconPathItems = require('../get-asset-icon-path-items')

describe('getAssetIconPathItems', () => {
  it('get icon path items', async () => {
    expect(await getAssetIconPathItems()).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(['bitcoin', '@exodus/bitcoin-meta/assets/svg', 'bitcoin.svg']),
      ])
    )
  })

  it('returns empty array when providing incorrect postfix', async () => {
    expect(await getAssetIconPathItems({ folderPostfix: 'folderPostfix' })).toEqual([])
  })
})
