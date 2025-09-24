export const siweFixtures = {
  valid: [
    {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      testName: 'Valid EIP-4361 (example).',
      message:
        'service.org wants you to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\nI accept the ServiceOrg Terms of Service: https://service.org/tos\n\nURI: https://service.org/login\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z\nResources:\n- ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu\n- https://example.com/my-web2-claim.json',
      url: new URL('https://service.org'),
    },
    {
      address: '0xB599f377d292cd92DF96b44de12467eeEa54A503',
      testName: 'Valid MagicSquare EIP-4361.',
      message:
        'magicsquare.io wants you to sign in with your Ethereum account:\n0xB599f377d292cd92DF96b44de12467eeEa54A503\n\nConfirm authorization in Magic Store with your wallet: 0xB599...A503\n\nURI: https://magicsquare.io\nVersion: 1\nChain ID: 56\nNonce: iUfW2bBbzGTE67fSd\nIssued At: 2025-01-12T16:48:27.757Z',
      url: new URL('https://magicsquare.io'),
    },
    {
      address: 'Hd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU',
      testName: 'Valid EIP-4361, adopted for Solana.',
      message:
        'magiceden.io wants you to sign in with your Solana account:\nHd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU\n\nWelcome to Magic Eden. Signing is the only way we can truly know that you are the owner of the wallet you are connecting. Signing is a safe, gas-less transaction that does not in any way give Magic Eden permission to perform any transactions with your wallet.\n\nURI: https://magiceden.io/\nVersion: 1\nChain ID: mainnet\nNonce: a43678f79ca642cf878d97ec4410dd95\nIssued At: 2025-01-15T05:46:39.548Z\nRequest ID: c1314b5b-ece8-4b4f-a879-3894dda364e4',
      url: new URL('https://magiceden.io'),
    },
    {
      testName: 'Custom Tensor message.',
      message:
        'Authenticate wallet (Hd9i...pBAU) by signing the below: bcf868e3-f23c-4880-aba4-a02cc2b3cd1d',
    },
    {
      testName: 'Blur.io custom message.',
      message:
        'Sign in to Blur\n\nChallenge: 020ca0aa2fd479bedb147d976a98637991be8debe0e5ecae04a5ee3e912c2673',
    },
    {
      testName: 'Custom theportal.to message.',
      message: 'Approve Portals sign-in',
    },
    {
      address: '0xcB9d6b1538C29e262c478165366e790359D16B91',
      testName: 'Decentraland custom message.',
      message:
        'Decentraland Login\nEphemeral address: 0xcB9d6b1538C29e262c478165366e790359D16B91\nExpiration: 2025-02-11T18:21:39.599Z',
    },
    {
      address: '0xb599f377d292cd92df96b44de12467eeea54a503',
      testName: 'OpenSea custom message.',
      message:
        'Welcome to OpenSea!\n\nClick to sign in and accept the OpenSea Terms of Service (https://opensea.io/tos) and Privacy Policy (https://opensea.io/privacy).\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n0xb599f377d292cd92df96b44de12467eeea54a503\n\nNonce:\nef44873c-271a-42a8-9f06-80871a37fb7b',
      url: new URL('https://opensea.io'),
    },
  ],
  invalid: [
    {
      testName:
        'Custom Rarible Sign-in message (invalid EIP-4361). Includes TOS hosted on subdomains, which we currently do not allow.',
      message:
        'I want to login on Rarible at 2024-08-16T16:42:55.953Z. I accept the Rarible Terms of Service https://static.rarible.com/terms.pdf and I am at least 13 years old.',
      url: new URL('https://rarible.com'),
    },
    {
      address: '0xB599f377d292cd92DF96b44de12467eeEa54A503',
      testName:
        'Custom Mooar message (invalid EIP-4361). Includes TOS hosted on subdomains, which we currently do not allow.',
      message:
        'Welcome to MOOAR!\n\nClick to sign in and accept the MOOAR Terms of Service: https://termsofuse.mooar.com/\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n0xB599f377d292cd92DF96b44de12467eeEa54A503\n\nTime:\n2025-01-12T18:15:21.848Z\n',
      url: new URL('https://mooar.com'),
    },
  ],
}

export const findAddressesFixtures = [
  {
    testName: 'One EVM address in the message',
    addresses: ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    message:
      'service.org wants you to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: 'Two same EVM addresses in the message',
    addresses: [
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ],
    message:
      'service.org wants you \n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: 'Two unique EVM addresses in the message',
    addresses: [
      '0x0000000000000000000000000000000000000000',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    ],
    message:
      'service.org wants you \n0x0000000000000000000000000000000000000000\n to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: 'One Solana address in the message',
    addresses: ['Hd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU'],
    message:
      'service.org wants you to sign in with your Solana account:\nHd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU\n\n',
  },
  {
    testName: 'Two same Solana addresses in the message',
    addresses: [
      'Hd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU',
      'Hd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU',
    ],
    message:
      'service.org wants you \nHd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU\n to sign in with your Solana account:\nHd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU\n\n',
  },
  {
    testName: 'Two unique Solana addresses in the message',
    addresses: [
      'Hd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU',
      '87fX6AAJywaQfgMpD9Gkwxpt1e129kKZxBdRG1SQA43m',
    ],
    message:
      'service.org wants you \nHd9iTDefaoq5MRebai6fiNutVngipkA6zcvTmNXmpBAU\n to sign in with your Solana account:\n87fX6AAJywaQfgMpD9Gkwxpt1e129kKZxBdRG1SQA43m\n\n',
  },
]

export const findURLsFixtures = [
  {
    testName: 'One domain with a protocol.',
    urls: [new URL('https://service.org')],
    message:
      'https://service.org wants you to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: 'Two domains, one with a subdomain.',
    urls: [
      new URL('https://service.org'),
      new URL('https://sumbdomain.service.org'),
    ],
    message:
      'https://service.org https://sumbdomain.service.org wants you to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: 'Multiple domains.',
    urls: [
      new URL('https://test.com'),
      new URL('http://test1.test.com'),
      new URL('http://abc.com'),
    ],
    message:
      'https://test.com to sign in with http://test1.test.com your http://abc.com Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\n',
  },
  {
    testName: "A valid EIP-4361 message (w/o 'Resources').",
    urls: [
      new URL('https://service.org/tos'),
      new URL('https://service.org/login'),
    ],
    message:
      'service.org wants you to sign in with your Ethereum account:\n0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\n\nI accept the ServiceOrg Terms of Service: https://service.org/tos\n\nURI: https://service.org/login\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z\n',
  },
  {
    testName: 'A custom Rarible message.',
    urls: [new URL('https://static.rarible.com/terms.pdf')],
    message:
      'I want to login on Rarible at 2024-08-16T16:42:55.953Z. I accept the Rarible Terms of Service https://static.rarible.com/terms.pdf and I am at least 13 years old.',
  },
  {
    testName: 'A custom Mooar message.',
    urls: [new URL('https://termsofuse.mooar.com')],
    message:
      'Welcome to MOOAR!\n\nClick to sign in and accept the MOOAR Terms of Service: https://termsofuse.mooar.com/\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n0xB599f377d292cd92DF96b44de12467eeEa54A503\n\nTime:\n2025-01-12T18:15:21.848Z\n',
  },
]
