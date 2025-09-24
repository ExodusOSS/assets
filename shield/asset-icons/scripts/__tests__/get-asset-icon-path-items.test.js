const path = require('path')

const yarnLockPath = path.join(__dirname, '../../../../yarn.lock')

const getAssetIconPathItems = require('../get-asset-icon-path-items')
describe('getAssetIconPathItems', () => {
  it('get icon path items', async () => {
    const fromAssetsBase = await getAssetIconPathItems({ yarnLockPath })
    expect(fromAssetsBase).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(['bitcoin', '@exodus/bitcoin-meta/assets/svg', 'bitcoin.svg']),
      ])
    )
  })

  it('returns empty array when providing incorrect postfix ', async () => {
    expect(await getAssetIconPathItems({ folderPostfix: 'folderPostfix', yarnLockPath })).toEqual(
      []
    )
  })

  it('snapshot all icons', async () => {
    const fromYarnLock = await getAssetIconPathItems({
      yarnLockPath,
    })
    expect(fromYarnLock).toMatchSnapshot()
  })
})
