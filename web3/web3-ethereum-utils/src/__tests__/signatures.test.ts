import { signMessage, signTransaction, signTypedData } from '../signatures.js'

const privateKey = Buffer.from(
  'f6ec71d57d15079622ae1b4d80153904ff9697dbc4aa07101a2b15ee808714a0',
  'hex',
)

describe('signMessage', () => {
  it('signs the message and returns its signature', () => {
    const message = '0xdeadbeaf'
    const expectedSignature =
      '0x81bf26d27302995510012f368c902187d4074647b04ef44bf5ac4c7615eba32c02f154fc8cc8cdefd38ef907a0e8714dc2ba1eef5792e7d22687edce692516a81c'

    const signature = signMessage(message, privateKey)

    expect(signature).toBe(expectedSignature)
  })
})

describe('signTypedData', () => {
  describe('V1', () => {
    it('signs valid typed data and returns its signature', () => {
      const typedData = [
        { type: 'string', name: 'A message', value: 'Hi, Alice!' },
        { type: 'uint32', name: 'A number', value: '1337' },
      ]
      const expectedSignature =
        '0xb80309cfa1bd67e743aad09bf31d897c5a837bcc938ab81c8131a4c76972cdbe516e917290bf069d3e4f53d6158f6175bbd487be9284baa73f9fc107bd2e28f91b'

      const signature = signTypedData(typedData, privateKey, 'V1')

      expect(signature).toBe(expectedSignature)
    })

    it('throws if no data', () => {
      const typedData = []

      expect(() => {
        signTypedData(typedData, privateKey, 'V1')
      }).toThrow('Expect argument to be non-empty array')
    })
  })

  describe('V4', () => {
    it('signs minimal valid typed data and returns its signature', () => {
      const typedData = {
        types: {
          EIP712Domain: [],
        },
        primaryType: 'EIP712Domain',
        domain: {},
        message: {},
      }
      const expectedSignature =
        '0xacdec34677b7ec7c2488d156c73499e82767f5c30f94b2dcdd09c29d5d99c14a4c2ec3a2aeed481aa3652e4f7690a0ec02ec8d9ebc4fb4d4ea87a11bf8d198701b'

      const signature = signTypedData(typedData, privateKey, 'V4')

      expect(signature).toBe(expectedSignature)
    })

    it('signs valid typed data with domain separator using all fields', () => {
      const typedData = {
        types: {
          EIP712Domain: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'version',
              type: 'string',
            },
            {
              name: 'chainId',
              type: 'uint256',
            },
            {
              name: 'verifyingContract',
              type: 'address',
            },
            {
              name: 'salt',
              type: 'bytes32',
            },
          ],
        },
        primaryType: 'EIP712Domain',
        domain: {
          name: 'exodus.com',
          version: '1',
          chainId: 1,
          verifyingContract: '0x0000000000000000000000000000000000000000',
          salt: Buffer.from(new Int32Array([1, 2, 3])),
        },
        message: {},
      }
      const expectedSignature =
        '0xa343e242eebde82221d03df738aa4488c1469292643f5c03c354cdd2214c8957597b8e38240d20c87596cfd173e0fd729fcc70636a7d8adac487e274dca72a4c1c'

      const signature = signTypedData(typedData, privateKey, 'V4')

      expect(signature).toBe(expectedSignature)
    })

    it('signs valid typed data and returns its signature', () => {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1.23.2',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            meta: { name: 'kranthi' },
          },
          contents: 'Hello, Bob!',
        },
      }
      const expectedSignature =
        '0xfd1694a44ea52cdef9e851bccad9b49d78667adecdf7fa9d8ae6ca424a40f5ed157feac31ea12926dab1400bb1401d1809f08b947d68d90e3bd1f0254554ea741b'

      const signature = signTypedData(typedData, privateKey, 'V4')

      expect(signature).toBe(expectedSignature)
    })

    it('throws if "types" has an unknown type', () => {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'aa' },
            { name: 'wallet', type: 'address' },
          ],
        },
        primaryType: 'Person',
        domain: {
          name: 'Ether Mail',
          version: '1.23.2',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          name: '',
          wallet: '',
        },
      }

      expect(() => signTypedData(typedData, privateKey, 'V4')).toThrow(
        'Unsupported or invalid type',
      )
    })

    it('throws if "message" does not have a required field', () => {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'string' },
          ],
        },
        primaryType: 'Person',
        domain: {
          name: 'Ether Mail',
          version: '1.23.2',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          name: '', // 'wallet' is intentionally missed.
        },
      }

      expect(() => signTypedData(typedData, privateKey, 'V4')).toThrow(
        'missing value for field wallet',
      )
    })

    it('throws if "message" has an invalid type of a value', () => {
      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'string' },
          ],
        },
        primaryType: 'Person',
        domain: {
          name: 'Ether Mail',
          version: '1.23.2',
          chainId: 1,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          name: '',
          wallet: true, // 'wallet' intentionally has a 'boolean' type.
        },
      }

      expect(() => signTypedData(typedData, privateKey, 'V4')).toThrow(
        'invalid type',
      )
    })

    it('throws if minimal valid typed data not provided', () => {
      const typedData = {
        types: {
          EIP712Domain: [],
        },
        domain: {},
        message: {},
      }

      expect(() => {
        signTypedData(typedData, privateKey, 'V4')
      }).toThrow(TypeError)
    })
  })
})

describe('signTransaction', () => {
  const baseTransaction = {
    from: '0xb60e8dd61c5d32be8058bb8eb970870f07233155',
    to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
    gasLimit: '0x76c0',
    gasPrice: '0x9184e72a000',
    value: '0x9184e72a',
    data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
  }
  const legacyTransaction = {
    ...baseTransaction,
  }
  const eip1559Transaction = {
    ...baseTransaction,
    maxFeePerGas: '0x9184e72a000',
    maxPriorityFeePerGas: '0x59682F00',
  }

  it('signs legacy transactions and returns the serialized signed transaction', () => {
    const expectedRawTransaction =
      '0xf892808609184e72a0008276c094d46e8dd67c5d32be8058bb8eb970870f07244567849184e72aa9d46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f07244567523a058e0dd0902d3445b7b04e2ddaca775430467c63859216a52594e8e32511e842ca06b1ca7e908c29d106bb318960bfc6d447f6d12e484029737fdecbb95da38810d'

    const signedTransaction = signTransaction(legacyTransaction, privateKey)

    const rawTransaction = `0x${signedTransaction.toString('hex')}`
    expect(rawTransaction).toBe(expectedRawTransaction)
  })

  it('signs EIP1559 transactions and returns the serialized signed transaction', () => {
    const expectedRawTransaction =
      '0x02f89980808459682f008609184e72a0008276c094d46e8dd67c5d32be8058bb8eb970870f07244567849184e72aa9d46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675c080a033c9dc32576fe9088217ee90b6a7bd98805c792586db831ff80f4b449924aab2a00cd56580c73076e502a78313a9985787566ec571e8c211a7424c9a77ca6cd9f1'

    const signedTransaction = signTransaction(eip1559Transaction, privateKey)

    const rawTransaction = `0x${signedTransaction.toString('hex')}`
    expect(rawTransaction).toBe(expectedRawTransaction)
  })
})
