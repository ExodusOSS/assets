import assetsBase from '@exodus/assets-base'
import { keyBy } from '@exodus/basic-utils'
import combinedAssetsList from '@exodus/combined-assets-meta'

import { connectAssets } from '../index.js'

export default connectAssets({
  ...keyBy(combinedAssetsList, ({ name }) => name),
  ...assetsBase, // keep this last, we should not override real assets with pseudo-assets
})
