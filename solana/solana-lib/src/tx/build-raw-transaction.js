import { PACKET_DATA_SIZE } from '../vendor/index.js'

// Copied from:
// https://github.com/solana-labs/solana-web3.js/blob/42612c936d8d4ddbcb09dbb73db9e1aeaf6d8764/src/util/shortvec-encoding.ts#L15-L28.
function encodeLength(bytes, length) {
  let remainingLength = length

  for (;;) {
    let element = remainingLength & 0x7f

    remainingLength >>= 7
    if (remainingLength === 0) {
      bytes.push(element)
      break
    }

    element |= 0x80
    bytes.push(element)
  }
}

// As per:
// https://github.com/solana-labs/solana-web3.js/blob/61433de0d39686c6ad4f0b3cb5b95a68a058aa04/src/transaction.ts#L682
const MAX_SIGNATURES = 255

export const SIGNATURE_LENGTH = 64

export function buildRawTransaction(signData, signatures) {
  const signatureCount = []
  encodeLength(signatureCount, signatures.length)

  const signaturesLength = signatureCount.length + signatures.length * SIGNATURE_LENGTH
  const rawTransactionLength = signData.length + signaturesLength

  if (signatures.length > MAX_SIGNATURES) {
    throw new Error(`Too many signatures: ${signatures.length} > ${MAX_SIGNATURES}`)
  }

  if (rawTransactionLength > PACKET_DATA_SIZE) {
    throw new Error(`Transaction too large: ${rawTransactionLength} > ${PACKET_DATA_SIZE}`)
  }

  const rawTransaction = Buffer.alloc(rawTransactionLength)
  Buffer.from(signatureCount).copy(rawTransaction)

  signatures.forEach((signature, index) => {
    if (signature === null) {
      return
    }

    if (signature.length !== SIGNATURE_LENGTH) {
      throw new Error('Invalid signature length')
    }

    Buffer.from(signature).copy(rawTransaction, signatureCount.length + index * SIGNATURE_LENGTH)
  })

  signData.copy(rawTransaction, signaturesLength)

  return rawTransaction
}
