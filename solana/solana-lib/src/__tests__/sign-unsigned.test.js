import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@exodus/solana-web3.js'

import { signHardware, signUnsignedTx } from '../tx/index.js'
import { TOKEN_TEST_PRIVATE_KEY, TOKEN_TEST_TX } from './fixtures.js'

const mockHardwareDevice = {
  signTransaction: jest.fn(),
}

describe('.signUnsignedTx()', () => {
  const signer = Keypair.fromSeed(Buffer.from(TOKEN_TEST_PRIVATE_KEY, 'hex'))

  it('should sign legacy transactions', async () => {
    const unsignedTx = {
      txData: {
        transaction: createLegacyTransaction(signer.publicKey),
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, signer.secretKey)
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toBe(
      '5srDo5tohuMzxXxGP5jjE8ok4VfRyea7awubKQP6X1LgYrc3QSDEEjT1gjxhLzkGMmChDwTfPA5o5U6TNVSQ9xLu'
    )
    expect(rawTx).toBe(
      'AfPq/Pu49hhbGPWoahqHAWENfJVQsEOnFX2zdLljPhY0Pz6sGzKfyG2jAOb03DFTQDt0zC+5ycSh6q4kKPQa5Q4BAAABScR86a2d5bKJY8eZCMHCkDbpXg6eNsiCr7Ho/ZpfNweGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEAAQAA'
    )
    expect(decodedTransaction.verifySignatures(true)).toBeTruthy()
  })

  it('should sign legacy transactions by vendored lib', async () => {
    const unsignedTx = {
      txData: {
        ...TOKEN_TEST_TX,
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, TOKEN_TEST_PRIVATE_KEY)
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toEqual(
      '3P86N9ubcNHo65qjinTBb52jRt8djcbg8Pv3nZ18Cmhvi3jpy1NN9ciE3WuhXK11dZFpoe8CyRLDBTkzLK7Gn1ZQ'
    )
    expect(rawTx).toBe(
      'AXcchbMdh1XIwTeeh38A7an5okIRDDAB1kttRmx3WDrF7N/WQLemrBBgQc9ddgrsaL1KA07KGZRMEtLR12z97Q8BAAEEScR86a2d5bKJY8eZCMHCkDbpXg6eNsiCr7Ho/ZpfNwdmHym+9RqpktvVuia1XV8naqhG3zcdM4stgIz8o/rW86M6Y7kTFelELmUGcs6H8ANLNXut+r2PFVazd0EE2c+hBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlSDomQJlWU4QZSvFueQt/n5SS6VLE7M+1acvdi7x0T0AEDAwECAAkDZAAAAAAAAAA='
    )
    expect(decodedTransaction.verifySignatures(true)).toBeTruthy()
  })

  it('should sign legacy transaction and keep 3rd party signatures', async () => {
    const unsignedTx = {
      txData: {
        transaction: createLegacyTransactionMultipleSignatures(signer.publicKey),
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, signer.secretKey)
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toBe(
      '5i44xGijk7RLAN4387G29Ri5Sn9Bpbk1A1iLyjjcfEkoq1tzGyZA478VppR7UUDChWHHMV7UFmZFCh9yAFZ3vBAj'
    )
    expect(rawTx).toBe(
      'Aut4b8Vo2GRMwpvXg3pq6yJX8r6Yg1FF2ctKdR1he9278cgcSjCkCMboAekVluB0P6f1TZdsaAoEraC73lrttATvbP/5Dpun6sGJx3sJtUM2E/2OlW0vZ7Y3rKvDe4dZGeW6/EDOqzpdi+HkaD6oOPJFXqUUq5smNk6zT6R5UiIBAgAAAknEfOmtneWyiWPHmQjBwpA26V4OnjbIgq+x6P2aXzcH3JjgL0nxKTfFl0J47imoWyg5BRzzZDG3IJAMSvvfpqyGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEAAgABAA=='
    )
    expect(decodedTransaction.verifySignatures(true)).toBeTruthy()
  })

  it('should sign versioned transactions', async () => {
    const unsignedTx = {
      txData: {
        transaction: createVersionedTransaction(signer.publicKey),
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, signer.secretKey)
    console.log('ver tx', rawTx)

    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = VersionedTransaction.deserialize(rawTxBytes)
    expect(txId).toBe(
      '3MWPvyeoU6aevf9vJzGzNq2rzrJhndpDpWeDpkorq8V5JMMkeR1UyXiKd4UaAHWPz5wuuKsL4XfFbvjUoVf7jMoX'
    )
    expect(rawTx).toBe(
      'AXW34k3x6W1QEZTvMQ9L+v/Te3YmHDpLaUBxyOHwPrMjoOg56/mN52BBnizcxPIcNTZGPs/s7Zh2/7Kpavzc1QqAAQABAknEfOmtneWyiWPHmQjBwpA26V4OnjbIgq+x6P2aXzcHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEBAgAADAIAAADoAwAAAAAAAAA='
    )
    expect(decodedTransaction).toBeDefined()
  })

  it('should sign a versioned transaction created from a buffer', async () => {
    const unsignedTx = {
      txData: {
        transactionBuffer: createVersionedTransaction(signer.publicKey).serialize(),
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, signer.secretKey)

    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = VersionedTransaction.deserialize(rawTxBytes)
    expect(txId).toBe(
      '3MWPvyeoU6aevf9vJzGzNq2rzrJhndpDpWeDpkorq8V5JMMkeR1UyXiKd4UaAHWPz5wuuKsL4XfFbvjUoVf7jMoX'
    )
    expect(rawTx).toBe(
      'AXW34k3x6W1QEZTvMQ9L+v/Te3YmHDpLaUBxyOHwPrMjoOg56/mN52BBnizcxPIcNTZGPs/s7Zh2/7Kpavzc1QqAAQABAknEfOmtneWyiWPHmQjBwpA26V4OnjbIgq+x6P2aXzcHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEBAgAADAIAAADoAwAAAAAAAAA='
    )
    expect(decodedTransaction).toBeDefined()
  })

  it('should sign a legacy transaction created from a buffer', async () => {
    const unsignedTx = {
      txData: {
        transactionBuffer: createLegacyTransaction(signer.publicKey).serialize({
          requireAllSignatures: false,
        }),
      },
    }
    const { txId, rawTx } = await signUnsignedTx(unsignedTx, signer.secretKey)

    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toBe(
      '5srDo5tohuMzxXxGP5jjE8ok4VfRyea7awubKQP6X1LgYrc3QSDEEjT1gjxhLzkGMmChDwTfPA5o5U6TNVSQ9xLu'
    )
    expect(rawTx).toBe(
      'AfPq/Pu49hhbGPWoahqHAWENfJVQsEOnFX2zdLljPhY0Pz6sGzKfyG2jAOb03DFTQDt0zC+5ycSh6q4kKPQa5Q4BAAABScR86a2d5bKJY8eZCMHCkDbpXg6eNsiCr7Ho/ZpfNweGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEAAQAA'
    )
    expect(decodedTransaction).toBeDefined()
  })
})

describe('.signHardware()', () => {
  const accountIndex = 0
  const publicKey = Buffer.from(
    '49c47ce9ad9de5b28963c79908c1c29036e95e0e9e36c882afb1e8fd9a5f3707',
    'hex'
  )

  it('should sign legacy transactions', async () => {
    mockHardwareDevice.signTransaction.mockResolvedValue([
      {
        publicKey,
        signature: Buffer.from(
          'f3eafcfbb8f6185b18f5a86a1a8701610d7c9550b043a7157db374b9633e16343f3eac1b329fc86da300e6f4dc3153403b74cc2fb9c9c4a1eaae2428f41ae50e',
          'hex'
        ),
      },
    ])
    const unsignedTx = {
      txData: {
        transaction: createLegacyTransaction(publicKey),
      },
    }
    const { txId, rawTx } = await signHardware({
      unsignedTx,
      hardwareDevice: mockHardwareDevice,
      accountIndex,
    })
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toBe(
      '5srDo5tohuMzxXxGP5jjE8ok4VfRyea7awubKQP6X1LgYrc3QSDEEjT1gjxhLzkGMmChDwTfPA5o5U6TNVSQ9xLu'
    )
    expect(rawTx).toBe(
      'AfPq/Pu49hhbGPWoahqHAWENfJVQsEOnFX2zdLljPhY0Pz6sGzKfyG2jAOb03DFTQDt0zC+5ycSh6q4kKPQa5Q4BAAABScR86a2d5bKJY8eZCMHCkDbpXg6eNsiCr7Ho/ZpfNweGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEAAQAA'
    )
    expect(decodedTransaction.verifySignatures(true)).toBeTruthy()
  })

  it('should sign legacy transactions by vendored lib', async () => {
    mockHardwareDevice.signTransaction.mockResolvedValue([
      {
        publicKey,
        signature: Buffer.from(
          '771c85b31d8755c8c1379e877f00eda9f9a242110c3001d64b6d466c77583ac5ecdfd640b7a6ac106041cf5d760aec68bd4a034eca19944c12d2d1d76cfded0f',
          'hex'
        ),
      },
    ])

    const unsignedTx = {
      txData: {
        ...TOKEN_TEST_TX,
      },
    }
    const { txId, rawTx } = await signHardware({
      unsignedTx,
      hardwareDevice: mockHardwareDevice,
      accountIndex,
    })
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = Transaction.from(rawTxBytes)
    expect(txId).toEqual(
      '3P86N9ubcNHo65qjinTBb52jRt8djcbg8Pv3nZ18Cmhvi3jpy1NN9ciE3WuhXK11dZFpoe8CyRLDBTkzLK7Gn1ZQ'
    )
    expect(rawTx).toBe(
      'AXcchbMdh1XIwTeeh38A7an5okIRDDAB1kttRmx3WDrF7N/WQLemrBBgQc9ddgrsaL1KA07KGZRMEtLR12z97Q8BAAEEScR86a2d5bKJY8eZCMHCkDbpXg6eNsiCr7Ho/ZpfNwdmHym+9RqpktvVuia1XV8naqhG3zcdM4stgIz8o/rW86M6Y7kTFelELmUGcs6H8ANLNXut+r2PFVazd0EE2c+hBt324ddloZPZy+FGzut5rBy0he1fWzeROoz1hX7/AKlSDomQJlWU4QZSvFueQt/n5SS6VLE7M+1acvdi7x0T0AEDAwECAAkDZAAAAAAAAAA='
    )
    expect(decodedTransaction.verifySignatures(true)).toBeTruthy()
  })

  it('should sign versioned transactions', async () => {
    mockHardwareDevice.signTransaction.mockResolvedValue([
      {
        publicKey,
        signature: Buffer.from(
          '75b7e24df1e96d501194ef310f4bfaffd37b76261c3a4b694071c8e1f03eb323a0e839ebf98de760419e2cdcc4f21c3536463ecfeced9876ffb2a96afcdcd50a',
          'hex'
        ),
      },
    ])

    const unsignedTx = {
      txData: {
        transaction: createVersionedTransaction(publicKey),
      },
    }
    const { txId, rawTx } = await signHardware({
      unsignedTx,
      hardwareDevice: mockHardwareDevice,
      accountIndex,
    })
    const rawTxBytes = Buffer.from(rawTx, 'base64')
    const decodedTransaction = VersionedTransaction.deserialize(rawTxBytes)
    expect(txId).toBe(
      '3MWPvyeoU6aevf9vJzGzNq2rzrJhndpDpWeDpkorq8V5JMMkeR1UyXiKd4UaAHWPz5wuuKsL4XfFbvjUoVf7jMoX'
    )
    expect(rawTx).toBe(
      'AXW34k3x6W1QEZTvMQ9L+v/Te3YmHDpLaUBxyOHwPrMjoOg56/mN52BBnizcxPIcNTZGPs/s7Zh2/7Kpavzc1QqAAQABAknEfOmtneWyiWPHmQjBwpA26V4OnjbIgq+x6P2aXzcHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACGzx5orjJNIvOsvT/tCYRhIuZ3dOFjHG2SJ4TRpn8AjAEBAgAADAIAAADoAwAAAAAAAAA='
    )
    expect(decodedTransaction).toBeDefined()
  })
})

const createLegacyTransaction = (publicKey) => {
  const _publicKey = new PublicKey(publicKey)
  const recentBlockhash = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'
  const transaction = new Transaction({
    recentBlockhash,
    feePayer: _publicKey,
  })
  transaction.add(
    new TransactionInstruction({
      keys: [
        {
          isSigner: true,
          isWritable: true,
          pubkey: _publicKey,
        },
      ],
      programId: _publicKey,
    })
  )
  return transaction
}

const createLegacyTransactionMultipleSignatures = (publicKey) => {
  const _publicKey = new PublicKey(publicKey)
  const recentBlockhash = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'
  const transaction = new Transaction({
    recentBlockhash,
    feePayer: _publicKey,
  })

  const someOtherKey = Keypair.fromSecretKey(
    Buffer.from(
      '2f2a61c9810b010266930f90f2489051e18df19669e73e3d1b2f5683d3d8c20ddc98e02f49f12937c5974278ee29a85b2839051cf36431b720900c4afbdfa6ac',
      'hex'
    )
  )

  transaction.add(
    new TransactionInstruction({
      keys: [
        {
          isSigner: true,
          isWritable: true,
          pubkey: _publicKey,
        },
        {
          isSigner: true,
          isWritable: true,
          pubkey: someOtherKey.publicKey,
        },
      ],
      programId: _publicKey,
    })
  )
  transaction.partialSign(someOtherKey)
  return transaction
}

const createVersionedTransaction = (publicKey) => {
  const _publicKey = new PublicKey(publicKey)
  const recentBlockhash = 'A5EotUB6U3m5FQ7H5anvz9ZLZYjLLm7EMYEZXYLmAWHH'
  const transactionMessage = new TransactionMessage({
    recentBlockhash,
    payerKey: _publicKey,
    instructions: [
      SystemProgram.transfer({
        fromPubkey: _publicKey,
        toPubkey: _publicKey,
        lamports: 1000,
      }),
    ],
  })
  const messageV0 = transactionMessage.compileToV0Message()

  return new VersionedTransaction(messageV0)
}
