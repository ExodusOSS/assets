import Transaction from '../transaction.js'

const PRIVATE_KEY = '573a65233a8db309841c97e0c6b1f4c1d9b174278941f209442a63aff9905627'
const ADDRESS = '3bbnZt1mzp1EBRR9Rm6TX2cXzZYbVvM9THutWL8bCmVH'

const DEPOSIT_TOKEN_ADDRESS = '38y2gagfKoVVmLXxqESXWkBLHarzEq6f6cmA1DoAqRnB'

const RECENT_BLOCKHASH = '6XKHiG9hFP6fE5bqUmL2KgYo3F9DAFGsBiomtDK3Nb9H'

test('Solana: magicEdenInitializeEscrow Transaction', () => {
  const escrowAddress = '3FLp3gYkXfh7ZjB7PPoidfSdzHWxqfG1mYH1BkzAfwMe'
  const escrowBump = 253

  const tx = Transaction.magicEdenInitializeEscrow({
    initializerAddress: ADDRESS,
    initializerDepositTokenAddress: DEPOSIT_TOKEN_ADDRESS,
    escrowAddress,
    escrowBump,
    takerAmount: '1000000000',
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)

  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toEqual(1)

  const serialized = Transaction.serialize(tx)
  expect(serialized).toEqual(
    'AaPAWC06yQk4OoVIiFGZNJ5+ClaR41HLjoMQ9EQrLSHnaPmxaR4ULvf+jymqEqbJG/onV1dNM7uWMOA/47uq9AQBAAMGJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhAfwcqt9B07zWR1jSqTrLD4LwAY+5mQgbDyw6gd3m+FbCFj59yTpTY7vVEQ8Z6W/HnxeFL3qZ+BlEtdvlNbdkQlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFLyGp/mBOVp6VbykiMQb6Js4KIVICR6k6B6FIkjnI/wbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpUg6JkCZVlOEGUrxbnkLf5+UkulSxOzPtWnL3Yu8dE9ABBAUAAQIFAxGW1IC6dAGDcQDKmjsAAAAA/Q=='
  )
})

test('Solana: magicEdenCancelEscrow Transaction', () => {
  const tx = Transaction.magicEdenCancelEscrow({
    initializerAddress: ADDRESS,
    initializerDepositTokenAddress: DEPOSIT_TOKEN_ADDRESS,
    escrowAddress: 'AicHKDZR5jLfozYcek5ZHw5mJfxBNFbUwHF2nM4qF8oN',
    pdaAddress: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp',
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)

  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toEqual(1)

  const serialized = Transaction.serialize(tx)
  expect(serialized).toEqual(
    'AYmtRGCWlFTxsgrX4HgYjOcIv8XCARXIBYZ48oTSdRzm82y+g+VplCPehKpTkqjHbdSxUjv3ypnF5ALJweVbTA0BAAMGJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhAfwcqt9B07zWR1jSqTrLD4LwAY+5mQgbDyw6gd3m+FbJBh41+KI2xxW1YtQ4jdsbgO8EZRl80J/mYr7P3IMQsN5fUsz1ZkSOKsCvg3tD4l7P9vg+Gop8MPYzxFSBvlS4kFLyGp/mBOVp6VbykiMQb6Js4KIVICR6k6B6FIkjnI/wbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpUg6JkCZVlOEGUrxbnkLf5+UkulSxOzPtWnL3Yu8dE9ABBAUAAQMCBQicyzazJkghFQ=='
  )
})

test('Solana: magicEdenExchange Transaction', () => {
  const expectedTakerAmount = '50000000'
  const expectedMintAddress = '6eGfgGuxA1pBtTX4k2oubpa6m1Z3eaJUBxgtZFB7sjZA'

  const tx = Transaction.magicEdenExchange({
    expectedTakerAmount,
    expectedMintAddress,
    takerAddress: ADDRESS,
    initializerAddress: 'FuDxYSDtRAG4P65wxAmUZShBSGtn79o2yJpPF13LQB87',
    initializerDepositTokenAddress: DEPOSIT_TOKEN_ADDRESS,
    escrowAddress: 'AicHKDZR5jLfozYcek5ZHw5mJfxBNFbUwHF2nM4qF8oN',
    pdaAddress: 'GUfCR9mK6azb9vcpsxgXyj7XRPAKJd4KMHTTVvtncGgp',
    metadataAddress: '4ysTyhoHDAv28dGUD2ASS9zmAHi3QZyXVQW25f6QwWN',
    creators: [
      {
        address: 'D6ZQMLTJAa14XhzCFBJ2uuPjYDbYfewrVDVSyFZSuBYe',
        verified: 1,
        share: 100,
      },
    ],
    recentBlockhash: RECENT_BLOCKHASH,
  })

  expect(tx.instructions.length).toEqual(1)
  expect(tx.signatures.length).toEqual(0)
  expect(tx.recentBlockhash).toEqual(RECENT_BLOCKHASH)

  // sign it
  Transaction.sign(tx, PRIVATE_KEY)
  expect(tx.signatures.length).toEqual(1)

  const serialized = Transaction.serialize(tx)
  expect(serialized).toEqual(
    'AWxvzrzwrnCk4fwZ0fY+/4wCbwjD5o1vprWWvk0MfMz2YvHZJLLrs++A1wczWcGx0WDRESo/9bSF7I68b0ECZAYBAAULJpR0H3nhBf6sEAri2/x9PvD8f97O0cmxwvf5J9hGDhAUYhg/FHGe6CtpVHU+n6TFv0CM80NW+TexmSiGRIjimR/Byq30HTvNZHWNKpOssPgvABj7mZCBsPLDqB3eb4VskGHjX4ojbHFbVi1DiN2xuA7wRlGXzQn+Zivs/cgxCw2zuMju2RMhsdS8+QV7IAnGF60nATDLxXbxwwZkJ9yJw91keGOKhXmzwQ5F/UWizW2P+d4qBqHV/fCt3CPpVkUMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABBQuvJXXY+jr1h6d3SUkYKLPGWcS3HxOBjbEvUr7zZ+X1LM9WZEjirAr4N7Q+Jez/b4PhqKfDD2M8RUgb5UuJBS8hqf5gTlaelW8pIjEG+ibOCiFSAkepOgehSJI5yP8G3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqVIOiZAmVZThBlK8W55C3+flJLpUsTsz7Vpy92LvHRPQAQkKAAIFAwgGCgEHBDBDjjbYHx0bXIDw+gIAAAAAU9ajnekKkiaBampKBKD/hwvGhhqh0RSxuC2b1dA6HiE='
  )
})
