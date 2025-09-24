import { createTokenDef } from '@exodus/asset'
import { connectAssets } from '@exodus/assets'
import { keyBy } from '@exodus/basic-utils'
import assetsList, { asset } from '@exodus/solana-meta'

const testTokens = [
  {
    name: 'mean_solana_c5cba5c4',
    displayName: 'Meanfi',
    decimals: 6,
    ticker: 'MEANsolanaC5CBA5C4',
    displayTicker: 'MEAN',
    mintAddress: 'MEANeD3XDdUmNMsRGjASkSWdC8prLYsoRJ61pPeHctD',
    info: {
      description:
        'MeanFi is a self-custody, trustless bank that connects traditional finance and DeFi. It can save users time and money with services such as money streaming, dollar cost averaging, and searches that find the best prices for Solana-based exchanges.',
      twitter: 'https://twitter.com/meanfinance',
      website: 'https://meanfi.com/',
    },
    primaryColor: '#FF4F4F',
    gradientColors: ['#B7011C', '#FF4F4F'],
  },
  {
    name: '8hgy_solana_43b58185',
    displayName: 'COPE',
    decimals: 6,
    ticker: '8HGYsolana43B58185',
    displayTicker: 'COPE',
    mintAddress: '8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh',
    info: {
      description:
        'Cope ranks and indexes online call makers (such as trader influencers on social media), and filters out the ones who make low quality calls. This creates a powerful leaderboard that can be used to follow the top call makers.',
      twitter: 'https://twitter.com/unlimitedcope',
      website: 'https://www.unlimitedcope.com',
    },
    primaryColor: '#77B0DD',
    gradientColors: ['#44b6BB', '#77B0DD'],
  },
]

const tokens = testTokens.map((token) =>
  createTokenDef({
    asset,
    token,
    tokenOverrides: (tokenDef) => ({ ...tokenDef, assetId: token.mintAddress }),
  })
)

const assets = connectAssets(keyBy([...assetsList, ...tokens], (asset) => asset.name))

export default assets
