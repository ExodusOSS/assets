import BN from 'bn.js'

import type { Asset } from '@exodus/web3-types'
import type { CreateCurrencyParams } from '@exodus/web3-utils'

export const getCreateCurrencyParams = (
  asset: Asset,
  amount: CreateCurrencyParams['amount'],
) => ({
  amount,
  base: 'wei',
  symbol: asset.displayTicker,
  denominator: asset.units[asset.ticker],
})

interface BlowfishEvmChain {
  [key: string]: { network: string; chain: string }
}

export const BLOWFISH_EVM_CHAINS: BlowfishEvmChain = {
  avalanchec: {
    network: 'avalanche',
    chain: 'mainnet',
  },
  basemainnet: {
    network: 'base',
    chain: 'mainnet',
  },
  bsc: {
    network: 'bnb',
    chain: 'mainnet',
  },
  ethereum: {
    network: 'ethereum',
    chain: 'mainnet',
  },
  ethereumarbone: {
    network: 'arbitrum',
    chain: 'one',
  },
  matic: {
    network: 'polygon',
    chain: 'mainnet',
  },
  optimism: {
    network: 'optimism',
    chain: 'mainnet',
  },
}

// The maximum signed integer 2\^255 - 1 represented in BN.
export const MAX_INT256_SOLIDITY = new BN(2).pow(new BN(255)).subn(1)
