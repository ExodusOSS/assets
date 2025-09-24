import { keyBy } from '@exodus/basic-utils'

import assetsList from '../index.js'

const assets = keyBy(assetsList, 'name')

const tokens = Object.values(assets).filter(
  (asset) => asset.baseAssetName === 'ethereum' && asset.name !== 'ethereum'
)

const tokenNames = tokens.map((t) => t.name)

// Assets are sorted multiple times. We are removing the requirement to have them sorted in libraries.

test('assert we are not missing anyone', () => {
  // A bit of duplicated data, but validates that between commit we are not updating or removing the wrong token.
  expect(tokenNames.sort()).toEqual(
    [
      'aave',
      'ach_ethereum_fbad19a6',
      'ali_ethereum_9ae8d1eb',
      'amp',
      'ankr',
      'ape',
      'api3',
      'audius',
      'axieinfinity',
      'balancer',
      'band_ethereum_a9ddc2a2',
      'bat',
      'blur_ethereum_ef097961',
      'bone_ethereum_1cdd7eb5',
      'busd',
      'cbeth_ethereum_32621dca',
      'chainlink',
      'chiliz',
      'compound',
      'crv',
      'decentraland',
      'enjincoin',
      'forth_ethereum_52c00d9e',
      'gala_ethereum_3e0e1736',
      'imx',
      'jasmy_ethereum_2c1e076b',
      'leash_ethereum_562b149d',
      'looks_ethereum_222f7656',
      'lqty_ethereum_126a91b0',
      'maker',
      'mask_ethereum_c2890c79',
      'mcd',
      'mdt_ethereum_1bb644a2',
      'metis_ethereum_54dc1156',
      'mxc_ethereum_c4923be4',
      'nexo_ethereum_fe4d2476',
      'ogn_ethereum_fcc7cc39',
      'oneinch',
      'ousd_ethereum_48fcf72d',
      'paxgold',
      'pepe_ethereum_22ed551c',
      'perp_ethereum_c75f71b4',
      'polygon',
      'pol_ethereum_e5c9fadc',
      'pyusd_ethereum_871d3761',
      'radar_ethereum_e4d48030',
      'reth_ethereum_40b16905',
      'rlb_ethereum_a7e53179',
      'rpl_ethereum_2f6fb917',
      'rsr_ethereum_a5eb8f84',
      'sandbox',
      'sdao_ethereum_c59ee345',
      'shibainu',
      'smoothlovepotion',
      'snx',
      'sushiswap',
      'syn_ethereum_c7f5e6b8',
      'tel_ethereum_02bc2dbb',
      'tetherusd',
      'thegraph',
      'trb_ethereum_ad699fe9',
      'tru_ethereum_922b250a',
      'trueusd',
      'uniswap',
      'usdcoin',
      'wbtc',
      'weth',
      'wnxm_ethereum_52ead9a6',
      'woo_ethereum_0b749579',
      'yfi',
    ].sort()
  )
})

test('tokens have a description', () => {
  // console.log(
  //   tokens
  //     .filter((token) => !token.info.description)
  //     .map((name) => `'${name}'`)
  //     .join(',')
  // )
  const tokensWithoutDescription = new Set([
    'aave',
    'adtoken',
    'dragon',
    'eos',
    'kin',
    'medishares',
    'qash',
    'rivetz',
    'santiment',
    'sushiswap',
    'taas',
    'timenewbank',
    'tron',
    'veritaseum',
    'walton',
  ])
  expect(
    tokens
      .filter((token) => !tokensWithoutDescription.has(token.name))
      .every((token) => token.info.description)
  ).toBe(true)
})
