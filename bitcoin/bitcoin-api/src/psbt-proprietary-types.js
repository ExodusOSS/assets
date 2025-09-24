/*
 * Set of utilities to add proprietary use types to PSBT
 * see https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#proprietary-use-type
 */

import assert from 'minimalistic-assert'
import varuint from 'varuint-bitcoin'

const IDENTIFIER = 'exodus'
const PROP_TYPE_MARKER = 0xfc

export const SubType = Object.freeze({
  BlockHeight: 0x01,
})

const buildPropKey = (subType) => {
  const idBuf = Buffer.from(IDENTIFIER, 'utf8')
  const parts = [
    Buffer.from([PROP_TYPE_MARKER]),
    varuint.encode(idBuf.length),
    idBuf,
    varuint.encode(subType),
  ]
  return Buffer.concat(parts)
}

const u32LE = (n) => {
  const b = Buffer.allocUnsafe(4)
  b.writeUInt32LE(n >>> 0, 0)
  return b
}

const findProprietaryVal = (unknownArr, subType) => {
  if (!unknownArr) return

  const prefix = buildPropKey(subType)

  return unknownArr.find((kv) => kv.key.equals(prefix))
}

export const writePsbtBlockHeight = (psbt, height) => {
  assert(
    Number.isInteger(height) && height >= 0 && height <= 4_294_967_295,
    'blockHeight must be a positive number between 0 and 4294967295'
  )

  psbt.addUnknownKeyValToGlobal({ key: buildPropKey(SubType.BlockHeight), value: u32LE(height) })
}

export const readPsbtBlockHeight = (psbt) => {
  const kv = findProprietaryVal(psbt.data.globalMap.unknownKeyVals, SubType.BlockHeight)
  return kv ? kv.value.readUInt32LE(0) : undefined
}
