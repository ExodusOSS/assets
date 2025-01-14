import { Api } from '../api.js'
import assets from './assets.js'
import { PASSKEYS_USDC_SOL_TX } from './fixtures.js'

const api = new Api({ assets })
test('Solana: parseTransaction passkeys USDC + SOL', async () => {
  const owner = '3z7g4CaFebcA9UTtMTDV3QuJF2KEHwix3vFbruw2dQKc'
  const tokenAccounts = [
    {
      tokenAccountAddress: '9F97Q2qLnaKiHZRK7tmCk1mpWSyLqBMDwKEtT1Fse28K',
      owner,
      tokenName: 'usdcoin_solana',
      ticker: 'USDCSOL',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      decimals: 6,
      feeBasisPoints: 0,
      maximumFee: 0,
    },
  ]
  const tx = api.parseTransaction(owner, PASSKEYS_USDC_SOL_TX, tokenAccounts)
  expect(tx.id).toEqual(
    '534jE3t8M1b5yeJtjNRJLiRsBWE5r5r8XukKF8kH5fn9kPS6AZjhCLHrERhquKVi6cMCJgVwHUC8sM6LD6GGf9Qs'
  )

  // console.log('Passkeys USDC + SOL tx:', JSON.stringify(tx, null, 2))
  expect(tx).toEqual({
    id: '534jE3t8M1b5yeJtjNRJLiRsBWE5r5r8XukKF8kH5fn9kPS6AZjhCLHrERhquKVi6cMCJgVwHUC8sM6LD6GGf9Qs',
    slot: 293_521_323,
    error: false,
    owner: '5Vks2yuTZXaHgX9Cwe4nNFu5zGabx16TqvhMSnyLt3HN',
    from: '5Vks2yuTZXaHgX9Cwe4nNFu5zGabx16TqvhMSnyLt3HN',
    to: '3z7g4CaFebcA9UTtMTDV3QuJF2KEHwix3vFbruw2dQKc',
    amount: 250_000_000,
    fee: 0,
    tokenTxs: [
      {
        id: '534jE3t8M1b5yeJtjNRJLiRsBWE5r5r8XukKF8kH5fn9kPS6AZjhCLHrERhquKVi6cMCJgVwHUC8sM6LD6GGf9Qs',
        slot: 293_521_323,
        owner: null,
        token: {
          tokenAccountAddress: '9F97Q2qLnaKiHZRK7tmCk1mpWSyLqBMDwKEtT1Fse28K',
          tokenName: 'usdcoin_solana',
          ticker: 'USDCSOL',
          mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          tokenProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
          decimals: 6,
          feeBasisPoints: 0,
          maximumFee: 0,
        },
        from: '62K1tcn2GmfDPUfqk248czT2ZPjtzS2UZ49nRoEUwZgx',
        to: '3z7g4CaFebcA9UTtMTDV3QuJF2KEHwix3vFbruw2dQKc',
        amount: 10_000_000,
        fee: 0,
      },
    ],
  })
})
