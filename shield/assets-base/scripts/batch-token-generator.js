#! /usr/bin/env node

/**
 * This script helps genereting the code that would be copied and pasted into assets-base, exodus-desktop and exodus-mobile.
 *
 * The manual guide is https://eng-handbook.ot.exodus.com/docs/engineering/processes/new-spl-integration#how-to-add-an-spl-token,
 * If you provide the right params here, part of the process can be automatized.
 *
 * Icons and colors can be found https://drive.google.com/drive/u/1/folders/1zsjwTBq_Lstbt-VuxQQ1f8Jj0O8wQ4DS
 *
 */
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import { keccak256 } from '@exodus/crypto/keccak'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import fetchival from 'fetchival'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import yaml from 'js-yaml'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import _ from 'lodash'
import fs from 'node:fs'
import path from 'node:path'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import { hideBin } from 'yargs/helpers'
// eslint-disable-next-line @exodus/import/no-extraneous-dependencies
import yargs from 'yargs/yargs'

fetchival.fetch = fetch

// based on to-checksum-address
const checksumAddress = (address, chainId = null) => {
  if (!/^(0x)?[\da-f]{40}$/i.test(address)) throw new Error('Not given a valid Ethereum Address')
  const stripAddress = address.toLowerCase().replace(/^0x/, '')
  const prefix = chainId === null ? '' : `${chainId.toString()}0x`
  const hash = keccak256(prefix + stripAddress, 'hex')
  const map = [...stripAddress].map((c, i) => (parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c))
  return ['0x', ...map].join('')
}

const { input } = yargs(hideBin(process.argv)).argv
const assetList = yaml.load(
  fs.readFileSync(input || path.resolve(import.meta.dirname, 'asset-list.yml'), 'utf8')
)

const registryUrl = 'https://ctr.a.exodus.io/registry'
// const registryUrl = 'http://localhost:8080/registry' // Note, current master generate different hashes, using production server

const cmcUrl = 'https://pro-api.coinmarketcap.com'

function getAssetData(asset) {
  return assetList.find((a) => a.address === asset.tokenInfo.mintAddress)
}

const ETH_LIKE = new Set(['avalanchec', 'fantommainnet', 'matic', 'ethereum', 'bsc'])

// checksum addresses
assetList.forEach((a) => {
  if (ETH_LIKE.has(a.network)) {
    // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
    a.address = checksumAddress(a.address)
  }
})
const execute = async () => {
  async function getTokenInformation(asset) {
    try {
      const network = asset.network
      const assetId = asset.address
      if (
        network === 'solana' ||
        network === 'bsc' ||
        network === 'ethereum' ||
        network === 'avalanchec' ||
        network === 'fantommainnet' ||
        network === 'algorand' ||
        network === 'matic'
      ) {
        const url = `${registryUrl}/networks/${network}`
        const { token } = await fetchival(url, { timeout: 15_000 }).post({ assetId })
        return token
      }

      if (!process.env.CMC_PRO_API_KEY) {
        throw new Error('Provided CoinMarketCapital API KEY using env CMC_PRO_API_KEY')
      }

      if (asset.decimals === undefined) {
        throw new Error(
          `Decimals cannot be automatically resolved. Provide decimals: in asset ${assetId}`
        )
      }

      // CTR is not available for the asset network yet, we can call CMC to get some data.
      const url = `${cmcUrl}/v2/cryptocurrency/info`
      const { data } = await fetchival(url, {
        timeout: 15_000,
        headers: { 'X-CMC_PRO_API_KEY': process.env.CMC_PRO_API_KEY },
      }).get({
        address: assetId,
      })
      const info = Object.values(data)[0]
      return {
        name: assetId,
        properName: info.name,
        assetName: info.name.toLowerCase().replaceAll(' ', '_'),
        ticker: info.symbol.toUpperCase().replaceAll(' ', ''),
        properTicker: info.symbol,
        info: {
          description: info.description,
          website: info.urls.website[0],
          twitter: info.urls.twitter[0],
          reddit: info.urls.reddit[0],
          telegram: info.urls.chat.find((u) => u.startsWith('https://t.me')),
        },
        parameters: { decimals: asset.decimals },
      }
    } catch (e) {
      throw e.response ? new Error(await e.response.text()) : e
    }
  }

  async function getAssetInfo({ asset }) {
    const network = asset.network
    const assetId = asset.address

    const token = await getTokenInformation(asset)
    //
    const assetInfo = {
      [token.assetName]: {
        description: asset.description || token.info?.description || '',
        reddit: asset.reddit || token.info?.reddit || '',
        twitter: asset.twitter || token.info?.twitter || '',
        website: asset.website || token.info?.website || '',
        telegram: asset.telegram || token.info?.telegram || '',
      }, // You may want to wait and retry later so cmc gets refreshed
    }

    const tokenInfo = {
      name: token.assetName,
      properName: asset.name || token.properName,
      decimals: token.parameters.decimals,
      ticker: token.ticker,
      properTicker: token.properTicker,
      mintAddress: assetId,
    }
    return { token, tokenInfo, assetInfo, network }
  }

  function generateDefinitions(_assets) {
    return JSON.stringify(
      _assets.map((asset) => {
        let token = {}

        if (ETH_LIKE.has(asset.network)) {
          token = {
            ...asset.tokenInfo,
            addresses: { current: asset.tokenInfo.mintAddress },
          }
          if (token.ticker === token.properTicker) {
            delete token.properTicker
          }

          delete token.mintAddress
        }

        if (asset.network === 'bsc') {
          token.tokenType = 'BEP20'
        }

        if (asset.network === 'algorand') {
          token = {
            ...asset.tokenInfo,
            assetIndex: asset.tokenInfo.mintAddress,
          }
          if (token.ticker === token.properTicker) {
            delete token.properTicker
          }

          delete token.mintAddress
        }

        return token
      }),
      null,
      2
    )
  }

  const assets = await Promise.all(
    assetList.map((asset) => {
      return getAssetInfo({ asset })
    })
  )

  Object.entries(
    _.groupBy(
      assets.filter((a) => a.network !== 'ethereum'),
      (a) => a.network
    )
  ).forEach(([network, assets]) => {
    console.log('-----')
    console.log(`paste this into _${network}-tokens.js`)
    console.log(generateDefinitions(assets))
  })

  Object.entries(
    _.groupBy(
      assets.filter((a) => a.network === 'ethereum'),
      (a) => a.network
    )
  ).forEach(([_, assets]) => {
    console.log('-----')
    console.log(`paste this into erc20-tokens/tokens.js`)
    console.log(generateDefinitions(assets))
  })

  console.log('-----')
  console.log(`paste this into available-assets.js`)
  console.log(
    JSON.stringify(
      assets.map((asset) => asset.tokenInfo.name),
      null,
      2
    )
  )

  Object.entries(_.groupBy(assets, (a) => a.network)).forEach(([_, assets]) => {
    console.log('-----')
    console.log(`paste this into src/app/constants/assetColors.js`)
    console.log(
      assets
        .map(
          (asset) =>
            ` ${asset.tokenInfo.name}: '${assetList
              .find((a) => a.address === asset.tokenInfo.mintAddress)
              .solidColor.toUpperCase()}',`
        )
        .join('\n')
    )
  })

  console.log('-----')
  console.log(`paste this into slack development-pricing-server`)
  console.log('')
  console.log(
    'Hi team, new Eden/Prod batch tokens are coming, Could you update pricing server for:'
  )
  Object.entries(_.groupBy(assets, (a) => a.network)).forEach(([network, assets]) => {
    console.log('')
    console.log(
      assets
        .map(
          (asset) =>
            `- ${asset.tokenInfo.properName}: ${asset.tokenInfo.ticker} (${asset.tokenInfo.properTicker}) - ${asset.tokenInfo.name}`
        )
        .join('\n')
    )
    console.log('')
    console.log(`Network ${network}`)
  })

  console.log()
  console.log('CC: @Will Beaumont')
  console.log('')
  console.log('-----')
  console.log('paste this into _icons_assets.scss')
  console.log(
    assets
      .map(
        (asset) => `.icon-${asset.tokenInfo.name},
.logo-${asset.tokenInfo.name} {
  background-image: url(../svg/logos/${asset.tokenInfo.name}.svg);
}`
      )
      .join('\n')
  )

  console.log('-----')
  console.log('paste this into _icons_assets_transparent.scss')
  console.log(
    assets
      .map(
        (asset) => `.icon-${asset.tokenInfo.name}-transparent,
.logo-${asset.tokenInfo.name}-transparent {
  background-image: url(../svg/logos-transparent/${asset.tokenInfo.name}-sign.svg);
}`
      )
      .join('\n')
  )

  console.log('-----')
  console.log(`Copy this in mobile assetsIcons.js`)
  console.log(
    assets
      .map(
        (asset) =>
          ` export ${asset.tokenInfo.ticker} from '~/svg/assets/${asset.tokenInfo.properTicker}'`
      )
      .join('\n')
  )

  console.log('-----')
  console.log(`paste this into assetColors.js in mobile`)
  console.log(
    assets
      .map(
        (asset) => ` ${asset.tokenInfo.ticker}: '${getAssetData(asset).solidColor.toUpperCase()}',`
      )
      .join('\n')
  )

  console.log('-----')
  console.log(`paste this into assetGradientsCoords.js in mobile
  get coordinates from the svg <LinearGradient tag
  `)
  console.log(
    assets
      .map((asset) => ` ${asset.tokenInfo.ticker}: { x1: '%', y1: '%', x2: '%', y2: '%' },`)
      .join('\n')
  )

  console.log('-----')
  console.log(`paste this into assetGradients.js in mobile`)
  console.log(
    assets
      .map(
        (asset) =>
          `...createGradient('${asset.tokenInfo.properTicker}', '${getAssetData(
            asset
          ).gradientColorFrom.toUpperCase()}', '${getAssetData(
            asset
          ).gradientColorTo.toUpperCase()}'),`
      )
      .join('\n')
  )
}

execute()
