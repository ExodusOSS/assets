export function decodeLength(bytes) {
  let len = 0
  let size = 0
  for (;;) {
    const elem = bytes.shift()
    len |= (elem & 0x7f) << (size * 7)
    size += 1
    if ((elem & 0x80) === 0) {
      break
    }
  }

  return len
}

export function encodeLength(bytes, len) {
  let remLen = len
  for (;;) {
    let elem = remLen & 0x7f
    remLen >>= 7
    if (remLen === 0) {
      bytes.push(elem)
      break
    } else {
      elem |= 0x80
      bytes.push(elem)
    }
  }
}
