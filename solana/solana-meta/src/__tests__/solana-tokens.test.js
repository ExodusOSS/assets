import { keyBy } from '@exodus/basic-utils'

import assetsList from '../index.js'

const assets = keyBy(assetsList, 'name')

const tokens = Object.values(assets).filter(
  (asset) => asset.baseAssetName === 'solana' && asset.name !== 'solana'
)

test('tokens have a description', () => {
  // console.log(
  //   tokens
  //     .filter((token) => !token.info.description)
  //     .map((name) => `'${name}'`)
  //     .join(',')
  // )
  const tokensWithoutDescription = new Set([
    'audius_solana',
    'axieinfinity_solana',
    'chainlink_solana',
    'agfe_solana_c5cba5c4',
    'smoothlovepotion_solana',
    '7i5k_solana_c9e04412',
    'tetherusd_solana',
    'thegraph_solana',
    'usdcoin_solana',
  ])

  expect(
    tokens
      .filter((token) => !tokensWithoutDescription.has(token.name))
      .every((token) => token.info.description)
  ).toBe(true)
})
