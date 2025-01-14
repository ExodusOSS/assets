export async function getOrdinalsSeed() {
  // dev private seed for integration tests
  try {
    return (
      // eslint-disable-next-line unicorn/no-await-expression-member, @exodus/import/no-unresolved
      process.env.ASSETS_ORDINALS_SEED?.trim() || (await import('./private-seed.js')).privateSeed
    )
  } catch (e) {
    console.warn('Ordinals seed could not be loaded:', e.message)
    return null
  }
}

export const ordinalsSeedXpubs = {
  0: {
    bip44:
      'xpub6DELbCjpmxCZPrvReXApKRoVZynsZ9S1JmMQNqAPuj8z4hq8pcrHUWenf4zWGxXwyKQR9RAKRLnnmUgQWuLTBvVSvxLLEutB6zaSfuhu5S5',
    bip49:
      'xpub6CQcGBKSfvvqoAt99iEPpQKqdFjKXpt3foyiXjSm7d28vewYnYFwgJQ8uYypfroXRCL3mCuDuD6EyppR6UexidtsZcD6EPbMCR8Tid2biJC',
    bip84:
      'xpub6BuHSsF9fGTxpDh8EtcLytJG2hpWLLARvKuP35ZNvPp4abLuRHyzchkSge67HaNZLaQFPdZ3ZXUxPyU6wSJKh5E7WBXMBQNwhrN2YCRSZHy',
    bip86:
      'xpub6DKwsbXwPnrEn62uZwq1mDf7SwPdirctTNVdGsgpmCee9oAHaxRhwtcKL6iAWHWeK1GGhPhNmkcLcbpcAWBMVt7SLwDpWxZ3cYecPcLXWX3',
  },
}
