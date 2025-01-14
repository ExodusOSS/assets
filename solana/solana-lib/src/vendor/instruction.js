import * as Layout from './utils/layout.js'

/**
 * @typedef {Object} InstructionType
 * @property (index} The Instruction index (from solana upstream program)
 * @property (BufferLayout} The BufferLayout to use to build data
 */

/**
 * Populate a buffer of instruction data using an InstructionType
 */
export function encodeData(type, fields) {
  const allocLength = type.layout.span >= 0 ? type.layout.span : Layout.getAlloc(type, fields)
  const data = Buffer.alloc(allocLength)
  const layoutFields = Object.assign({ instruction: type.index }, fields)
  type.layout.encode(layoutFields, data)
  return data
}

/**
 * Decode instruction data buffer using an InstructionType
 */
export function decodeData(type, buffer) {
  let data
  try {
    data = type.layout.decode(buffer)
  } catch (err) {
    throw new Error('invalid instruction; ' + err)
  }

  if (data.instruction !== type.index) {
    throw new Error(
      `invalid instruction; instruction index mismatch ${data.instruction} != ${type.index}`
    )
  }

  return data
}
