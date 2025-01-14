import { validateAssetId } from '../create-token-factory.js'

describe('createTokenFactoryTest', () => {
  test('validateAssetId', () => {
    expect(
      validateAssetId('4cca5c806ac0c7a084233ed1fa4a83df5d127706fc159fabec615fc799e05155i0')
    ).toEqual(true)
    expect(
      validateAssetId('4CCa5c806ac0c7a084233ed1fa4a83df5d127706fc159fabec615fc799e05155I0')
    ).toEqual(false) // some uppercase

    expect(validateAssetId('invalid')).toEqual(false)
  })
})
