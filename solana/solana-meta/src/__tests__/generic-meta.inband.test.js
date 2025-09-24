import { testAssetsAndTokens } from '@exodus/assets-meta-testing'

import { asset, tokens } from '../index.js'

describe(`Generic info for ${asset?.name}`, () => {
  testAssetsAndTokens({ asset, tokens, dirname: import.meta.dirname, isAssetIdCaseSensitive: true })
})
