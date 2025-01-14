// metadata structs: https://github.com/metaplex-foundation/metaplex/blob/master/js/packages/common/src/actions/metadata.ts

import { BinaryReader, BinaryWriter } from 'borsh'
import bs58 from 'bs58'

BinaryReader.prototype.readPubkeyAsString = function () {
  const array = this.readFixedArray(32)
  return bs58.encode(array)
}

BinaryWriter.prototype.writePubkeyAsString = function (value) {
  this.writeFixedArray(bs58.decode(value))
}

class Data {
  constructor(args) {
    this.name = args.name
    this.symbol = args.symbol
    this.uri = args.uri
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints
    this.creators = args.creators
  }
}

class Creator {
  constructor(args) {
    this.address = args.address
    this.verified = args.verified
    this.share = args.share
  }
}

export class Metadata {
  constructor(args) {
    this.key = '' // MetadataKey.MetadataV1;
    this.updateAuthority = args.updateAuthority
    this.mint = args.mint
    this.data = args.data
    this.primarySaleHappened = args.primarySaleHappened
    this.isMutable = args.isMutable
    this.editionNonce = args.editionNonce || null
  }
}

export const METADATA_SCHEMA = new Map([
  [
    Data,
    {
      kind: 'struct',
      fields: [
        ['name', 'string'],
        ['symbol', 'string'],
        ['uri', 'string'],
        ['sellerFeeBasisPoints', 'u16'],
        ['creators', { kind: 'option', type: [Creator] }],
      ],
    },
  ],
  [
    Creator,
    {
      kind: 'struct',
      fields: [
        ['address', 'pubkeyAsString'],
        ['verified', 'u8'],
        ['share', 'u8'],
      ],
    },
  ],
  [
    Metadata,
    {
      kind: 'struct',
      fields: [
        ['key', 'u8'],
        ['updateAuthority', 'pubkeyAsString'],
        ['mint', 'pubkeyAsString'],
        ['data', Data],
        ['primarySaleHappened', 'u8'], // bool
        ['isMutable', 'u8'], // bool
        ['editionNonce', { kind: 'option', type: 'u8' }],
      ],
    },
  ],
])
