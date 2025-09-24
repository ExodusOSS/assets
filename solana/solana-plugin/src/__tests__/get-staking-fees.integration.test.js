import baseAsset from '../index.js'

const assetClientInterface = {
  getPublicKey: async () => '',
}

const solana = baseAsset.createAsset({ assetClientInterface })

test('Solana: get Stake fee', async () => {
  const amount = solana.currency.parse('0.01 SOL')
  const toAddress = '7enKBykFkLaVqfgSoqvZua4C7TLefBr6agESPLpSNutu'
  const stakingInfo = {
    accounts: {},
    staking: {
      pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF', // DEFAULT_POOL_ADDRESS
    },
  }

  const feeData = solana.api.getFeeData()
  const { fee } = await solana.api.getFeeAsync({
    asset: solana,
    method: 'delegate',
    feeData,
    amount,
    toAddress,
    fromAddress: toAddress,
    stakingInfo,
  })
  expect(fee).toEqual(solana.currency.parse('5450 Lamports'))
})

test('Solana: get Withdraw fee', async () => {
  const toAddress = 'FmhoEAMq9rdRunJV3afL9kLzGCQitoQxNwq1M7868Abc'
  const stakingInfo = {
    accounts: {
      AtpVqcyhFoC6E2RXAoNLjFJTySMvakpZQKzNrGdFghq: {
        activationEpoch: 776,
        deactivationEpoch: 778,
        stake: 7_722_670,
        voter: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
        warmupCooldownRate: 0.25,
        lamports: 10_005_550,
        state: 'inactive',
        isDeactivating: false,
        canWithdraw: true,
      },
      '8BfEqtx3AcMUQqhnsMmmYhTCocbEf7YBX7TJzhtmkV7d': {
        activationEpoch: 719,
        deactivationEpoch: 778,
        stake: 7_886_828,
        voter: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
        warmupCooldownRate: 0.25,
        lamports: 10_191_377,
        state: 'inactive',
        isDeactivating: false,
        canWithdraw: true,
      },
      GJ4wYdpyPayUDFZmKsstwb2uPVxTqSq1ssdMCDVX2nGk: {
        activationEpoch: 765,
        deactivationEpoch: 778,
        stake: 7_753_598,
        voter: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
        warmupCooldownRate: 0.25,
        lamports: 10_036_478,
        state: 'inactive',
        isDeactivating: false,
        canWithdraw: true,
      },
    },
    staking: {
      pool: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF', // DEFAULT_POOL_ADDRESS
    },
  }

  const feeData = solana.api.getFeeData()
  const { fee } = await solana.api.getFeeAsync({
    asset: solana,
    method: 'withdraw',
    feeData,
    toAddress,
    fromAddress: toAddress,
    stakingInfo,
  })
  expect(fee).toEqual(solana.currency.parse('8484 Lamports')) // expecting to throw AccountNotFound (if the test account withdrew everything and has not enough balance)
})
