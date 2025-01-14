// DO NOT set the `name` and `ticker` properties manually
// Instead use one of the get token metadata scripts https://github.com/ExodusMovement/exodus-core/tree/master/packages/assets-base#get-token-metadata

export default [
  {
    name: 'usdc_basemainnet_b5a52617',
    displayName: 'USDC',
    decimals: 6,
    ticker: 'USDCbasemainnetB5A52617',
    displayTicker: 'USDC',
    addresses: {
      current: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    info: {
      description:
        'USDC is a token designed as a stablecoin issued by Circle and Coinbase. Each unit of USDC is backed by a unit of US Dollar in audited bank accounts in order to ensure 1 USDC is always equal to 1 USD.',
      reddit: 'https://www.reddit.com/r/USDC/',
      twitter: 'https://twitter.com/centre_io',
      website: 'https://www.centre.io/usdc',
    },
    primaryColor: '#3E90E8',
    gradientColors: ['#3E90E8', '#2775CA'],
    gradientCoords: { x1: '102%', y1: '101%', x2: '0%', y2: '0%' },
  },
]
