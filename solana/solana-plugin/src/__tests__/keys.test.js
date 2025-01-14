import { runVectorTests } from '@exodus/assets-testing'

import solana from '../index.js'

const vectors = {
  encodePrivate: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89f',
      true,
      '3QPJsBmnWdxdYRGHSAKf31USAmNDpP8rAEu2ewsJuEutkntM6mkoqzkaUrtSKtJKGrnVbUns6MmxBUtVrmyywo6',
    ],
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89f',
      false,
      '3QPJsBmnWdxdYRGHSAKf31USAmNDpP8rAEu2ewsJuEutkntM6mkoqzkaUrtSKtJKGrnVbUns6MmxBUtVrmyywo6',
    ],
  ],

  encodePublic: [
    [
      '_0x021289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      'chzsv7a44bdGH94X43KBEMMnP8Zmzpg2yQTBcGPdqThi',
    ],
    [
      '_0x000289b7ad4577f8c9d01c16e16c8bd08b3e702d678dea65c1b312f4ef87b89fa1',
      { purpose: 44 },
      '1AucacTWB8EJbua6TchSX5q5jzEoDCuLfRcKqJaBGgde',
    ],
  ],
}

const api = `keys`
const asset = solana.createAsset({ assetClientInterface: {} })

describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
