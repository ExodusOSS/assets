import chains from './chains-list.js'

const assets = Object.fromEntries(
  chains.flatMap((chain) => chain.map((asset) => [asset.name, asset]))
)

export default assets
