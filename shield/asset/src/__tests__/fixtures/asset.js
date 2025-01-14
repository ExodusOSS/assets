const sampleum = {
  name: 'smapleum',
  displayName: 'Sampleum',
  ticker: 'SAM',
  primaryColor: '#8C93AF',
  gradientColors: ['#474A73', '#8C93AF'],
  gradientCoords: { x1: '17.71%', y1: '-46.968%', x2: '98.837%', y2: '152.777%' },
  chainBadgeColors: ['#FFFFFF', '#D6DAFF'],

  gasLimit: 21e3, // enough to send ETH to a normal address
  contractGasLimit: 1e6, // used when estimateGas fails

  units: {
    wei: 0,
    Kwei: 3,
    Mwei: 6,
    Gwei: 9,
    szabo: 12,
    finney: 15,
    ETH: 18,
  },

  assetType: 'ETHEREUM_LIKE',
  tokenAssetType: 'ETHEREUM_ERC20',
  blockExplorer: {
    addressUrl: (address) => `https://etherscan.io/address/${address}`,
    txUrl: (txId) => `https://etherscan.io/tx/${txId}`,
  },
  info: {
    description:
      'Ethereum is a decentralized computing platform that runs smart contracts, which are contracts that execute without human intervention. ETH popularized the idea of using the blockchain for programmable transactions instead of only for money transfers. The platform is used for crowdfunding (ICOs), the creation of new digital assets, and more.',
    reddit: 'https://www.reddit.com/r/ethereum/',
    twitter: 'https://twitter.com/ethereum',
    website: 'https://ethereum.org/',
  },
}

export default sampleum
