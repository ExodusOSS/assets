import * as BufferLayout from '@exodus/buffer-layout'
import { hashSync } from '@exodus/crypto/hash'

import { bnAmountU64, publicKey } from '../vendor/utils/layout.js'

const idl = {
  initializeEscrow: {
    name: 'initialize_escrow2',
    layout: BufferLayout.struct([bnAmountU64('takerAmount'), BufferLayout.u8('escrowBump')]),
  },
  cancelEscrow: {
    name: 'cancel_escrow',
    layout: BufferLayout.struct([]),
  },
  exchange: {
    name: 'exchange2',
    layout: BufferLayout.struct([bnAmountU64('expectedTakerAmount'), publicKey('expectedMint')]),
  },
}

export function sighash(nameSpace, ixName) {
  const preimage = `${nameSpace}:${ixName}`

  return hashSync('sha256', preimage).slice(0, 8)
}

export function encodeData(name, args = {}) {
  const idlInstruction = idl[name]

  const buffer = Buffer.alloc(idlInstruction.layout.span)
  const len = idlInstruction.layout.encode(args, buffer)

  return Buffer.concat([sighash('global', idlInstruction.name), buffer.slice(0, len)])
}
