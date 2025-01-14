import { runVectorTests } from '@exodus/assets-testing'

import solana from '../index.js'

const validAddress = '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx'
const anotherChainAddress = 'bc1qgxz38crda20mlre427ygezgu67kqvqfr4heayn'
const invalid = 'invalid'
const vectors = {
  validate: [
    [validAddress, true],
    [anotherChainAddress, false],
    [invalid, false],
  ],
}

const api = `address`
const asset = solana.createAsset({ assetClientInterface: {} })

describe(`${asset.name} ${api} vector tests`, () => {
  runVectorTests({ asset, vectors, api })
})
