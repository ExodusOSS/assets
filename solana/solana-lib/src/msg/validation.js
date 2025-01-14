import { Message } from '@exodus/solana-web3.js'
import assert from 'minimalistic-assert'

/**
 * Checks if its contains a legacy message.
 * @param {Uint8Array} data
 * @returns {boolean}
 */
function isLegacyMessage(data) {
  try {
    const message = Message.from(data)
    message.serialize() // Invalid messages will throw on serialization.
    return true
  } catch {
    return false
  }
}

/**
 * Checks if its contains a versioned message.
 * @param {Uint8Array} data
 * @returns {boolean}
 */
function isVersionedMessage(data) {
  if (data.length > 1) {
    // We deploy a heuristic to detect transaction messages.
    // The first bytes of a transaction message contains its version number
    // so we ban all bytes starting at 0x80 and ending at 0xFE
    // 0xFF is allowed because that is used for offchain messages
    return data[0] >= 0x80 && data[0] !== 0xff
  }

  return false
}

/**
 * Check whether a message contains a transaction message.
 * @param {Uint8Array} data
 * @returns {boolean}
 */
export function isTransactionMessage(data) {
  const messageBuffer = Buffer.from(data)
  return isLegacyMessage(messageBuffer) || isVersionedMessage(messageBuffer)
}

/**
 * Asserts that the message provided to the sign message functions has the expected shape
 * @param message
 */
export function assertValidMessage(message) {
  const { rawMessage } = message
  assert(Buffer.isBuffer(rawMessage), `rawMessage must be buffer`)
  assert(
    !isTransactionMessage(rawMessage),
    `malicious message signing request, was a transaction message`
  )

  return message
}
