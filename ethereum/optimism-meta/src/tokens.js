// DO NOT set the `name` and `ticker` properties manually
// Instead use one of the get token metadata scripts https://github.com/ExodusMovement/exodus-core/tree/master/packages/assets-base#get-token-metadata

export default [
  {
    name: 'dai_optimism_6343ae93',
    displayName: 'Dai Stablecoin',
    decimals: 18,
    ticker: 'DAIoptimism6343AE93',
    displayTicker: 'DAI',
    addresses: {
      current: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
    info: {
      description:
        'Dai is a stable, decentralized currency that does not discriminate. Any individual or business can realize the advantages of digital money.',
      twitter: 'https://twitter.com/MakerDAO',
      website: 'https://makerdao.com/en/',
      telegram: 'https://t.me/makerdaoOfficial',
    },
    primaryColor: '#FBCC5F',
    gradientColors: ['#FBCC5F', '#FBF35F'],
  },
  {
    name: 'op_optimism_4a7ee59d',
    displayName: 'Optimism',
    decimals: 18,
    ticker: 'OPoptimism4A7EE59D',
    displayTicker: 'OP',
    addresses: { current: '0x4200000000000000000000000000000000000042' },
    info: {
      description:
        'The OP token is used for governance and funding projects on Optimism, a layer 2 blockchain built on top of Ethereum that aims to be non-profit. It offers fast, low-cost transactions while leveraging the security of Ethereum.',
      twitter: 'https://twitter.com/optimismFND',
      website: 'https://www.optimism.io/',
    },
    primaryColor: '#FF0420',
    gradientColors: ['#FF0420', '#A10013'],
  },
  {
    name: 'usdc_optimism_68bb70cd',
    displayName: 'USDC',
    decimals: 6,
    ticker: 'USDCoptimism68BB70CD',
    displayTicker: 'USDC',
    addresses: { current: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85' },
    info: {
      description:
        'USDC is a token designed as a stablecoin issued by Circle and Coinbase. Each unit of USDC is backed by a unit of US Dollar in audited bank accounts in order to ensure 1 USDC is always equal to 1 USD.',
      reddit: 'https://www.reddit.com/r/USDC/',
      twitter: 'https://twitter.com/centre_io',
      website: 'https://www.centre.io/usdc',
    },
    primaryColor: '#3E90E8',
    gradientColors: ['#3E90E8', '#2775CA'],
  },
  {
    name: 'usdt_optimism_26487766',
    displayName: 'Tether USD',
    decimals: 6,
    ticker: 'USDToptimism26487766',
    displayTicker: 'USDT',
    addresses: { current: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58' },
    info: {
      description:
        'Tether is a multi-chain stablecoin. Each USDT token is designed to be backed by a U.S. Dollar held in banking reserves.',
      reddit: 'https://www.reddit.com/r/Tether/',
      twitter: 'https://twitter.com/tether_to',
      website: 'https://tether.to/',
    },
    primaryColor: '#53AE94',
    gradientColors: ['#53AE94', '#2E9175'],
  },
  {
    name: 'wld_optimism_59dbb49e',
    displayName: 'Worldcoin',
    decimals: 18,
    ticker: 'WLDoptimism59DBB49E',
    displayTicker: 'WLD',
    addresses: { current: '0xdC6fF44d5d932Cbd77B52E5612Ba0529DC6226F1' },
    info: {
      description:
        "Worldcoin is designed to become the world's largest privacy-preserving human identity and financial network, giving ownership to everyone. Worldcoin aims to provide universal access to the global economy no matter your country or background, establishing a place for all of us to benefit in the age of AI.",
      telegram: 'https://t.me/worldcoin',
      twitter: 'https://twitter.com/worldcoin',
      website: 'https://worldcoin.org/',
    },
    primaryColor: '#FFFFFF',
    gradientColors: ['#D5D5D5', '#FFFFFF'],
  },
]
