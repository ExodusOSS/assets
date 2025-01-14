const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const fetch = require('fetchival')

const { network, _: tokens } = yargs(hideBin(process.argv)).parserConfiguration({
  'parse-positional-numbers': false,
}).argv

const SERVER = 'https://ctr.a.exodus.io/registry'

const addToken = async (assetId) => {
  const response = await fetch(SERVER)(`networks/${network}`).post({ assetId })
  const {
    assetName,
    info,
    properName,
    properTicker,
    ticker,
    parameters: { decimals },
  } = response.token

  const defaults = {
    name: assetName,
    properName,
    decimals,
    ticker,
    properTicker,
    info,
  }

  if (network === 'solana') console.log({ ...defaults, mintAddress: assetId })
  if (network === 'ethereum') console.log({ ...defaults, address: { current: assetId } })
}

const addTokens = async () => Promise.all(tokens.map(addToken))

addTokens()
