// DO NOT set the `name` and `ticker` properties manually
// Instead use one of the get token metadata scripts https://github.com/ExodusMovement/exodus-core/tree/master/packages/assets-base#get-token-metadata

export default [
  {
    name: 'fusdt_fantommainnet_b94eea88',
    displayName: 'Frapped USDT',
    decimals: 6,
    ticker: 'FUSDTfantommainnetB94EEA88',
    displayTicker: 'fUSDT',
    addresses: { current: '0x049d68029688eAbF473097a2fC38ef61633A3C7A' },
    info: {
      description:
        'Frapped USDT is the multi-chain bridge of Tether stablecoin. Each USDT token is designed to be backed by a U.S. Dollar held in banking reserves.',
      twitter: 'https://twitter.com/tether_to',
      website: 'https://anyswap.exchange/',
      telegram: 'https://t.me/OfficialTether',
    },
    primaryColor: '#53AE94',
    gradientColors: ['#53AE94', '#2E9175'],
  },
]
