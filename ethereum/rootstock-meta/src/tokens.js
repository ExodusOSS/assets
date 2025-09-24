// DO NOT set the `name` and `ticker` properties manually
// Instead use one of the get token metadata scripts https://github.com/ExodusMovement/exodus-core/tree/master/packages/assets-base#get-token-metadata

export default [
  {
    name: 'rif_rootstock_c62f668d',
    displayName: 'RSK Infrastructure Framework',
    decimals: 18,
    ticker: 'RIFrootstockC62F668D',
    displayTicker: 'RIF',
    addresses: {
      current: '0x2aCc95758f8b5F583470bA265Eb685a8f45fC9D5',
    },
    primaryColor: '#EAEAEA',
    gradientColors: ['#EAEAEA', '#FFFFFF'],
  },
  {
    name: 'dllr_rootstock_6cfc3a7b',
    displayName: 'Sovryn Dollar',
    decimals: 18,
    ticker: 'DLLRrootstock6CFC3A7B',
    displayTicker: 'DLLR',
    addresses: {
      current: '0xc1411567d2670e24d9C4DaAa7CdA95686e1250AA',
    },
    info: {
      description:
        'Sovryn Dollar is a decentralized stablecoin pegged to the US dollar. Its value is backed by bitcoin-backed stablecoins ZUSD and MOC.',
      telegram: 'https://t.me/SovrynBitcoin',
      twitter: 'https://twitter.com/SovrynDollar',
      website: 'https://sovryn.com/',
    },
    primaryColor: '#FF5800',
    gradientColors: ['#FF5800', '#FF9056'],
  },
]
