import Transaction from '../transaction.js'
import { TEST_TX, TOKEN_TEST_PRIVATE_KEY, TOKEN_TEST_TX } from './fixtures.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627'
// const PUBLIC_KEY = '2694741f79e105feac100ae2dbfc7d3ef0fc7fdeced1c9b1c2f7f927d8460e10'
const TX_ID =
  'FUJKiDXKJSRZuPP7ordWojhhu5y3bWuUPtin6RkPKuAJx6X8d9ySbwf7oPdaYQ4UDswtAL2LdmJ3zFqwX7n5mvZ'

test('Solana: constructor "from" required', () => {
  try {
    const x = new Transaction()
    expect(x).toEqual('FAIL!')
  } catch (e) {
    expect(e.message).toEqual('from is required')
  }
})

test('Solana: build SOL transaction', () => {
  const tx = new Transaction(TEST_TX)
  expect(JSON.stringify(tx.txObj)).toEqual(JSON.stringify(TEST_TX))
  expect(tx.transaction).toBeTruthy()
  expect(tx.transaction.signatures.length).toBeFalsy() // not signed yet
  expect(tx.transaction.instructions.length).toBeTruthy()
  expect(tx.transaction.recentBlockhash).toBeTruthy()
})

test('Solana: Transaction.sign', () => {
  const tx = new Transaction(TEST_TX)

  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.transaction.signatures.length).toBeTruthy()

  const firstSignature = tx.transaction.signatures[0]
  expect(Buffer.isBuffer(firstSignature.signature)).toBeTruthy()
  expect(firstSignature.publicKey).toBeTruthy()
})

test('Solana: serialize transaction e txId', () => {
  const tx = new Transaction(TEST_TX)
  Transaction.sign(tx, PRIVATE_KEY)
  const wireTransaction = tx.serialize()
  expect(typeof wireTransaction).toEqual('string')
  const txId = tx.getTxId()
  expect(txId).toEqual(TX_ID)
})

test('Solana: decode serialized staking transaction', () => {
  const encStakeTx =
    'AWgu5eVR6Kwy8i3QtyCNTrMQmz4gUyLem0ZaiIHlXtuUKKAcH8XAs6oyBgkbbeNis3H+GHrKaBxyGnYyhHqavgoBAAcJJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhCHLoHSsA6O8tlDmCs6PE0d2bP/8pHiL006XZ2CminFOAan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAAfOBpD4L7YUdf670WBe8gw0apFncG2CnORplDXEwngK4Gp9UXGMd0yShWY5hpHV62i164o5tLbVxzVVshAAAAAAan1RcZNYTQ/u2bs0MdEyBr5UQoG1e4VmzFN1/0AAAABqHYF6UCBQtoB5Hmzm24jh5bcVD2H8Z5Ck600QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAah2BeRN1QqmDQ3vf4qerJVf1NcinhyK2ikncAAAAAAUg6JkCZVlOEGUrxbnkLf5+UkulSxOzPtWnL3Yu8dE9ADBwIAAWMDAAAAJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhAHAAAAAAAAAHN0YWtlOjB7AAAAAAAAAMgAAAAAAAAABqHYF5E3VCqYNDe9/ip6slV/U1yKeHIraKSdwAAAAAAIAgECdAAAAAAmlHQfeeEF/qwQCuLb/H0+8Px/3s7RybHC9/kn2EYOECaUdB954QX+rBAK4tv8fT7w/H/eztHJscL3+SfYRg4QAAAAAAAAAAAAAAAAAAAAACaUdB954QX+rBAK4tv8fT7w/H/eztHJscL3+SfYRg4QCAYBAwQFBgAEAgAAAA=='
  const encUndelegateTx =
    'AZRrpX19oXGIeqngcE7Mf4exyUbLuuB+5JPVWiwe2rtpKNpn3vE2uyakQxw8GEnXV5ou8KxE9DHSDWRmEm3QgQ4BAAIEJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhCHLoHSsA6O8tlDmCs6PE0d2bP/8pHiL006XZ2CminFOAan1RcYx3TJKFZjmGkdXraLXrijm0ttXHNVWyEAAAAABqHYF5E3VCqYNDe9/ip6slV/U1yKeHIraKSdwAAAAABSDomQJlWU4QZSvFueQt/n5SS6VLE7M+1acvdi7x0T0AEDAwECAAQFAAAA'
  const encWithdrawTx =
    'ASIK3EZEYLthuKl41CrslxZHHrfMw3Yn74UfXizYDobYm0QedRjhQ/tNNPQBfo9/GhtXIC8aAeYOP30BWuvXngwBAAMFJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhCHLoHSsA6O8tlDmCs6PE0d2bP/8pHiL006XZ2CminFOAan1RcYx3TJKFZjmGkdXraLXrijm0ttXHNVWyEAAAAABqfVFxk1hND+7ZuzQx0TIGvlRCgbV7hWbMU3X/QAAAAGodgXkTdUKpg0N73+KnqyVX9TXIp4citopJ3AAAAAAFIOiZAmVZThBlK8W55C3+flJLpUsTsz7Vpy92LvHRPQAQQFAQACAwAMBAAAAHsAAAAAAAAA'

  const stakeTx = Transaction.decodeStakingTx(encStakeTx)
  expect(stakeTx).toEqual({
    txId: '35p4fejpH3ykyRaqgDAoUKwfDe4czZmoZnBtCvyXnVTA1fHnZBQUmXm3QfARwkWocmveoSjTYrf2Y83BW2dRRK5T',
    owner: '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH',
    type: 'Delegate',
    stakeAddress: 'A6hAszhrraD94SEmMGkHsZmZBTXS9SowG21gddRcnxrj',
    validator: '9QU2QSxhb24FUX3Tu2FpczXjpK3VYrvRudywSZaM29mF',
  })

  const undelTx = Transaction.decodeStakingTx(encUndelegateTx)
  expect(undelTx).toEqual({
    txId: '3y7LZCu3Vi4KgzFk6cqgQTdeLQN5bNu25gQyMWV9dBd5huzy5C6e6Cy8FN4oGcamddoBoP2YmzdwiDFMzmHB7BCR',
    owner: '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH',
    type: 'Deactivate',
    stakeAddress: 'A6hAszhrraD94SEmMGkHsZmZBTXS9SowG21gddRcnxrj',
  })

  const withdrawTx = Transaction.decodeStakingTx(encWithdrawTx)
  expect(withdrawTx).toEqual({
    txId: 'gUbZWuxvZ4oCj1XSMSZjoxw1qJ2fhqpgbhGyrz1ktEES94eetboGwNhVnqE5qGVeNja5EU674khPsvZUKMsBQWF',
    owner: '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH',
    type: 'Withdraw',
    stakeAddress: 'A6hAszhrraD94SEmMGkHsZmZBTXS9SowG21gddRcnxrj',
    to: '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH',
    lamports: '123',
  })

  const versionedTx =
    'Af20VwrTynW/n31OkPa94mootWQ9CitHjVC/CNanPS7pdTkBpqNWlYNi7WBbCJx+uu/jDE44B28fEG/PWJFckgqAAQAGDzZ58cQhW+iFs68F7bTL4Fc/O22Iv21VtRp12TxBvybcY6eQ76+MS+VrJmOly0GFocz1+Lag6e/rTu5H7QTDQEWGuiclDpSuQ1EWi2egRdTPFjldYJUSDzL5WKEXAo0dviF6xQe1bYYi8dC1eUgJfGIDVXrDuhXTqUlQ4fBxXlGugaHHRDQR7PLu3obCZW18nrRaQVq1/ChMYey39mSPuBO8S6rDiVR4olpDpd54Jk4RyKRGYUM1DHqbI5+Ufn7tYPafu5BusptF05vY0whWfB17lXoe3hnRsBLAuFbGbaCo3aQ/1zyJL9nRRsb11lr5ntUdK9dBc/Jxu7Pa8ttBwVa6sHP1V0w1TZdCj9rKLO28ARXfeOSQi9S8fkudZi1fqgMGRm/lIRcy/+ytunLDm+e8jOW7xfcSayxDmzpAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANB1GoKC2mEwX+KZw3uZjlhHHbETUDcxD4vhBFpgr27sH0cOYhhN2WfC2w/qXokxXVfcGvwu1UfwzdIlvLiypuBpuIV/6rgYT7aH9jRhjANdrEOdwa6ztVmKDwAAAAAAENCbN2IkcYYOWRGKVsY2fSd9YN99q696YI8Ij2Iqm/2xyJqIG5pILzrzl3qj9Reecf9b72e33J0lazd905jJsUCAkACQP0ogoAAAAAAAkABQIgoQcACgIAAXwDAAAANnnxxCFb6IWzrwXttMvgVz87bYi/bVW1GnXZPEG/JtwgAAAAAAAAAEV1OGVzanVLZVhLc3AxVlRIZ3ZhMW1Vd0RXNlFMdndvQIUpAgAAAADcEwAAAAAAAA0HUagoLaYTBf4pnDe5mOWEcdsRNQNzEPi+EEWmCvbuCgIAAnwDAAAANnnxxCFb6IWzrwXttMvgVz87bYi/bVW1GnXZPEG/JtwgAAAAAAAAAEhwMWNtcHJwVXEzNFR1ajJESmZvZVd6RmhoaHBTZ0NEQMXJbAAAAADc/wMAAAAAAA0HUagoLaYTBf4pnDe5mOWEcdsRNQNzEPi+EEWmCvbuCgIAA3wDAAAANnnxxCFb6IWzrwXttMvgVz87bYi/bVW1GnXZPEG/JtwgAAAAAAAAADNrMzVjeGs4YlN0eE1pWThCMTJnSkdEbThaVVFwSHRlQMU5GwAAAADc/wAAAAAAAA0HUagoLaYTBf4pnDe5mOWEcdsRNQNzEPi+EEWmCvbuCgIABHwDAAAANnnxxCFb6IWzrwXttMvgVz87bYi/bVW1GnXZPEG/JtwgAAAAAAAAADltQnFvdGIxSFFveWpVUUNQNjlDaVFzVG5oYUhQWlltQMU5GwAAAADc/wAAAAAAAA0HUagoLaYTBf4pnDe5mOWEcdsRNQNzEPi+EEWmCvbuCwoFAQIDBAYHDA0QJwAAAAAAgJaYAAAAAACghgEAAAAAAAAAAAAAAAAAAABkAAAAAAAAAA4ECAAPCgkatYFoTYJt9AIBpdXH5Fw0MY6UGLD0X2ZCqvFTjH3ApLw6hRkLQyhHkwUBAAEH'
  const versioned = Transaction.decodeStakingTx(versionedTx)
  expect(versioned).toEqual(null)
})

test('Solana: build Token transaction', () => {
  const tx = new Transaction(TOKEN_TEST_TX)
  expect(tx.transaction).toBeTruthy()
  Transaction.sign(tx, TOKEN_TEST_PRIVATE_KEY)
  expect(tx.transaction.signatures.length).toEqual(1)
  expect(tx.transaction.instructions.length).toEqual(1)
  expect(tx.transaction.recentBlockhash).toBeTruthy()
  const wireTransaction = tx.serialize()
  expect(typeof wireTransaction).toEqual('string')
  const txId = tx.getTxId()
  expect(txId).toEqual(
    '3P86N9ubcNHo65qjinTBb52jRt8djcbg8Pv3nZ18Cmhvi3jpy1NN9ciE3WuhXK11dZFpoe8CyRLDBTkzLK7Gn1ZQ'
  )
})

test('Solana Token: throws when not enough balance', () => {
  try {
    const tx = new Transaction({ ...TOKEN_TEST_TX, amount: 2000 })
    expect(tx).toEqual('FAIL!')
  } catch (err) {
    expect(err.message.match(/Not enough balance/)).toBeTruthy()
  }
})

test('Solana Token: additional instruction expected when init token account', () => {
  const tx = new Transaction({ ...TOKEN_TEST_TX, isAssociatedTokenAccountActive: false })
  expect(tx.transaction.instructions.length).toEqual(2)
})
