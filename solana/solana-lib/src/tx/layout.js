import { Blob } from '@exodus/buffer-layout'
import { PublicKey } from '@exodus/solana-web3.js'

class PublicKeyLayout extends Blob {
  constructor(property) {
    super(32, property)
  }

  decode(b, offset) {
    return new PublicKey(super.decode(b, offset))
  }

  encode(src, b, offset) {
    return super.encode(src.toBuffer(), b, offset)
  }
}

export function publicKeyLayout(property) {
  return new PublicKeyLayout(property)
}
