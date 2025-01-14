export const TEST_TX = {
  from: '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH',
  to: 'ADkH1TdMM4wuRLJenStFmTzHGPNYg3HtZXGcKtSaxJ7s',
  amount: 1 * 1e9, // 1 SOL in Lamports
  recentBlockhash: '6XKHiG9hFP6fE5bqUmL2KgYo3F9DAFGsBiomtDK3Nb9H',
}

export const TOKEN_TEST_PRIVATE_KEY =
  'fddc6164a9c58668ab57a8f10eb0851aa417e4e14332b88801d6cdd411af4fb7'
export const TOKEN_TEST_TX = {
  from: '5xxY92GE7m98M664dkBBBiE8tfXUouRX9Ssnqo3yR8Jr', // owner
  to: 'DmUHBhkq3deAEjV6u2kY5TZP9CVQhqXs7sniGCCULiK4', // SOL address (it generates the right token address from this)
  amount: 100,
  tokenMintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
  destinationAddressType: 'solana',
  isAssociatedTokenAccountActive: true,
  fromTokenAddresses: [
    {
      tokenAccountAddress: '7se9TyMYX1Kt9ugWWnsqqDq1G92dPj8RJKto61tx9gZg',
      owner: '5xxY92GE7m98M664dkBBBiE8tfXUouRX9Ssnqo3yR8Jr',
      tokenName: 'Serum',
      mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt',
      ticker: 'SRM',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      balance: '900',
    },
  ],
  recentBlockhash: '6XKHiG9hFP6fE5bqUmL2KgYo3F9DAFGsBiomtDK3Nb9H',
}
