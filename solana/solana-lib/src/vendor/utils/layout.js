import * as BufferLayout from '@exodus/buffer-layout'
import BN from 'bn.js'

/**
 * Layout for a public key
 */
export const publicKey = (property = 'publicKey') => {
  return BufferLayout.blob(32, property)
}

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property = 'uint64') => {
  return BufferLayout.blob(8, property)
}

/**
 * Layout for a Rust String type
 */
export const rustString = (property = 'string') => {
  const rsl = BufferLayout.struct(
    [
      BufferLayout.u32('length'),
      BufferLayout.u32('lengthPadding'),
      BufferLayout.blob(BufferLayout.offset(BufferLayout.u32(), -8), 'chars'),
    ],
    property
  )
  const _decode = rsl.decode.bind(rsl)
  const _encode = rsl.encode.bind(rsl)

  rsl.decode = (buffer, offset) => {
    const data = _decode(buffer, offset)
    return data.chars.toString('utf8')
  }

  rsl.encode = (str, buffer, offset) => {
    const data = {
      chars: Buffer.from(str, 'utf8'),
    }
    return _encode(data, buffer, offset)
  }

  rsl.alloc = (str) => {
    return BufferLayout.u32().span + BufferLayout.u32().span + Buffer.from(str, 'utf8').length
  }

  return rsl
}

/**
 * Layout for an Authorized object
 */
export const authorized = (property = 'authorized') => {
  return BufferLayout.struct([publicKey('staker'), publicKey('withdrawer')], property)
}

/**
 * Layout for a Lockup object
 */
export const lockup = (property = 'lockup') => {
  return BufferLayout.struct(
    [BufferLayout.ns64('unixTimestamp'), BufferLayout.ns64('epoch'), publicKey('custodian')],
    property
  )
}

export const bnAmountU64 = (property) => {
  const rsl = BufferLayout.blob(8, property)

  const _decode = rsl.decode.bind(rsl)
  const _encode = rsl.encode.bind(rsl)

  rsl.decode = (b, offset = 0) => {
    return new BN(_decode(b, offset), 10, 'le')
  }

  rsl.encode = (src, b, offset = 0) => {
    return _encode(src.toArrayLike(Buffer, 'le', 8), b, offset)
  }

  return rsl
}

export function getAlloc(type, fields) {
  let alloc = 0
  type.layout.fields.forEach((item) => {
    if (item.span >= 0) {
      alloc += item.span
    } else if (typeof item.alloc === 'function') {
      alloc += item.alloc(fields[item.property])
    }
  })
  return alloc
}
