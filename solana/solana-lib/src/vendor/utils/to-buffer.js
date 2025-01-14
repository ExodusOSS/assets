export const toBuffer = (arr) => {
  if (arr instanceof Buffer) {
    return arr
  }

  if (arr instanceof Uint8Array) {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
  }

  return Buffer.from(arr)
}
